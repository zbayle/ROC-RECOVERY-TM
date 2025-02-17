// ==UserScript==
// @name         WIM and AHT Tracker
// @namespace    http://tampermonkey.net/
// @version      1.9.6
// @description  Track WIMs and AHT with a tab on the WIMS page in Tampermonkey.
// @author       zbbayle
// @match        https://optimus-internal.amazon.com/wims*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_log
// @grant        GM_registerMenuCommand
// @connect      raw.githubusercontent.com
// @updateURL    https://raw.githubusercontent.com/zbayle/ROC-RECOVERY-TM/refs/heads/main/WIM-AHT-Tracker.js
// @downloadURL  https://raw.githubusercontent.com/zbayle/ROC-RECOVERY-TM/refs/heads/main/WIM-AHT-Tracker.js
// ==/UserScript==

(function() {
    'use strict';

    // Function to create and insert the WIM and AHT Tracker tab
    function createTrackerTab() {
        const tabContainer = document.querySelector('.nav.nav-tabs'); // Adjust the selector to match the WIMS page tab container
        if (!tabContainer) {
            console.error('Tab container not found!');
            return;
        }
    
        const trackerTab = document.createElement('li');
        trackerTab.role = 'presentation';
        trackerTab.className = '';
        const trackerTabLink = document.createElement('a');
        trackerTabLink.name = 'tab_tracker';
        trackerTabLink.href = '#';
        trackerTabLink.textContent = 'WIM & AHT Tracker';
        trackerTabLink.style.color = '#ffffff'; // Set text color to white
        trackerTabLink.style.backgroundColor = '#007bff'; // Set background color to blue
        trackerTabLink.style.padding = '10px'; // Add padding
        trackerTabLink.style.borderRadius = '5px'; // Add border radius
        trackerTabLink.style.textDecoration = 'none'; // Remove underline
        trackerTabLink.style.display = 'inline-block'; // Ensure it is displayed inline-block
        trackerTabLink.onclick = (e) => {
            e.preventDefault();
            console.log('Tracker tab clicked');
            showTrackerContent();
        };
        trackerTab.appendChild(trackerTabLink);
    
        tabContainer.appendChild(trackerTab);
    
        const trackerContent = document.createElement('div');
        trackerContent.id = 'trackerContent';
        trackerContent.style.display = 'none';
        trackerContent.style.padding = '20px';
        trackerContent.style.backgroundColor = '#f2f2f2';
        trackerContent.style.borderRadius = '10px';
        trackerContent.style.marginTop = '10px';
    
        const ahtTrackingList = document.createElement('ul');
        ahtTrackingList.id = 'ahtTrackingList';
        ahtTrackingList.style.padding = '0';
        ahtTrackingList.style.listStyle = 'none'; // Remove default list styling
        trackerContent.appendChild(ahtTrackingList);
    
        // Append the tracker content to the main container
        const mainContainer = document.querySelector('.main-container'); // Adjust the selector to match the main content container
        if (mainContainer) {
            mainContainer.appendChild(trackerContent);
            console.log('Tracker content appended to main container');
        } else {
            document.body.appendChild(trackerContent);
            console.log('Tracker content appended to body');
        }
    
        // Load WIM entries
        loadWIMEntries();
    }

    function showTrackerContent() {
        const trackerContent = document.getElementById('trackerContent');
        const mainContainer = document.querySelector('.main-container');
        const otherTabsContent = mainContainer.querySelectorAll('> div:not(#trackerContent)');

        if (trackerContent) {
            if (trackerContent.style.display === 'none') {
                console.log('Showing tracker content');
                trackerContent.style.display = 'block';
                otherTabsContent.forEach(content => content.style.display = 'none');
            } else {
                console.log('Hiding tracker content');
                trackerContent.style.display = 'none';
                otherTabsContent.forEach(content => content.style.display = 'block');
            }
        } else {
            console.error('Tracker content element not found');
        }
    }

    function trackWIM(vrid, wimLink, reason) {
        console.log("Tracking WIM:", vrid, wimLink, reason); // Debug log
        const ahtTrackingList = document.getElementById('ahtTrackingList');
        const listItem = document.createElement('li');
        listItem.textContent = `VRID: ${vrid} | Timer: 0s | WIM Link: ${wimLink} | Reason: ${reason}`;
        listItem.dataset.startTime = Date.now();
        listItem.dataset.vrid = vrid;
        listItem.dataset.wimLink = wimLink;
        listItem.dataset.reason = reason;

        const stopButton = document.createElement('button');
        stopButton.textContent = 'Stop';
        stopButton.style.marginLeft = '10px';
        stopButton.style.padding = '5px';
        stopButton.style.backgroundColor = '#ff0000';
        stopButton.style.color = '#000000FF';
        stopButton.style.border = 'none';
        stopButton.style.borderRadius = '5px';
        stopButton.style.cursor = 'pointer';
        stopButton.onclick = () => stopTrackingWIM(vrid);

        listItem.appendChild(stopButton);
        ahtTrackingList.appendChild(listItem);

        const interval = setInterval(() => {
            const elapsedTime = Math.floor((Date.now() - listItem.dataset.startTime) / 1000);
            listItem.firstChild.textContent = `VRID: ${vrid} | Timer: ${elapsedTime}s | WIM Link: ${wimLink} | Reason: ${reason}`;
        }, 1000);

        listItem.dataset.interval = interval;

        // Save the entry to Tampermonkey storage
        saveWIMEntries();
    }

    function stopTrackingWIM(vrid) {
        const ahtTrackingList = document.getElementById('ahtTrackingList');
        const listItem = Array.from(ahtTrackingList.children).find(item => item.dataset.vrid === vrid);

        if (listItem) {
            clearInterval(listItem.dataset.interval);
            listItem.textContent += ' | Resolved';
            saveWIMEntries(); // Save the updated entries to Tampermonkey storage
        }
    }

    function saveWIMEntries() {
        const ahtTrackingList = document.getElementById('ahtTrackingList');
        const entries = Array.from(ahtTrackingList.children).map(item => ({
            vrid: item.dataset.vrid,
            wimLink: item.dataset.wimLink,
            startTime: item.dataset.startTime,
            reason: item.dataset.reason,
            resolved: item.textContent.includes(' | Resolved')
        }));
        GM_setValue('wimEntries', JSON.stringify(entries));
    }

    function loadWIMEntries() {
        const entries = JSON.parse(GM_getValue('wimEntries', '[]'));
        entries.forEach(entry => {
            const ahtTrackingList = document.getElementById('ahtTrackingList');
            const listItem = document.createElement('li');
            listItem.textContent = `VRID: ${entry.vrid} | Timer: 0s | WIM Link: ${entry.wimLink} | Reason: ${entry.reason}`;
            listItem.dataset.startTime = entry.startTime;
            listItem.dataset.vrid = entry.vrid;
            listItem.dataset.wimLink = entry.wimLink;
            listItem.dataset.reason = entry.reason;

            const stopButton = document.createElement('button');
            stopButton.textContent = 'Stop';
            stopButton.style.marginLeft = '10px';
            stopButton.style.padding = '5px';
            stopButton.style.backgroundColor = '#ff0000';
            stopButton.style.color = '#ffffff';
            stopButton.style.border = 'none';
            stopButton.style.borderRadius = '5px';
            stopButton.style.cursor = 'pointer';
            stopButton.onclick = () => stopTrackingWIM(entry.vrid);

            listItem.appendChild(stopButton);
            ahtTrackingList.appendChild(listItem);

            if (!entry.resolved) {
                const interval = setInterval(() => {
                    const elapsedTime = Math.floor((Date.now() - listItem.dataset.startTime) / 1000);
                    listItem.firstChild.textContent = `VRID: ${entry.vrid} | Timer: ${elapsedTime}s | WIM Link: ${entry.wimLink} | Reason: ${entry.reason}`;
                }, 1000);
                listItem.dataset.interval = interval;
            } else {
                listItem.textContent += ' | Resolved';
            }
        });
    }

    // Function to observe WIM alerts.
    function observeWIMAlerts() {
        console.log("observeWIMAlerts function called.");
        if (window.location.href.includes('https://optimus-internal.amazon.com/wims')) {
            console.log("URL matches WIMS page.");
            const wimObserver = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.addedNodes.length) {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === 1) {
                                const assignButton = node.querySelector('.btn-primary.btn-block.btn.btn-info');
                                if (assignButton) {
                                    console.log("Assign to me button detected.");

                                    assignButton.addEventListener('click', () => {
                                        console.log("Assign to me button clicked.");
                                        // Set up a MutationObserver to detect when the URL changes to the task detail page
                                        const urlObserver = new MutationObserver((mutations) => {
                                            mutations.forEach((mutation) => {
                                                if (window.location.href.includes('/wims/taskdetail/')) {
                                                    console.log("URL changed to task detail page.");
                                                    const wimUrl = window.location.href;

                                                    // Retry mechanism to find reason and VRID elements
                                                    let retries = 0;
                                                    const maxRetries = 10;
                                                    const retryInterval = setInterval(() => {
                                                        const reasonElement = document.querySelector('h3 span.highlighted-keyword');
                                                        const vridElement = document.querySelector('td.vehicleRunId');
                                                        if (reasonElement && vridElement) {
                                                            const reason = reasonElement.textContent.trim();
                                                            const vrid = vridElement.getAttribute('id');
                                                            console.log("WIM URL detected:", wimUrl);
                                                            console.log("Reason detected:", reason);
                                                            console.log("VRID detected:", vrid);

                                                            trackWIM(vrid, wimUrl, reason);
                                                            clearInterval(retryInterval);
                                                            urlObserver.disconnect();
                                                        } else {
                                                            retries++;
                                                            console.log(`Retry ${retries}/${maxRetries}: Reason or VRID element not found.`);
                                                            if (retries >= maxRetries) {
                                                                clearInterval(retryInterval);
                                                                console.log("Failed to find Reason or VRID element after maximum retries.");
                                                            }
                                                        }
                                                    }, 500);
                                                }
                                            });
                                        });

                                        urlObserver.observe(document.body, { childList: true, subtree: true });
                                    });

                                    let countdown = 5;
                                    const interval = setInterval(() => {
                                        countdown--;
                                        console.log(`Auto-assign countdown: ${countdown}`);
                                        if (countdown < 0) {
                                            clearInterval(interval);
                                            assignButton.click();
                                            console.log("Assign button clicked automatically.");
                                        }
                                    }, 1000);
                                } else {
                                    //console.log("Assign to me button not found.");
                                }
                            }
                        });
                    }
                });
            });

            // Initial check for the "Assign to me" button
            const initialAssignButton = document.querySelector('.btn-primary.btn-block.btn.btn-info');
            if (initialAssignButton) {
                console.log("Initial 'Assign to me' button detected.");
            }

            wimObserver.observe(document.body, { childList: true, subtree: true });
        } else {
            console.log("URL does not match WIMS page.");
        }
    }

    // Ensure the page is fully loaded before trying to access elements
    window.addEventListener('load', function () {
        console.log("Window loaded.");

        createTrackerTab();
        observeWIMAlerts();
    });
})();