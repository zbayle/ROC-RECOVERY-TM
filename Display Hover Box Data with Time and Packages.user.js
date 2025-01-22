// ==UserScript==
// @name         Display Hover Box Data with Time and Packages
// @namespace    http://tampermonkey.net/
// @version      1.7.3
// @updateURL    https://github.com/zbayle/ROC-RECOVERY-TM/raw/refs/heads/main/Display%20Hover%20Box%20Data%20with%20Time%20and%20Packages.user.js
// @downloadURL  https://github.com/zbayle/ROC-RECOVERY-TM/raw/refs/heads/main/Display%20Hover%20Box%20Data%20with%20Time%20and%20Packages.user.js
// @description  Extract and display time and package data from tooltip in a floating container, highlighting the first cumulative threshold.
// @author       zbbayle
// @match        https://trans-logistics.amazon.com/sortcenter/vista/*
// @grant        GM_setValue
// @grant        GM_getValue

// ==/UserScript==

(function() {
    'use strict';

    // Create a floating container for displaying hover data
    let container = document.createElement('div');
    container.id = 'hoverDataContainer';
    container.style.position = 'fixed';
    container.style.top = '10px';
    container.style.right = '10px';
    container.style.background = '#f9f9f9';
    container.style.border = '1px solid #ccc';
    container.style.padding = '10px';
    container.style.zIndex = '1000';
    container.style.overflowY = 'auto';
    container.style.maxHeight = '90vh';
    container.style.width = '300px';
    container.style.color = 'black';
    container.style.fontWeight = 'bold';
    container.style.fontWeight = 'bold';
    document.body.appendChild(container);

    // Function to update the container content with time and packages
    function updateContainer(content) {
        container.innerHTML = `
            <h3 style="margin-top: 0;">Package Data</h3>
            <ul style="list-style: none; padding: 0; margin: 0;">
                ${content}
            </ul>
        `;
    }

    // Watch for the addition of the tooltipTitle element
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1 && node.classList.contains('tooltipTitle')) {
                    // Grab the data from the tooltip
                    const list = node.querySelector('.listWithoutStyle.slamCptList');
                    if (list) {
                        // Extract and format the time and package info
                        let content = '';
                        let cumulativePackages = 0;
                        let thresholdMet = false;
                        const items = list.querySelectorAll('li');

                        items.forEach((item, index) => {
                            const time = item.querySelector('.cpt') ? item.querySelector('.cpt').innerText : '';
                            const pkgsText = item.querySelector('.pkgs') ? item.querySelector('.pkgs').innerText : '0';
                            const pkgs = parseInt(pkgsText.replace(/[^0-9]/g, '')) || 0;

                            cumulativePackages += pkgs;

                            // Check if threshold is met and highlight the row
                            const highlightStyle = (!thresholdMet && cumulativePackages >= 300) ? 'border: 4px ridge #50ff64;,background-color: white; font-weight: bold;' : '';
                            if (cumulativePackages >= 300) thresholdMet = true;

                            content += `<li style="margin-bottom: 5px;color:black; ${highlightStyle}"><strong>${time}</strong> - Packages: ${pkgs}</li>`;
                        });

                        updateContainer(content);
                    }
                }
            });
        });
    });

    // Start observing the DOM for new nodes
    observer.observe(document.body, { childList: true, subtree: true });

    // Initialize with a default message
    updateContainer('Hover over an element to see data');
})();
