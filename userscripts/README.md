# Userscript-Based Enhancements

## Overview

The enhancements in this directory are implemented as [userscripts](https://en.wikipedia.org/wiki/Userscript). They must be installed in the browser that you use to access the web-based management UI of the targeted switch.

Userscripts are JavaScript snippets which modify the operation of a web page or a web site that they target. They run in your browser and auto-launch based on user-configurable URL patterns.

## Available enhancements

- [Allow removing ports from VLAN 1](src/)

## Installation

### Install a userscript manager

In most browsers, the only feasible way of managing userscripts is installing an add-on or extension made for the purpose. The recommend go-to choice  is *[TamperMonkey](https://www.tampermonkey.net/)*, which is available for all major browsers.

> **TIP:** *TamperMonkey* has a built-in code editor which allows viewing and modifying the source code of any scripts you install. This will come handy when configuring the script for your particular environment.

### Install the desired script

1. Once *TamperMonkey* has been installed, click on its icon in the toolbar and choose the *Dashboard* option in the menu that will open.

   > **NOTE:** *Firefox* installs the *TamperMonkey* icon directly on its toolbar. *Chrome* lists *TamperMonkey* in a submenu which you can open by clicking on the *Extensions* toolbar button (shaped like a jigsaw puzzle piece).

2. Navigate to the *Utilities* tab,  in the *File* section, and click on the *Import: Choose File* button. A file dialog will open, allowing you to browse the local file system for installable userscripts.

3. Navigate to the folder where you cloned this repository or saved the desired script. Open the script and accept its installation.

   > **NOTE:** Userscripts have the `.user.js` file extension.

4. You should now see the script listed in the *Installed Userscripts* tab. If it does not appear there, close the *TamperMonkey* tab and open the *Dashboard* again.

5. Once you have confirmed that the script has been installed, you still need to configure it for the correct addresses (URLs). This is so that the script will auto-launch upon visiting the management interface of your ZyXEL switch. See the **Configuration** section below for more information.

## Configuration

The usercripts in this repository target the switch at its default factory address `http://192.168.1.1/`. This configuration is obviously not suitable for real-world use. The default URL must be replaced with actual site-specific address patterns. This can be accomplished as follows:

1. Click on the *TamperMonkey* icon in the browser toolbar. Choose the *Dashboard* option in the menu.

2. Navigate to the *Installed Userscripts* tab.

3. Double-click on the name of the script whose activation URLs you want to control. The script will be loaded into *TamperMonkey*’s built-in code editor.

4. The code begins with a comment block containing `UserScript` metadata. This block holds one or more `@match` imperatives which control the URLs that will activate the script.

   The `UserScript` metadata format allows defining multiple `@match` imperatives. You must generally add a separate `@match` imperative for each switch you want to apply the script to.

   > **NOTE:** Make sure any `@match` imperative you add or modify begins with the comment marker (`//`) and is placed between the start and end tags of the `UserScript` metadata block. Otherwise it will not work.

   **Example: Matching switches by their fully-qualified domain names**

   For instance, you can match two individual switches with the fully-qualified DNS hostnames `sw-r213-a.domain.example` and `sw-r303-d.domain.example` as follows:

   ```
   // @match        http://sw-r213-a.mydomain.example/showvlan.cgi?port=*
   // @match        http://sw-r303-d.mydomain.example/showvlan.cgi?port=*
   ```

   **Example: Matching a switch by its simple host name**

   You could also match a switch with a simple hostname that belongs to a local search domain or is defined in the local `hosts` file:

   ```
   // @match        http://sw-r101-a/showvlan.cgi?port=*
   ```

   **Example: Matching a switch by a wildcard pattern**

   If your DNS scheme allows it, you can also use wildcard patterns to match several switches with a single URL definition:

   ```
   // @match        http://sw-*.domain.example/showvlan.cgi?port=*
   ```

   The exact URL patterns depend on what kind of hostnames you typically use to access the targeted switches.

   > **NOTE:** The trailing part of the URL — shown above as `showvlan.cgi?port=*` — depends on the actual script in question. Follow the format used in the script itself to ensure it will be activated at the intended URL path.

   You can find the full syntax for the `@match` imperative [here](https://developer.chrome.com/docs/extensions/mv2/match_patterns/).

5. Once you have made the necessary changes, make sure to save the modified script (with Ctrl+S) so that the changes will be stored and used for activating the script.

6. Navigate to the web management interface of the targeted switch and try the user interface both with the script enabled and disabled. (The *Installed Userscripts* tab allows enabling or disabling individual scripts with a simple toggle button.)

If you encounter any issues, double-check the address used in the browser’s address bar and the `@match` imperatives configured in the script.