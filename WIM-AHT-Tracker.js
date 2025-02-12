// ==UserScript==
// @name         WIM and AHT Tracker
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Track WIMs and AHT with a floating menu in Tampermonkey.
// @author       zbbayle
// @match        https://optimus-internal.amazon.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_log
// @grant        GM_registerMenuCommand
// @connect      raw.githubusercontent.com
// @updateURL    https://raw.githubusercontent.com/zbayle/ROC-RECOVERY-TM/main/WIM-AHT-Tracker.js
// @downloadURL  https://raw.githubusercontent.com/zbayle/ROC-RECOVERY-TM/main/WIM-AHT-Tracker.js
// ==/UserScript==

(function() {
    'use strict';

    // Function to create and insert the floating menu
    function createFloatingMenu() {
        const menu = document.createElement('div');
        menu.id = 'floatingMenu';
        menu.style.position = 'fixed';
        menu.style.top = '60px'; // Set initial top position
        menu.style.left = '10px'; // Set initial left position
        menu.style.padding = '20px';
        menu.style.backgroundColor = '#232f3e';
        menu.style.color = '#f2f2f2';
        menu.style.borderRadius = '10px';
        menu.style.zIndex = '9999';
        menu.style.width = '350px'; // Increased width
        menu.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
        menu.style.display = 'none';

        const handle = document.createElement('div');
        handle.style.cursor = 'move'; // Change cursor to indicate draggable
        handle.style.marginBottom = '15px'; // Increased margin
        handle.style.padding = '10px';
        handle.style.backgroundColor = '#146eb4';
        handle.style.color = '#f2f2f2';
        handle.style.borderRadius = '5px';
        handle.textContent = 'Drag Here';

        const button = document.createElement('button');
        button.textContent = 'Close Menu';
        button.style.marginBottom = '15px'; // Increased margin
        button.style.padding = '10px';
        button.style.backgroundColor = '#ff9900';
        button.style.color = '#000000';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        button.style.width = '100%'; // Full width button
        button.style.boxSizing = 'border-box';
        button.onmouseover = () => button.style.backgroundColor = '#e68a00';
        button.onmouseout = () => button.style.backgroundColor = '#ff9900';
        button.onclick = toggleMenu;

        const menuContent = document.createElement('div');
        menuContent.id = 'floatingMenuContent';
        menuContent.style.marginTop = '10px';

        const ahtTrackingTabContent = document.createElement('div');
        ahtTrackingTabContent.id = 'ahtTrackingTab';
        ahtTrackingTabContent.style.display = 'block';

        const ahtTrackingList = document.createElement('ul');
        ahtTrackingList.id = 'ahtTrackingList';
        ahtTrackingList.style.padding = '0';
        ahtTrackingList.style.listStyle = 'none'; // Remove default list styling
        ahtTrackingTabContent.appendChild(ahtTrackingList);

        menuContent.appendChild(ahtTrackingTabContent);

        menu.appendChild(handle);
        menu.appendChild(button);
        menu.appendChild(menuContent);

        document.body.appendChild(menu);

        // Make the menu draggable using the handle
        makeDraggable(menu, handle);

        // Load WIM entries
        loadWIMEntries();
    }

    function trackWIM(vrid, wimLink) {
        console.log("Tracking WIM:", vrid, wimLink); // Debug log
        const ahtTrackingList = document.getElementById('ahtTrackingList');
        const listItem = document.createElement('li');
        listItem.textContent = `VRID: ${vrid} | Timer: 0s | WIM Link: ${wimLink}`;
        listItem.dataset.startTime = Date.now();
        listItem.dataset.vrid = vrid;
        listItem.dataset.wimLink = wimLink;

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
            listItem.firstChild.textContent = `VRID: ${vrid} | Timer: ${elapsedTime}s | WIM Link: ${wimLink}`;
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
            resolved: item.textContent.includes(' | Resolved')
        }));
        GM_setValue('wimEntries', JSON.stringify(entries));
    }

    function loadWIMEntries() {
        const entries = JSON.parse(GM_getValue('wimEntries', '[]'));
        entries.forEach(entry => {
            const ahtTrackingList = document.getElementById('ahtTrackingList');
            const listItem = document.createElement('li');
            listItem.textContent = `VRID: ${entry.vrid} | Timer: 0s | WIM Link: ${entry.wimLink}`;
            listItem.dataset.startTime = entry.startTime;
            listItem.dataset.vrid = entry.vrid;
            listItem.dataset.wimLink = entry.wimLink;

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
                    listItem.firstChild.textContent = `VRID: ${entry.vrid} | Timer: ${elapsedTime}s | WIM Link: ${entry.wimLink}`;
                }, 1000);
                listItem.dataset.interval = interval;
            } else {
                listItem.textContent += ' | Resolved';
            }
        });
    }

    // Function to make an element draggable using a handle
    function makeDraggable(element, handle = element) {
        let offsetX = 0, offsetY = 0, initialX = 0, initialY = 0;
        let isDragging = false;

        handle.addEventListener('mousedown', dragMouseDown);

        function dragMouseDown(e) {
            e.preventDefault();
            isDragging = true;
            initialX = e.clientX - element.offsetLeft;
            initialY = e.clientY - element.offsetTop;
            document.addEventListener('mousemove', elementDrag);
            document.addEventListener('mouseup', closeDragElement);
        }

        function elementDrag(e) {
            if (!isDragging) return;
            e.preventDefault();
            offsetX = e.clientX - initialX;
            offsetY = e.clientY - initialY;
            element.style.top = offsetY + "px";
            element.style.left = offsetX + "px";
        }

        function closeDragElement() {
            if (isDragging) {
                isDragging = false;
                document.removeEventListener('mousemove', elementDrag);
                document.removeEventListener('mouseup', closeDragElement);
            }
        }
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
                                    const selectedSound = 'beep'; // Default sound
                                    playSound(selectedSound);

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
                                            const wimUrl = wimUrlElement.href;
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
                                                        trackWIM(wimUrl, newPageUrl);
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
                const selectedSound = 'beep'; // Default sound
                playSound(selectedSound);
            }

            wimObserver.observe(document.body, { childList: true, subtree: true });
        } else {
            console.log("URL does not match WIMS page.");
        }
    }

    // Function to play sound using Web Audio API
    function playSound(type) {
        console.log("playSound function called with type:", type);
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        // Ensure the audio context is resumed
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const gainNode = audioCtx.createGain();
        gainNode.connect(audioCtx.destination);

        const volume = 0.5; // Default volume
        gainNode.gain.value = volume;

        const playNote = (frequency, duration, startTime) => {
            const oscillator = audioCtx.createOscillator();
            oscillator.connect(gainNode);
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime + startTime);
            oscillator.start(audioCtx.currentTime + startTime);
            oscillator.stop(audioCtx.currentTime + startTime + duration);
        };

        switch (type) {
            case 'beep':
                playNote(440, 1, 0); // A4 for 1 second
                break;
            case 'chime':
                playNoteSequence([
                    { frequency: 392.00, duration: 0.3 }, // G4
                    { frequency: 440.00, duration: 0.3 }, // A4
                    { frequency: 523.25, duration: 0.3 }, // C5
                    { frequency: 392.00, duration: 0.3 }  // G4
                ]);
                break;
            case 'ding':
                playNoteSequence([
                    { frequency: 523.25, duration: 0.3 }, // C5
                    { frequency: 587.33, duration: 0.3 }, // D5
                    { frequency: 659.25, duration: 0.3 }, // E5
                    { frequency: 523.25, duration: 0.3 }  // C5
                ]);
                break;
            default:
                playNoteSequence([
                    { frequency: 440, duration: 0.3 }, // A4
                    { frequency: 523.25, duration: 0.3 }, // C5
                    { frequency: 659.25, duration: 0.3 }, // E5
                    { frequency: 783.99, duration: 0.3 } // G5
                ]);
        }

        function playNoteSequence(notes) {
            let startTime = 0;
            notes.forEach(note => {
                playNote(note.frequency, note.duration, startTime);
                startTime += note.duration;
            });
        }
    }

    // Ensure the page is fully loaded before trying to access elements
    window.addEventListener('load', function () {
        console.log("Window loaded.");

        createFloatingMenu();
        observeWIMAlerts();
    });

    // Toggle the visibility of the floating menu
    function toggleMenu() {
        const menu = document.getElementById('floatingMenu');
        if (menu) {
            if (menu.style.display === 'none') {
                menu.style.display = 'block';
                console.log("Menu is now visible.");
            } else {
                menu.style.display = 'none';
                console.log("Menu is now hidden.");
            }
        } else {
            console.error('Floating menu element not found!');
        }
    }
})();