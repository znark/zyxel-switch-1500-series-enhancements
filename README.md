# ZyXEL Switch 1500 Series Web Management Enhancements

## Overview

This repository carries browser-based (userscript) enhancements to the web-based management interface of the *ZyXEL Switch 1500 Series* Ethernet switches.

It also holds some observations about the potential hackability of the firmware of these switches.

### Targeted models

The *ZyXEL Switch 1500 Series* product family comprises of the following models:

- [ZyXEL ES-1528](https://www.zyxel.com/support/SupportLandingSR.shtml?c=gb&l=en&md=ES-1528) — 28-port Fast Ethernet switch (`ftp://ftp2.zyxel.com/ES-1528/`)
- [ZyXEL ES-1552](https://www.zyxel.com/support/SupportLandingSR.shtml?c=gb&l=en&md=ES-1552) — 52-port Fast Ethernet switch (`ftp://ftp2.zyxel.com/ES-1552/`)
- [ZyXEL GS-1524](https://www.zyxel.com/support/SupportLandingSR.shtml?c=gb&l=en&md=GS-1524) — 24-port Gigabit Ethernet switch (`ftp://ftp2.zyxel.com/GS-1524/`)
- [ZyXEL GS-1548](https://www.zyxel.com/support/SupportLandingSR.shtml?c=gb&l=en&md=GS-1548) — 48-port Gigabit Ethernet switch (`ftp://ftp2.zyxel.com/GS-1548/`)

All models share a similar UI and firmware but are now at EOL (from the manufacturer’s perspective) and have not received firmware updates since 2007.

### Who is this for?

This type of a “smart switch” comes in a large metal case with dozens of Ethernet ports. The devices are primarily meant to be rack-mounted in a server room or in a network equipment cabinet. At least the gigabit models (GS series) have loud fans unless you replace or modify them.

Network gear of this caliber, and of 2007 vintage, is now mostly of interest to:

- Hobbyists who do not have much of a budget but need a large number of Ethernet ports for a wired home network, or for some specific project or purpose, or
- IT admins who represent an organization which also does not have an actual budget to buy recent hardware.

Second-hand units are available from the usual sources (eBay etc.) — sometimes for a bargain price.

## Userscript-based enhancements

Currently, there is only a single enhancement available, but it is [the one that is the most sought-after](https://berry120.blogspot.com/2014/11/zyxel-es-1552-removing-ports-from.html):

- **Allow removing ports from VLAN 1 in the Web Management UI.** This enhancement allows the network administrator to remove ports from VLAN 1. This is an action which ZyXEL has, for some inexplicable reason, deliberately tried to prevent in the original WebManagement UI code.

As of now, enhancements stored in this repository are implemented as userscripts which run in your browser. See the [userscripts directory](userscripts/) for more information.

## Firmware-based enhancements

It is theoretically possible to modify the firmware of these switches to fix some issues or to make the management UI look fresher or operate in a more convenient manner.

Some observations about this avenue can be found in the [firmware directory](firmware/).

## License

The content of this repository is licensed under the MIT License. See [LICENSE](LICENSE) for the details.

