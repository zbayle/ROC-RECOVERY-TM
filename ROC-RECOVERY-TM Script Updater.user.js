// ==UserScript==
// @name         ROC-RECOVERY-TM Script Updater
// @namespace    http://tampermonkey.net/
// @version      1.2.6.4
// @updateURL    https://github.com/zbayle/ROC-RECOVERY-TM/raw/refs/heads/main/ROC-RECOVERY-TM%20Script%20Updater.user.js
// @downloadURL  https://github.com/zbayle/ROC-RECOVERY-TM/raw/refs/heads/main/ROC-RECOVERY-TM%20Script%20Updater.user.js
// @description  Automatically updates scripts from the ROC-RECOVERY-TM GitHub repository.
// @author       zbbayle
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_log
// @grant        GM_registerMenuCommand
// @connect      raw.githubusercontent.com 
// ==/UserScript==

(function () {
    'use strict';

    console.log("ROC-RECOVERY-TM Script Updater loaded.");

    // List of scripts to manage
    const scripts = [
        {
            name: "Display Hover Box Data with Time and Packages",
            url: "https://raw.githubusercontent.com/zbayle/ROC-RECOVERY-TM/main/Display%20Hover%20Box%20Data%20with%20Time%20and%20Packages.user.js",
            key: "Display Hover Box Data with Time and Packages Version",
            match: ['https://trans-logistics.amazon.com/sortcenter/vista/*']
        },
        {
            name: "Vista Auto Fill with VRID Scroll, Enter, and Hover",
            url: "https://raw.githubusercontent.com/zbayle/ROC-RECOVERY-TM/main/Vista%20auto%20fill%20with%20VRID%20scroll,%20Enter,%20and%20Hover.user.js",
            key: "Vista Auto Fill with VRID Scroll, Enter, and Hover Version",
            match: ['https://trans-logistics.amazon.com/sortcenter/vista/*']
        },
        {
            name: "WIMS and FMC Interaction",
            url: "https://raw.githubusercontent.com/zbayle/ROC-RECOVERY-TM/main/WIMS%20and%20FMC%20Interaction.user.js",
            key: "WIMS and FMC Interaction Version",
            match: ['https://optimus-internal.amazon.com/wims*', 'https://trans-logistics.amazon.com/fmc/execution/*', 'https://trans-logistics.amazon.com/sortcenter/vista/*']
        },
        {
            name: "ROC Tools",
            url: "https://raw.githubusercontent.com/zbayle/ROC-RECOVERY-TM/main/ROC-Tools.js",
            key: "ROC Tools Version",
            match: ['https://optimus-internal.amazon.com/*', 'https://trans-logistics.amazon.com/*']
        },
    ];

    // Compare versions
    function isNewVersion(current, latest) {
        console.log(`Comparing versions: current=${current}, latest=${latest}`);
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
        const scriptElement = document.createElement('script');
        scriptElement.textContent = `(function() { ${content} })();`;
        document.head.appendChild(scriptElement);
    }

    // Update and install a script
    function updateScript(script, latestVersion, content) {
        GM_setValue(script.key, latestVersion);
        injectScript(content); // Inject the new script into the page
        console.log(`${script.name} has been updated to version ${latestVersion}`);
    }

    // Check for updates and load scripts based on the current URL
    function checkForUpdates() {
        console.log("Checking for updates...");
        const currentUrl = window.location.href;
        scripts.forEach(script => {
            script.match.forEach(match => {
                if (currentUrl.includes(match.replace('*', ''))) {
                    console.log(`Checking script: ${script.name}`);
                    GM_xmlhttpRequest({
                        method: "GET",
                        url: script.url,
                        onload: function (response) {
                            const remoteVersion = /@version\s+([\d.]+)/.exec(response.responseText)?.[1];
                            const currentVersion = GM_getValue(script.key, "0.0");
                            console.log(`Current version of ${script.name}: ${currentVersion}`);
                            console.log(`Remote version of ${script.name}: ${remoteVersion}`);
                            if (remoteVersion && isNewVersion(currentVersion, remoteVersion)) {
                                console.log(`Updating ${script.name} from version ${currentVersion} to ${remoteVersion}`);
                                updateScript(script, remoteVersion, response.responseText);
                            } else {
                                console.log(`${script.name} is already up to date.`);
                                injectScript(response.responseText); // Inject the script even if it's up to date
                            }
                        },
                        onerror: function (error) {
                            console.error(`Error fetching ${script.name}:`, error);
                        }
                    });
                }
            });
        });
    }

    // Register a menu command to manually check for updates
    GM_registerMenuCommand("Check for Updates", checkForUpdates);

    // Auto-check for updates every 60 seconds
    setInterval(checkForUpdates, 5 * 1000);

    // Initial check on load
    checkForUpdates();

    // Log the stored versions
    console.log('Stored versions:', {
        "Display Hover Box Data with Time and Packages Version": GM_getValue('Display Hover Box Data with Time and Packages Version'),
        "Vista Auto Fill with VRID Scroll, Enter, and Hover Version": GM_getValue('Vista Auto Fill with VRID Scroll, Enter, and Hover Version'),
        "WIMS and FMC Interaction Version": GM_getValue('WIMS and FMC Interaction Version'),
        "ROC Tools Version": GM_getValue('ROC Tools Version')
    });

})();