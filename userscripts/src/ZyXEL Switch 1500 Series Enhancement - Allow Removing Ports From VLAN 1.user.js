// ==UserScript==
// @name         ZyXEL Switch 1500 Series Enhancement - Allow Removing Ports From VLAN 1
// @namespace    mailto:jukka.aho@iki.fi
// @version      1.0
// @description  Allow removing ports from VLAN 1 in the Web Management UI
// @author       Jukka Aho <jukka.aho@iki.fi>
// @website      https://github.com/znark/zyxel-switch-1500-series-enhancements
// @match        http://192.168.1.1/showvlan.cgi?port=*
// @run-at       document-end
// @grant        none
// ==/UserScript==

// ---------------------------------------------------------------------
// USAGE
// ---------------------------------------------------------------------
//
// Add a separate `@match` imperative for each switch you want to apply
// this fix to. (There can be several `@match` imperatives and they can
// contain wildcards.)
//
// For instance,
//
// @match        http://sw-r213-a.mydomain.example/showvlan.cgi?port=*
// @match        http://sw-r303-d.mydomain.example/showvlan.cgi?port=*
//
// or
//
// @match        http://sw-*.mydomain.example/showvlan.cgi?port=*
//
// ---------------------------------------------------------------------

// Factory that wraps the original port mode toggle functions into
// an environment where the current VLAN ID is temporarily set to
// -1. Circumvents the checks that normally make it impossible to
// remove ports from VLAN 1.

function mask_vlan_id_from_fnc( fnc ) {
    'use strict';
    return ( port_num ) => {
        let vlan_id = cur_vid;
        cur_vid = -1;
        fnc( port_num );
        cur_vid = vlan_id;
    };
}

// Wrap the onClick handler which toggles the mode of the individual
// ports
change_pic = mask_vlan_id_from_fnc( change_pic );

// Wrap the onClick handler for the “All ports” button
change_pics = mask_vlan_id_from_fnc( change_pics );
