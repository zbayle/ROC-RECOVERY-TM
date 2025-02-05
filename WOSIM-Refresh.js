// ==UserScript==
// @name         WOSIM Refresh
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  A script to refresh WOSIM page with an on-screen timer
// @author       zbbayle
// @match        https://t.corp.amazon.com/issues/*
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
            console.log("Refresh button not found. Retrying...");
            setTimeout(clickRefreshButton, 1000); // Retry after 1 second
        }
    }

    // Create and style the timer element
    const timerDiv = document.createElement('div');
    timerDiv.id = 'refresh-timer';
    timerDiv.style.position = 'fixed';
    timerDiv.style.top = '10px';
    timerDiv.style.right = '10px';
    timerDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    timerDiv.style.color = 'white';
    timerDiv.style.padding = '5px 10px';
    timerDiv.style.borderRadius = '5px';
    timerDiv.style.fontSize = '14px';
    timerDiv.style.zIndex = '9999';
    timerDiv.innerHTML = 'Next refresh in: <span id="counter">15</span> seconds';
    document.body.appendChild(timerDiv);

    // Function to update the timer
    function updateTimer() {
        const counterElement = document.getElementById('counter');
        if (counterElement) {
            let counter = parseInt(counterElement.textContent);
            if (counter > 0) {
                counterElement.textContent = counter - 1;
            } else {
                counterElement.textContent = 15;
                clickRefreshButton();
            }
        }
    }

    // Wait for the page to load before starting the timer
    window.addEventListener('load', () => {
        // Set interval to update the timer every second
        setInterval(updateTimer, 1000);
    });
})();