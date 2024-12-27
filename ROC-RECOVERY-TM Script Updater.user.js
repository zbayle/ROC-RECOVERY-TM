// ==UserScript==
// @name         ROC-RECOVERY-TM Script Updater
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Automatically updates scripts from the ROC-RECOVERY-TM GitHub repository.
// @author       zbbayle
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_log
// @grant        GM_registerMenuCommand
// @connect      githubusercontent.com
// ==/UserScript==

(function () {
    'use strict';

    // List of scripts to manage
    const scripts = [
        {
            name: "Display Hover Box Data with Time and Packages",
            url: "https://github.com/zbayle/ROC-RECOVERY-TM/raw/refs/heads/main/Display%20Hover%20Box%20Data%20with%20Time%20and%20Packages.user.js",
            currentVersion: GM_getValue("Display Hover Box Version", "0.0")
        },
        {
            name: "Vista Auto Fill with VRID Scroll, Enter, and Hover",
            url: "https://github.com/zbayle/ROC-RECOVERY-TM/raw/refs/heads/main/Vista%20auto%20fill%20with%20VRID%20scroll,%20Enter,%20and%20Hover.user.js",
            currentVersion: GM_getValue("Vista Auto Fill Version", "0.0")
        },
        {
            name: "WIMS and FMC Interaction",
            url: "https://github.com/zbayle/ROC-RECOVERY-TM/raw/refs/heads/main/WIMS%20and%20FMC%20Interaction.user.js",
            currentVersion: GM_getValue("WIMS and FMC Version", "0.0")
        },
        {
            name: "Tampermonkey Keyword Highlighter",
            url: "https://github.com/zbayle/ROC-RECOVERY-TM/raw/refs/heads/main/tampermonkey-keyword-highlighter.user.js",
            currentVersion: GM_getValue("Keyword Highlighter Version", "0.0")
        }
    ];

    // Compare versions
    function isNewVersion(current, latest) {
        const currentParts = current.split('.').map(Number);
        const latestParts = latest.split('.').map(Number);
        for (let i = 0; i < latestParts.length; i++) {
            if ((currentParts[i] || 0) < latestParts[i]) return true;
            if ((currentParts[i] || 0) > latestParts[i]) return false;
        }
        return false;
    }

    // Function to dynamically inject the script into Tampermonkey
    function injectScript(content) {
        const script = document.createElement('script');
        script.textContent = content;
        document.head.appendChild(script);
    }

    // Update and install a script
    function updateScript(script, latestVersion, content) {
        GM_setValue(script.name + " Version", latestVersion);
        injectScript(content); // Inject the new script into the page
        alert(`${script.name} has been updated to version ${latestVersion}`);
    }

    // Check for updates
    function checkForUpdates() {
        scripts.forEach(script => {
            GM_xmlhttpRequest({
                method: "GET",
                url: script.url,
                onload: function (response) {
                    const remoteVersion = /@version\s+([\d.]+)/.exec(response.responseText)?.[1];
                    if (remoteVersion && isNewVersion(script.currentVersion, remoteVersion)) {
                        console.log(`Updating ${script.name} from version ${script.currentVersion} to ${remoteVersion}`);
                        updateScript(script, remoteVersion, response.responseText);
                    } else {
                        console.log(`${script.name} is already up to date.`);
                    }
                },
                onerror: function (error) {
                    console.error(`Error fetching ${script.name}:`, error);
                }
            });
        });
    }

    // Register a menu command to manually check for updates
    GM_registerMenuCommand("Check for Updates", checkForUpdates);

    // Auto-check for updates every 24 hours
    setInterval(checkForUpdates, 24 * 60 * 60 * 1000);

    // Initial check on load
    checkForUpdates();

})();
