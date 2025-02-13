// ==UserScript==
// @name         WIM and AHT Tracker
// @namespace    http://tampermonkey.net/
// @version      1.7
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
        trackerTabLink.onclick = (e) => {
            e.preventDefault();
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
        } else {
            document.body.appendChild(trackerContent);
        }

        // Load WIM entries
        loadWIMEntries();
    }

    function showTrackerContent() {
        const trackerContent = document.getElementById('trackerContent');
        if (trackerContent.style.display === 'none') {
            trackerContent.style.display = 'block';
        } else {
            trackerContent.style.display = 'none';
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
        stopButton.style.color = '#ffffff';
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

                                    // Capture the WIM URL with retry mechanism
                                    let wimUrlElement = node.querySelector('td.TASK_ID.severity-1 a.task-link');
                                    let retries = 0;
                                    const maxRetries = 5;
                                    const retryInterval = setInterval(() => {
                                        if (wimUrlElement || retries >= maxRetries) {
                                            clearInterval(retryInterval);
                                            if (!wimUrlElement) {
                                                console.error("WIM URL element not found after retries.");
                                                return;
                                            }
                                            const taskId = wimUrlElement.getAttribute('taskid');
                                            const wimUrl = `https://optimus-internal.amazon.com/wims/taskdetail/${taskId}`;
                                            const reason = node.querySelector('td.goalContextTitle').textContent.trim();
                                            const vrid = node.querySelector('td.vehicleRunId').getAttribute('id');
                                            console.log("WIM URL detected:", wimUrl);

                                            let countdown = 5;
                                            const interval = setInterval(() => {
                                                countdown--;
                                                console.log(`Auto-assign countdown: ${countdown}`);
                                                if (countdown < 0) {
                                                    clearInterval(interval);
                                                    assignButton.click();
                                                    console.log("Assign button clicked automatically.");
                                                    // Capture the URL of the page that loads
                                                    setTimeout(() => {
                                                        const newPageUrl = window.location.href;
                                                        console.log("Attempting to store new page URL after assignment:", newPageUrl);
                                                        localStorage.setItem('wimURL', newPageUrl);
                                                        console.log("New page URL stored in local storage:", newPageUrl);
                                                        trackWIM(vrid, wimUrl, reason);
                                                    }, 1000);
                                                }
                                            }, 1000);
                                        } else {
                                            console.log("Retrying to find WIM URL element...");
                                            wimUrlElement = node.querySelector('td.TASK_ID.severity-1 a.task-link');
                                            retries++;
                                        }
                                    }, 1000);
                                } else {
                                    console.log("Assign to me button not found.");
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