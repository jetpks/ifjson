ifjson
===

There may come a time in your life where it's necessary for you to get networking information in your node apps. ifjson allows you to do just that.

Notes:
---
Only works on GNU/Linux. Does not work with BSD systems.

Example Output:
---
[
  {
    "ipaddr": "192.168.1.102",
    "netmask": "255.255.255.0",
    "cidr": "24",
    "gateway": "192.168.1.1"
  },
  {
    "ipaddr": "10.19.2.12",
    "netmask": "255.255.0.0",
    "cidr": "16",
    "gateway": "10.19.0.1"
  }
]

TODO List:
---
1. Add interface names to the object.
2. Add BSD support.
3. Sort by metric using a better method.
4. Add more information to the objects.
