# Firmware-Based Enhancements

## Overview

This document holds some notes about the possibility of modifying the firmware of the *ZyXEL Switch 1500 Series* Ethernet switches.

Some enhancements which are now implemented as browser-based userscripts could be incorporated into the firmware image itself and flashed onto the device. This would require finding a sufficiently easy and safe way to modify, repackage, and flash a new firmware image onto the device.

## Architecture

### System chip (ASIC, SoC)

The *ZyXEL Switch 1500 Series* switches appear to be based on Broadcom Ethernet Switch SoCs and MIPS CPU cores.

Manufacturer’s firmware update packages contain information that suggest the SoCs used are...

- [BCM5348](https://www.broadcom.com/products/ethernet-connectivity/switching/roboswitch/bcm5348) for the ES-1528 and the ES-1552

- [BCM53718](https://www.alldatasheet.com/datasheet-pdf/pdf/175918/BOARDCOM/BCM53718.html) for the GS-1524 and the GS-1548

...or related SoCs belonging to these families. (Not confirmed yet.)

### Console port (serial port)

[A TTL-level console port](https://openwrt.org/docs/techref/hardware/port.serial) very likely exists on the PCB even though none of the models in the product family officially support one or make it externally accessible. (Not confirmed yet.)

## Firmware

### Bootloader

The official firmware upgrade instructions available on the manufacturer’s site contain a PDF document which suggests the switches in this product family use Broadcom [CFE](https://en.wikipedia.org/wiki/Common_Firmware_Environment) (Common Firmware Environment) as their bootloader.

The OpenWrt project maintains [some practical information](https://oldwiki.archive.openwrt.org/doc/techref/bootloader/cfe) about this bootloader type.

### Operating system

The firmware appears to be based on [eCos](https://en.wikipedia.org/wiki/ECos), or the “Embedded Configurable Operating System”, which is an open-source real-time operating system.

### Web-based management UI

- The switch has an IP address on VLAN 1 and responds from the standard HTTP port (TCP/80), which provides the primary management interface.
- HTTPS is not implemented.

The header strings found in the HTML templates stored inside the firmware image suggest many of them have originally been designed using Microsoft FrontPage (!).

### Command-line interface

- The switch has an IP address on VLAN 1 and responds from the standard telnet port (TCP/23).
- SSH is not implemented.

The offered command-line interface is very rudimentary and does not give access to advanced management functionality. (It is possible there are more advanced hidden modes and commands that can be activated via an undocumented command or control code sequence.)

Studying the strings in the firmware image suggests it includes some Broadcom or eCos-specific hidden command-line interfaces with more advanced commands. Whether these are actually accessible via the telnet interface is currently not known.

### Other interfaces

Other interfaces / protocols the documentation mentions are:

- (BSD) syslog-compatible logging over UDP
- MIBs
  - RFC 1213 SNMP MIB II
    - MIB II - System
    - MIB II - Interface
  - RFC 1398 MIB - Ether-like
  - RFC 1157 SNMP v1
  - RFC 1155 SMI
  - RFC 2674 SNMPv2, SNMPv2c
  - RFC 2819 RMON (“RMON-Lite”)
    - Group 1 (Statistics)
    - Group 2 (History)
    - Group 3 (Alarm)
    - Group 4 (Event)

### Firmware upgrades

Firmware upgrade files are available on the manufacturer’s site for each of the models. The last official updates are from 2007.

A firmware upgrade can be performed via the web-based management UI. However, the included PDF files seem to refer to a console port, CFE and TFTP-based update procedure — it is just that these switches do not have an externally-accessible console port.

### Firmware update file format

The format of the firmware `.bin` file appears to be simple [gzip-compressed](https://en.wikipedia.org/wiki/Gzip) ELF image.

The standard header of the gzip file (as defined in [RFC 1952](https://datatracker.ietf.org/doc/html/rfc1952)) includes some unusual information though:

- The gzip header field `FNAME` stores the original name of the uncompressed image. This file name is not the same as the external file name. The name embedded in the gzip header contains a reference to the SoC type and to the ZyXEL firmware versioning scheme.

  Examples of embedded firmware image names from the latest firmware upgrade packages:

  - ES-1528: `SSS-BCM5348-V1.12(ARD.3)`
  - ES-1552: `SSS-BCM5348-V1.12\(ARS.2\)`
  - GS-1524: `SSS-BCM53718-V1.12\(AYX.0\)C0`
  - GS-1548: `SSS-BCM53718-V1.12\(AYX.0\)C0`

- The gzip `MTIME` field contains a timestamp from 2007.

- The rarely-used gzip `FCOMMENT` field is also included, and seems to serve a special purpose. It contains an ASCII-encoded hexadecimal identifier carrying six bytes of data.

  **Example:** `000FF8DFC1C1`

  This is possibly...

  - a device type code and/or
  - a CRC of some sort, or
  - a binary version field of some kind.

  When studying older firmware releases, the five leftmost hexadecimal digits (nybbles) seem to remain fixed for a particular device/model type while the remaining seven digits on the right change from one firmware file to the next.

  It seems likely that the firmware upgrade logic in the web-based management UI, at least, would use this field to validate the firmware file. (Not confirmed yet.)

- The gzip compression type is the standard `DEFLATE`, and the `XFL` field is set to 2, meaning the best (maximum) compression.

## Tools

### Analyzing gzip files

- The lesser-used (or seen) gzip header fields mentioned above can be inspected e.g. by utilizing the C code in this simple project...

  - [tiwaana/c-gzip](tiwaana/c-gzip)

  ... although it does not print out all the information by default (you need to add some `printf` calls by yourself).

- [Python’s gzip implementation](https://docs.python.org/3/library/gzip.html) does not support the `FCOMMENT` field outright (just skips it) but it could be patched to support it quite easily.

- Perl’s [IO::Compress::Gzip](https://perldoc.perl.org/IO::Compress::Gzip) apparently does support the `FCOMMENT` field.

### General inspection of the uncompressed firmware

Standard tools such as `strings` and `binwalk --signature` spit out a lot of interesting information about an uncompressed firmware image.

#### Binwalk

Here’s what `binwalk` says about the latest (last) GS-1548 firmware:

```

DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
0             0x0             ELF, 32-bit LSB executable, MIPS, version 1 (SYSV)
4112          0x1010          eCos kernel exception handler, architecture: MIPSEL, exception vector table base address: 0x80000200
4224          0x1080          eCos kernel exception handler, architecture: MIPSEL, exception vector table base address: 0x80000200
2660028       0x2896BC        eCos RTOS string reference: "ECOSEND"
2660595       0x2898F3        eCos RTOS string reference: "ECOS shell"
2660612       0x289904        eCos RTOS string reference: "ecos>"
2663596       0x28A4AC        eCos RTOS string reference: "ecos-pci-bde"
2706892       0x294DCC        eCos RTOS string reference: "ecos_end"
2716046       0x29718E        Copyright string: "Copyright (c) 1998-2005 Broadcom Corporation"
2802245       0x2AC245        eCos RTOS string reference: "eCosPriority"
2852973       0x2B886D        eCos RTOS string reference: "eCosPriority"
2866032       0x2BBB70        eCos RTOS string reference: "ecos"
2953630       0x2D119E        eCos RTOS string reference: "ECOS"
2984150       0x2D88D6        eCos RTOS string reference: "ECOS"
2989160       0x2D9C68        eCos RTOS string reference: "ECOS"
2989217       0x2D9CA1        eCos RTOS string reference: "ECOS"
2989288       0x2D9CE8        eCos RTOS string reference: "ECOS"
2989343       0x2D9D1F        eCos RTOS string reference: "ECOS"
3221344       0x312760        eCos RTOS string reference: "eCos_node"
3231472       0x314EF0        eCos RTOS string reference: "ecos-2.0/packages/net/snmp/lib/v2_0/src/snmp_api.c"
3255036       0x31AAFC        eCos RTOS string reference: "eCos.snmp.mib2.rmon-Invalid etherStats var!"
3255176       0x31AB88        eCos RTOS string reference: "eCos.snmp.mib2.rmon-Invalid histControl var!"
3255256       0x31ABD8        eCos RTOS string reference: "eCos.snmp.mib2.rmon-Invalid histStats var!"
3255304       0x31AC08        eCos RTOS string reference: "eCos.snmp.mib2.rmon-Invalid alarm var!"
3255396       0x31AC64        eCos RTOS string reference: "eCos.snmp.mib2.rmon-Invalid event var!"
3255468       0x31ACAC        eCos RTOS string reference: "eCos.snmp.mib2.rmon-Invalid log var!"
3295283       0x324833        HTML document header
3295701       0x3249D5        HTML document footer
3295720       0x3249E8        GIF image data, version "87a", 50 x 25
3296547       0x324D23        HTML document header
3301152       0x325F20        HTML document footer
3301980       0x32625C        HTML document header
3302223       0x32634F        HTML document footer
3302268       0x32637C        GIF image data, version "89a", 8 x 8
3302360       0x3263D8        GIF image data, version "89a", 167 x 50
3307420       0x32779C        GIF image data, version "89a", 12 x 95
3308344       0x327B38        GIF image data, version "89a", 16 x 16
3308700       0x327C9C        GIF image data, version "89a", 16 x 16
3309264       0x327ED0        GIF image data, version "89a", 16 x 16
3309828       0x328104        GIF image data, version "89a", 16 x 16
3310392       0x328338        JPEG image data, JFIF standard 1.02
3314040       0x329178        GIF image data, version "89a", 1 x 4
3314096       0x3291B0        JPEG image data, JFIF standard 1.02
3314452       0x329314        JPEG image data, JFIF standard 1.01
3316684       0x329BCC        JPEG image data, JFIF standard 1.02
3318576       0x32A330        JPEG image data, JFIF standard 1.02
3320476       0x32AA9C        GIF image data, version "89a", 1 x 50
3320760       0x32ABB8        JPEG image data, JFIF standard 1.02
3321128       0x32AD28        HTML document header
3322079       0x32B0DF        HTML document footer
3322100       0x32B0F4        HTML document header
3327389       0x32C59D        HTML document footer
3330352       0x32D130        Copyright string: "Copyright (C) 2005 SilverStripe Limited"
3332754       0x32DA92        Copyright string: "Copyright (C) 2005 SilverStripe Limited"
3337644       0x32EDAC        GIF image data, version "89a", 16 x 50
3337744       0x32EE10        GIF image data, version "89a", 16 x 2
3337812       0x32EE54        GIF image data, version "89a", 16 x 50
3337916       0x32EEBC        GIF image data, version "89a", 16 x 50
3338260       0x32F014        PNG image, 16 x 16, 8-bit colormap, non-interlaced
3339236       0x32F3E4        Zlib compressed data, best compression
3339488       0x32F4E0        PNG image, 16 x 16, 8-bit colormap, non-interlaced
3340453       0x32F8A5        Zlib compressed data, best compression
3340696       0x32F998        PNG image, 16 x 16, 8-bit colormap, non-interlaced
3341654       0x32FD56        Zlib compressed data, best compression
3341876       0x32FE34        GIF image data, version "89a", 16 x 50
3342220       0x32FF8C        GIF image data, version "89a", 16 x 50
3342332       0x32FFFC        GIF image data, version "89a", 240 x 1
3364608       0x335700        HTML document header
3364872       0x335808        HTML document footer
3365056       0x3358C0        HTML document header
3368845       0x33678D        Copyright string: "copyright">(C) Copyright 2006 by ZyXEL Communications Corp.</td>"
3368860       0x33679C        Copyright string: "Copyright 2006 by ZyXEL Communications Corp.</td>"
3368951       0x3367F7        HTML document footer
3369083       0x33687B        HTML document header
3372562       0x337612        HTML document footer
3373055       0x3377FF        HTML document header
3373233       0x3378B1        HTML document footer
3373392       0x337950        HTML document header
3374434       0x337D62        HTML document footer
3374458       0x337D7A        HTML document header
3376874       0x3386EA        HTML document footer
3376896       0x338700        GIF image data, version "89a", 11 x 33
3377212       0x33883C        GIF image data, version "89a", 1 x 33
3377380       0x3388E4        GIF image data, version "89a", 11 x 33
3377696       0x338A20        GIF image data, version "89a", 11 x 33
3378012       0x338B5C        GIF image data, version "89a", 1 x 33
3378180       0x338C04        GIF image data, version "89a", 11 x 33
3378560       0x338D80        HTML document header
3379312       0x339070        HTML document footer
3379496       0x339128        HTML document header
3380201       0x3393E9        HTML document footer
3380312       0x339458        HTML document header
3381994       0x339AEA        HTML document footer
3382080       0x339B40        HTML document header
3383386       0x33A05A        HTML document footer
3383410       0x33A072        HTML document header
3391804       0x33C13C        HTML document footer
3391888       0x33C190        HTML document header
3394614       0x33CC36        HTML document footer
3394700       0x33CC8C        HTML document header
3395580       0x33CFFC        HTML document footer
3395664       0x33D050        HTML document header
3395943       0x33D167        HTML document footer
3396075       0x33D1EB        HTML document header
3400404       0x33E2D4        HTML document footer
3401650       0x33E7B2        HTML document header
3406422       0x33FA56        HTML document footer
3406508       0x33FAAC        HTML document header
3408702       0x34033E        HTML document footer
3408726       0x340356        HTML document header
3411790       0x340F4E        HTML document footer
3411876       0x340FA4        HTML document header
3414779       0x341AFB        HTML document footer
3415464       0x341DA8        HTML document header
3418483       0x342973        HTML document footer
3418711       0x342A57        HTML document header
3420351       0x3430BF        HTML document footer
3420566       0x343196        HTML document header
3429707       0x34554B        HTML document footer
3429976       0x345658        HTML document header
3433635       0x3464A3        HTML document footer
3433756       0x34651C        HTML document header
3434649       0x346899        HTML document footer
3434732       0x3468EC        HTML document header
3436038       0x346E06        HTML document footer
3436123       0x346E5B        HTML document header
3437804       0x3474EC        HTML document footer
3438512       0x3477B0        HTML document header
3441536       0x348380        HTML document footer
3441922       0x348502        HTML document header
3445491       0x3492F3        HTML document footer
3445514       0x34930A        HTML document header
3451053       0x34A8AD        HTML document footer
3451140       0x34A904        HTML document header
3458714       0x34C69A        HTML document footer
3460082       0x34CBF2        HTML document header
3466559       0x34E53F        HTML document footer
3466644       0x34E594        HTML document header
3471192       0x34F758        HTML document footer
3472300       0x34FBAC        HTML document header
3473146       0x34FEFA        HTML document footer
3473351       0x34FFC7        HTML document header
3482927       0x35252F        HTML document footer
3486214       0x353206        HTML document header
3494238       0x35515E        HTML document footer
3494262       0x355176        HTML document header
3495673       0x3556F9        HTML document footer
3495698       0x355712        HTML document header
3510269       0x358FFD        HTML document footer
3510355       0x359053        HTML document header
3511518       0x3594DE        HTML document footer
3511940       0x359684        HTML document header
3519166       0x35B2BE        HTML document footer
3519958       0x35B5D6        HTML document header
3522422       0x35BF76        HTML document footer
3522446       0x35BF8E        HTML document header
3527199       0x35D21F        HTML document footer
3527284       0x35D274        HTML document header
3531807       0x35E41F        HTML document footer
3532190       0x35E59E        HTML document header
3536363       0x35F5EB        HTML document footer
3536384       0x35F600        GIF image data, version "89a", 22 x 22
3536524       0x35F68C        GIF image data, version "89a", 22 x 22
3536652       0x35F70C        GIF image data, version "89a", 22 x 22
3536895       0x35F7FF        HTML document header
3539555       0x360263        HTML document footer
3540023       0x360437        HTML document header
3544070       0x361406        HTML document footer
3544875       0x36172B        HTML document header
3548398       0x3624EE        HTML document footer
3549070       0x36278E        HTML document header
3553393       0x363871        HTML document footer
3553418       0x36388A        HTML document header
3560360       0x3653A8        HTML document footer
3560382       0x3653BE        HTML document header
3564496       0x3663D0        HTML document footer
3564520       0x3663E8        HTML document header
3571613       0x367F9D        HTML document footer
3571699       0x367FF3        HTML document header
3574643       0x368B73        HTML document footer
3575338       0x368E2A        HTML document header
3578662       0x369B26        HTML document footer
3578747       0x369B7B        HTML document header
3580401       0x36A1F1        HTML document footer
3580823       0x36A397        HTML document header
3583104       0x36AC80        HTML document footer
3583874       0x36AF82        HTML document header
3586705       0x36BA91        HTML document footer
3586730       0x36BAAA        HTML document header
3605463       0x3703D7        HTML document footer
3605547       0x37042B        HTML document header
3607494       0x370BC6        HTML document footer
3607856       0x370D30        HTML document header
3611786       0x371C8A        HTML document footer
3611872       0x371CE0        HTML document header
3613816       0x372478        HTML document footer
3613904       0x3724D0        HTML document header
3618280       0x3735E8        HTML document footer
3618368       0x373640        HTML document header
3619492       0x373AA4        HTML document footer
3619579       0x373AFB        HTML document header
3620833       0x373FE1        HTML document footer
3620967       0x374067        HTML document header
3623009       0x374861        HTML document footer
3623431       0x374A07        HTML document header
3624526       0x374E4E        HTML document footer
3624707       0x374F03        HTML document header
3626728       0x3756E8        HTML document footer
3627066       0x37583A        HTML document header
3631156       0x376834        HTML document footer
3631178       0x37684A        HTML document header
3633900       0x3772EC        HTML document footer
3633922       0x377302        HTML document header
3637542       0x378126        HTML document footer
3637627       0x37817B        HTML document header
3640266       0x378BCA        HTML document footer
3640650       0x378D4A        HTML document header
3646947       0x37A5E3        HTML document footer
3647031       0x37A637        HTML document header
3652278       0x37BAB6        HTML document footer
3652638       0x37BC1E        HTML document header
3656386       0x37CAC2        HTML document footer
3656412       0x37CADC        HTML document header
3662905       0x37E439        HTML document footer
3662932       0x37E454        HTML document header
3671462       0x3805A6        HTML document footer
3671547       0x3805FB        HTML document header
3673330       0x380CF2        HTML document footer
3673786       0x380EBA        HTML document header
3677952       0x381F00        HTML document footer
3678035       0x381F53        HTML document header
3679330       0x382462        HTML document footer
3679450       0x3824DA        HTML document header
3684171       0x38374B        HTML document footer
3684255       0x38379F        HTML document header
3686679       0x384117        HTML document footer
3687062       0x384296        HTML document header
3691039       0x38521F        HTML document footer
3691123       0x385273        HTML document header
3693583       0x385C0F        HTML document footer
3693726       0x385C9E        HTML document header
3697518       0x386B6E        HTML document footer
3697603       0x386BC3        HTML document header
3700357       0x387685        HTML document footer
3700694       0x3877D6        HTML document header
3704691       0x388773        HTML document footer
3704775       0x3887C7        HTML document header
3707199       0x38913F        HTML document footer
3707582       0x3892BE        HTML document header
3711592       0x38A268        HTML document footer
3711675       0x38A2BB        HTML document header
3714939       0x38AF7B        HTML document footer
3715418       0x38B15A        HTML document header
3719125       0x38BFD5        HTML document footer
3719211       0x38C02B        HTML document header
3722883       0x38CE83        HTML document footer
3723338       0x38D04A        HTML document header
3727633       0x38E111        HTML document footer
3727719       0x38E167        HTML document header
3730159       0x38EAEF        HTML document footer
3730518       0x38EC56        HTML document header
3734614       0x38FC56        HTML document footer
3734699       0x38FCAB        HTML document header
3736099       0x390223        HTML document footer
3736314       0x3902FA        HTML document header
3739695       0x39102F        HTML document footer
3739779       0x391083        HTML document header
3741513       0x391749        HTML document footer
3741730       0x391822        HTML document header
3745452       0x3926AC        HTML document footer
3745535       0x3926FF        HTML document header
3748703       0x39335F        HTML document footer
3749086       0x3934DE        HTML document header
3752838       0x394386        HTML document footer
3752923       0x3943DB        HTML document header
3754478       0x3949EE        HTML document footer
3754635       0x394A8B        HTML document header
3755845       0x394F45        HTML document footer
3755894       0x394F76        HTML document header
3758606       0x395A0E        HTML document footer
3758630       0x395A26        HTML document header
3761769       0x396669        HTML document footer
3761794       0x396682        HTML document header
3764921       0x3972B9        HTML document footer
3765003       0x39730B        HTML document header
3765394       0x397492        HTML document footer
3765479       0x3974E7        HTML document header
3766902       0x397A76        HTML document footer
3766926       0x397A8E        HTML document header
3768990       0x39829E        HTML document footer
3769075       0x3982F3        HTML document header
3770737       0x398971        HTML document footer
3771159       0x398B17        HTML document header
3774270       0x39973E        HTML document footer
3774942       0x3999DE        HTML document header
3778202       0x39A69A        HTML document footer
3778226       0x39A6B2        HTML document header
3786638       0x39C78E        HTML document footer
3786723       0x39C7E3        HTML document header
3788298       0x39CE0A        HTML document footer
3788623       0x39CF4F        HTML document header
3791486       0x39DA7E        HTML document footer
3791931       0x39DC3B        HTML document header
3793339       0x39E1BB        HTML document footer
3793615       0x39E2CF        HTML document header
3795617       0x39EAA1        HTML document footer
3796050       0x39EC52        HTML document header
3800202       0x39FC8A        HTML document footer
3800226       0x39FCA2        HTML document header
3804500       0x3A0D54        HTML document footer
3804522       0x3A0D6A        HTML document header
3808117       0x3A1B75        HTML document footer
3808142       0x3A1B8E        HTML document header
3814743       0x3A3557        HTML document footer
3814828       0x3A35AC        HTML document header
3816793       0x3A3D59        HTML document footer
3817239       0x3A3F17        HTML document header
3824517       0x3A5B85        HTML document footer
3825382       0x3A5EE6        HTML document header
3831546       0x3A76FA        HTML document footer
3831570       0x3A7712        HTML document header
3837170       0x3A8CF2        HTML document footer
3837256       0x3A8D48        HTML document header
3838869       0x3A9395        HTML document footer
3839219       0x3A94F3        HTML document header
3842063       0x3AA00F        HTML document footer
3842326       0x3AA116        HTML document header
3846890       0x3AB2EA        HTML document footer
3846914       0x3AB302        HTML document header
3851675       0x3AC59B        HTML document footer
3851760       0x3AC5F0        HTML document header
3853109       0x3ACB35        HTML document footer
3853364       0x3ACC34        HTML document header
3854667       0x3AD14B        HTML document footer
3854858       0x3AD20A        HTML document header
3858890       0x3AE1CA        HTML document footer
3858914       0x3AE1E2        HTML document header
3862348       0x3AEF4C        HTML document footer
3862431       0x3AEF9F        HTML document header
3867064       0x3B01B8        HTML document footer
3867771       0x3B047B        HTML document header
3869078       0x3B0996        HTML document footer
3869331       0x3B0A93        HTML document header
3870519       0x3B0F37        HTML document footer
3870638       0x3B0FAE        HTML document header
3875103       0x3B211F        HTML document footer
3875126       0x3B2136        HTML document header
3878901       0x3B2FF5        HTML document footer
3878926       0x3B300E        HTML document header
3881855       0x3B3B7F        HTML document footer
3881880       0x3B3B98        HTML document header
3884842       0x3B472A        HTML document footer
3920076       0x3BD0CC        eCos RTOS string reference: "eCosPriority=true|false] [DiscardSource=true|false]"
3982357       0x3CC415        eCos RTOS string reference: "eCosPriority=true|false] [DiscardSource=true|false]"
```

#### Strings

The `strings` tool (or a standard hex editor) finds all the content of the HTML and CSS files “as is”, and also some interesting command-line interface stuff that is hidden from a regular user.

## Conclusion

It should be relatively easy to patch and modify the WebManagement UI in various ways if actual image generation and flashing can be accomplished.

## See also

- The official [Broadcom Network Switching Software](https://github.com/Broadcom-Network-Switching-Software) project on GitHub may contain related source code
- The official [eCOS site](https://www.ecoscentric.com/ecos/index.shtml)
- [OpenWrt 21](https://openwrt.org/releases/21.02/notes-21.02.0-rc3#new_hardware_targets) adds support for some (actual) managed switches (Realtek-based, as of this writing) but requires possibly more flash space and RAM than is available on a device of 2007 vintage.
- [OpenWrt page on the supported Broadcom SoCs](https://openwrt.org/docs/techref/hardware/soc#broadcom) may have some useful pointers.