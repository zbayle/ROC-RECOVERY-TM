// ==UserScript==
// @name         WOSIM Refresh
// @namespace    http://tampermonkey.net/
// @version      1.0.0.1
// @description  A script to refresh WOSIM page
// @author       zbbayle
// @match        https://t.corp.amazon.com/issues/*
// @grant        none
// @updateURL    https://github.com/zbayle/ROC-RECOVERY-TM/raw/refs/heads/main/WOSIM-Refresh.js
// @downloadURL  https://github.com/zbayle/ROC-RECOVERY-TM/raw/refs/heads/main/WOSIM-Refresh.js
// ==/UserScript==

(function() {
    'use strict';

    // Function to click the refresh button
    function clickRefreshButton() {
        const refreshButton = document.querySelector('button[data-testid="sim-search-refresh"]');
        if (refreshButton) {
            refreshButton.click();
            console.log("Refresh button clicked.");
        } else {
            console.log("Refresh button not found.");
        }
    }

    // Set interval to click the refresh button every 15 seconds (15000 milliseconds)
    setInterval(clickRefreshButton, 15000);
})();