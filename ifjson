#!/usr/local/bin/node

(function () {
  "use strict";

  require('./ifjson.js').getIpInfo(function (ifaces) {
    console.log(JSON.stringify(ifaces, null, '  '));
  });
}());
