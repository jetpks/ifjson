(function () {
  "use strict";

  var exec = require('child_process').exec
    , result
    , completionCallback
    ;

  function parseIpOutput(error, stdout, stderr) {
    var ifaces_raw = stdout.split('\n')
      , ifaces = []
      ;

    ifaces_raw.pop();
    ifaces_raw.forEach(function(iface) {
      var ipPair = iface.split(' ');
      // Convert the cidr bits to a netmask.

      var netmask = ''
        , octets = [ 0, 1, 2, 3 ]
        , bits = ipPair[1]
        ;
      octets.forEach(function(octet) {
        if(octet != 0) {
          netmask += '.'
        }
        if(bits >= 8) {
          netmask += (Math.pow(2, 8) - 1).toString();
          bits -= 8;
        } else {
          netmask += (256 - Math.pow(2, (8 - bits))).toString();
          bits = 0;
        }
      });

      ifaces.push({ "ipaddr": ipPair[0], "netmask": netmask, "cidr": ipPair[1] });
    });

    function parseRouteOutput(error, stdout, stderr) {

      var raw_routes = stdout.split('\n')
        , routes = []
        , primary_route = {}
        ;
      raw_routes.forEach(function(route) {
        var hex_route = {}
          ;
        // Empty line? return..
        if(route == '') {
          return;
        }

        // JSONIFY!
        try {
          hex_route = JSON.parse(route);
        } catch(e) {
          console.log('exception caught');
          return;
        }

        // Check for default-route-ness
        if(hex_route.flags !== '0003') {
          return;
        }

        // Turn that little endian hex IP into a regular IP:
        var raw_ip = hex_route.gateway.match(/\w\w/g).reverse()
          , good_ip = ''
          ;
        raw_ip.forEach(function(octet, index) {
          if(index) {
            good_ip += '.';
          }
          good_ip += parseInt(octet, 16);
        });
        hex_route.gateway = good_ip;
        routes.push(hex_route);
      });
      // Find the lowest metric and set that route to primary_route.
      primary_route.metric = 9999999999;
      routes.forEach(function(route) {
        if(route.metric < primary_route.metric) {
          primary_route = route;
        }
      });
      if(primary_route.metric == 9999999999) {
        primary_route.gateway = null;
      }
      // Now we're ready to put it on its way:
      ifaces.forEach(function(iface) {
        iface.gateway = primary_route.gateway;
      });

      completionCallback(ifaces);
    }

//    exec('ip route show | grep default | awk \'{ print $3 }\' | tr \'\\n\' \' \' | sed \'s/ //g\'', parseRouteOutput);
    exec('cat /proc/net/route | grep -v Iface | awk \'{ print "{ \\"iface\\":\\""$1"\\",\\"gateway\\":\\""$3"\\",\\"flags\\":\\""$4"\\",\\"metric\\":\\""$7"\\" }"; }\'', parseRouteOutput);
  }

  // TODO: clean up callback pathing
  function getIpInfo(callback) {
    completionCallback = callback || function (ifaces) {
        console.log(JSON.stringify(ifaces));
    };
    exec('ip addr show | grep inet | grep -v 127.0.0.1 | grep -v inet6 | awk \'{ print $2 }\' | sed "s/\\// /g"', parseIpOutput);
  }

  module.exports.getIpInfo = getIpInfo;
}());
