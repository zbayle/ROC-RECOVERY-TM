// ==UserScript==
// @name         WIMS and FMC Interaction
// @namespace    http://tampermonkey.net/
// @version      2.3.1.dev
// @updateURL    https://github.com/zbayle/ROC-RECOVERY-TM/raw/refs/heads/dev/WIMS and FMC Interaction.user.js
// @downloadURL  https://github.com/zbayle/ROC-RECOVERY-TM/raw/refs/heads/dev/WIMS and FMC Interaction.user.js
// @description  Enhanced script for WIMS and FMC with refresh timers, table redesign, toggle switches, and ITR BY integration.
// @author       zbbayle
// @match        https://optimus-internal.amazon.com/wims*
// @match        https://trans-logistics.amazon.com/fmc/execution/*
// @match        https://trans-logistics.amazon.com/sortcenter/vista/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
    'use strict';

    // Inject CSS for highlighting the counter and spinner
    const style = document.createElement('style');
    style.innerHTML = `
.highlight-counter {
    font-size: 2em;
    color: white;
    background-color: black;
    padding: 10px;
    border: 2px solid red;
    border-radius: 5px;
    text-align: center;
}
/* Spinner CSS */
#loading-spinner {
    border: 8px solid #f3f3f3; /* Light grey */
    border-top: 8px solid #3498db; /* Blue */
    border-radius: 50%;
    width: 60px;
    height: 60px;
    animation: spin 2s linear infinite;
    margin: 20px auto;
}
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
`;
    document.head.appendChild(style);

    let highlightRunStructure = true;

    // Function to highlight the correct timer
    function highlightCorrectTimer() {
        const timerElement = document.querySelector('div.v-text-center.col-md-4');
        if (timerElement) {
            timerElement.classList.add('highlight-counter');
        }
    }

    // Observe the DOM for changes and highlight the timer when it is added
    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                highlightCorrectTimer();
            }
        }
    });

    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial call to highlight the timer if it is already present
    highlightCorrectTimer();

    // Refresh Timer
    function createTimer() {
        const timerDiv = document.createElement('div');
        timerDiv.id = 'refresh-timer';
        timerDiv.style.position = 'fixed';
        timerDiv.style.top = '10px';
        timerDiv.style.left = '50%';
        timerDiv.style.transform = 'translateX(-50%)';
        timerDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        timerDiv.style.color = 'white';
        timerDiv.style.padding = '5px 10px';
        timerDiv.style.borderRadius = '5px';
        timerDiv.style.fontSize = '14px';
        timerDiv.style.zIndex = '9999';
        timerDiv.innerHTML = 'Next refresh in: <span id="counter">60</span> seconds';

        document.body.appendChild(timerDiv);
    }

    function updateCounter() {
        const counterElement = document.getElementById('counter');
        if (counterElement) {
            let counter = parseInt(counterElement.textContent);
            if (counter > 0) {
                counterElement.textContent = counter - 1;
                counterElement.classList.add('highlight-counter');
            } else {
                counterElement.textContent = 60;
                counterElement.classList.add('highlight-counter');
                checkAndSelectOptions();
            }
        }
    }

    // WIMS Filters and Navigation
    function checkAndSelectOptions() {
        const selectedItems = [...document.querySelectorAll('span.filter-inline-pill-value.mr-1.badge.badge-info')];
        const criticalExists = selectedItems.some(el => el.textContent.includes('Critical Recovery Wims'));
        const recoveryExists = selectedItems.some(el => el.textContent.includes('Recovery WIMS [NA]'));

        if (!criticalExists || !recoveryExists) {
            const filterContainer = document.querySelector('.filter-input-container.form-control.clearfix');
            if (!filterContainer) {
                return;
            }

            filterContainer.click();

            setTimeout(() => {
                ['Lobby', 'Critical Recovery Wims', 'Recovery WIMS [NA]'].forEach(filter => {
                    const option = findElementByText('.dropdown-item', filter);
                    if (option && !option.classList.contains('selected')) option.click();
                });

                const applyBtn = document.querySelector('.apply-filter-btn .btn');
                if (applyBtn && !applyBtn.disabled) applyBtn.click();
            }, 500);
        }
    }

    function navigateToTaskDetail() {
        const taskLinks = document.querySelectorAll('.task-link');
        taskLinks.forEach(taskLink => {
            taskLink.addEventListener('click', function (e) {
                e.preventDefault();
                const taskUrl = taskLink.getAttribute('href');
                window.location.href = taskUrl;
            });
        });
    }

    function logStopNames() {
        // Find all elements with the 'vr-stop-name' class
        const stops = document.querySelectorAll('.vr-stop-name');

        // Log the text content of each stop
        stops.forEach((stop, index) => {
            console.log(`Stop ${index + 1}: ${stop.textContent.trim()}`);
        });
    }

    function addFacilityClasses() {
        // Find all the elements with the 'vr-stop-name' class
        const stops = document.querySelectorAll('.vr-stop-name');

        // Log the names of the stops
        logStopNames();

        // Ensure there are at least two stops
        if (stops.length >= 2) {
            // Add 'fc_origin' class to the first stop
            const firstFacility = stops[0];
            firstFacility.classList.add('fc_origin');
            console.log("Added class 'fc_origin' to:", firstFacility.textContent.trim());

            // Add 'fc_final' class to the second stop
            const secondFacility = stops[1];
            secondFacility.classList.add('fc_final');
            console.log("Added class 'fc_final' to:", secondFacility.textContent.trim());
        } else {
            console.warn("Not enough facilities found to apply classes.");
        }
    }

    function handleFMCPage() {
        // Clear the values of vrid, vistaDate, and vistaTime in local storage
        localStorage.removeItem('vrid');
        localStorage.removeItem('vistaDate');
        localStorage.removeItem('vistaTime');
        console.log('Cleared vrid, vistaDate, and vistaTime from local storage.');
    }

    // Function to highlight "AZNG" in dynamically added spans
    function highlightAZNGInDynamicElements() {
        // Function to process the elements
        function processSpans() {
            const boxContentSpans = document.querySelectorAll('span.box-content');
            boxContentSpans.forEach(span => {
                const regex = /AZNG/g; // Match "AZNG" only
                if (regex.test(span.textContent) && !span.dataset.highlighted) {
                    // Check to avoid duplicate highlighting
                    span.innerHTML = span.innerHTML.replace(regex, '<span style="background-color: #3cff00; color: black; padding: 2px;">AZNG</span>');
                    span.dataset.highlighted = "true"; // Mark as processed
                }
            });
        }

        // Run the function initially for any existing elements
        processSpans();

        // Set up a MutationObserver to detect dynamic additions
        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    // Check added nodes for the target spans
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Ensure it's an element
                            if (node.matches('span.box-content') || node.querySelector('span.box-content')) {
                                processSpans();
                            }
                        }
                    });
                }
            }
        });

        // Start observing the document body for changes
        observer.observe(document.body, { childList: true, subtree: true });
    }
    highlightAZNGInDynamicElements();

    function highlightRunStructureLink() {
        setTimeout(() => {
            const runStructureCells = [...document.querySelectorAll('td')].filter(td => {
                const anchor = td.querySelector('a');
                return anchor && anchor.getAttribute('href') && anchor.getAttribute('href').includes('/fmc/execution/run-structure/');
            });

            runStructureCells.forEach(cell => {
                const link = cell.querySelector('a');
                if (link) {
                    link.style.border = '4px solid #3cff00';
                    link.style.padding = '2px';
                }
            });
        }, 2000);
    }

    // Function to create and append an iframe
    function createIframe(url, callback, id = '') {
        const iframeContainer = document.createElement('div');
        iframeContainer.style.position = 'relative';
        iframeContainer.style.width = '100%';
        iframeContainer.style.height = '500px';
        iframeContainer.style.marginBottom = '10px';

        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.display = 'block';
        iframe.src = url;
        if (id) iframe.id = id;

        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '10px';
        closeButton.style.right = '10px';
        closeButton.style.backgroundColor = '#FF0000';
        closeButton.style.color = 'white';
        closeButton.style.border = 'none';
        closeButton.style.padding = '5px 10px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.borderRadius = '5px';

        closeButton.addEventListener('click', () => {
            iframeContainer.remove();
        });

        iframeContainer.appendChild(iframe);
        iframeContainer.appendChild(closeButton);

        iframe.onload = () => {
            console.log('Iframe loaded successfully.');
            callback(iframe);
        };

        iframe.onerror = (error) => {
            console.error('Error loading iframe:', error);
        };

        const container = document.querySelector('.expanded-child-table-container');

        console.log('Container:', container);

        if (container) {
            container.appendChild(iframeContainer);
        } else {
            console.error('Container not found!');
        }
    }

    
    // Function to add the Vista button
    function addVistaButton() {
        const assetsContainer = document.querySelector('td.assets');
        if (assetsContainer) {
            console.log('Assets container found!');
    
            if (document.querySelector('button#vistaButton')) {
                //console.log('Vista button already exists!');
                return;
            }
    
            const outboundAmazonManagedText = [...document.querySelectorAll('table.clear-table.full-width td')].find(td => td.textContent.includes('OutboundAmazonManaged'));
            if (outboundAmazonManagedText) {
                console.log('OutboundAmazonManaged text found!');
    
                const vistaButton = document.createElement('button');
                vistaButton.id = 'vistaButton';
                vistaButton.textContent = 'Open Vista';
                vistaButton.style.backgroundColor = '#FF9900';
                vistaButton.style.color = 'black';
                vistaButton.style.padding = '10px 20px';
                vistaButton.style.border = 'none';
                vistaButton.style.cursor = 'pointer';
                vistaButton.style.borderRadius = '5px';
                vistaButton.style.fontSize = '16px';
    
                vistaButton.addEventListener('click', async function () {
                    console.log('Vista button clicked!');
    
                    const stopNames = document.querySelectorAll('span.vr-stop-name');
                    console.log('Stop names detected:', stopNames);
    
                    if (stopNames.length < 2) {
                        console.error('Not enough stops found!');
                        return;
                    }
    
                    const finalFacilityElement = stopNames[1];
                    const facilityId = finalFacilityElement.textContent.trim();
    
                    if (!facilityId) {
                        console.error('Facility ID not found!');
                        return;
                    }
    
                    localStorage.setItem('facilityId', facilityId);
                    console.log('Stored Facility ID:', facilityId);
    
                    const vridElement = document.querySelector('td.borderless-fix span.vr-audit-dialog');
                    if (!vridElement) {
                        console.error('VRID element not found!');
                        return;
                    }
    
                    const vrid = vridElement.textContent.trim();
                    if (!vrid) {
                        console.error('VRID not found!');
                        return;
                    }
    
                    localStorage.setItem('vrid', vrid);
                    console.log('Stored VRID:', vrid);
    
                    // Create an iframe and retrieve data from it
                    createIframe('https://trans-logistics.amazon.com/sortcenter/vista/', async (iframe) => {
                        // Call useStoredVistaTime after the iframe is loaded and data is retrieved
                        useStoredVistaTime();
                    });
    
                    // Fetch drive time using the API
                    extractDriveTime(vrid, facilityId);
                });
    
                assetsContainer.appendChild(vistaButton);
                console.log('Vista button added to the page.');
    
                // Create and append the calculated-time-display element
                const calculatedTimeDisplay = document.createElement('div');
                calculatedTimeDisplay.id = 'calculated-time-display';
                calculatedTimeDisplay.style.marginTop = '10px';
                calculatedTimeDisplay.style.padding = '10px';
                calculatedTimeDisplay.style.backgroundColor = '#FF9900';
                calculatedTimeDisplay.style.color = 'black';
                calculatedTimeDisplay.style.borderRadius = '5px';
                calculatedTimeDisplay.style.fontSize = '16px';
                assetsContainer.appendChild(calculatedTimeDisplay);
            } else {
                console.warn('OutboundAmazonManaged text not found.');
            }
        }
    }
    
    // Call the addVistaButton function when the page loads
    document.addEventListener("DOMContentLoaded", addVistaButton);
    
    // Periodically check if the Vista button needs to be added
    setInterval(addVistaButton, 5000);

    // Function to extract the drive time from the iframe
    function extractDriveTime(vrid, facilityId) {
        const url = `https://track.relay.amazon.dev/api/v2/transport-views?id[]=NA:VR:${vrid}&id[]=NA:VR:${facilityId}`;
        console.log('Fetching drive time from URL:', url);

        GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            onload: function (response) {
                console.log('Response status:', response.status);
                if (response.status === 200) {
                    const data = JSON.parse(response.responseText);
                    console.log('API response data:', data);

                    // Assuming the drive time is in a property called 'driveTime'
                    const driveTime = data.driveTime; // Adjust this based on the actual API response structure
                    if (driveTime) {
                        console.log('Extracted Drive Time:', driveTime);

                        // Store the extracted drive time in local storage
                        localStorage.setItem('driveTime', driveTime);
                        console.log('Stored Drive Time in local storage:', driveTime);
                    } else {
                        console.error('Drive time not found in the API response.');
                    }
                } else {
                    console.error('Failed to fetch drive time:', response.status, response.statusText);
                }
            },
            onerror: function (error) {
                console.error('Error fetching drive time:', error);
            },
            onabort: function () {
                console.error('Request aborted');
            },
            ontimeout: function () {
                console.error('Request timed out');
            }
        });
    }

    function fetchDriveTime(vrid, facilityId) {
        const url = `https://track.relay.amazon.dev/navigation?m=trip&r=na&type=vehicleRun&q=${vrid}&status=IN_TRANSIT&column=scheduled_end&stops=NA%3AVR%3A${vrid}%2C${facilityId}`;
        console.log('Opening drive time URL in a new tab:', url);

        // Open the URL in a new tab
        window.open(url, '_blank');
    }


    async function calculateTime(entryDateTime) {
        // Simulate some asynchronous operation to calculate the time
        return new Promise((resolve) => {
            setTimeout(() => {
                const resultDate = new Date(entryDateTime.getTime()); // No additional time added
                resolve(resultDate);
            }, 1000);
        });
    }

    function waitForLocalStorageUpdate(key, timeout = 20000) { // Increased timeout to 20 seconds
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            const interval = setInterval(() => {
                const value = localStorage.getItem(key);
                if (value) {
                    clearInterval(interval);
                    resolve(value);
                } else if (Date.now() - startTime > timeout) {
                    clearInterval(interval);
                    reject(new Error(`Timeout waiting for localStorage key: ${key}`));
                }
            }, 100);
        });
    }

    // Function to show a loading message with spinner
    function showLoadingMessage(message) {
        let loadingElement = document.getElementById('loading-message');
        if (!loadingElement) {
            loadingElement = document.createElement('div');
            loadingElement.id = 'loading-message';
            loadingElement.style.marginTop = '10px';
            loadingElement.style.padding = '10px';
            loadingElement.style.backgroundColor = '#FF9900';
            loadingElement.style.color = 'black';
            loadingElement.style.borderRadius = '5px';
            loadingElement.style.fontSize = '16px';
            loadingElement.style.textAlign = 'center';
            document.body.appendChild(loadingElement);

            // Add spinner
            const spinner = document.createElement('div');
            spinner.id = 'loading-spinner';
            spinner.style.border = '8px solid #f3f3f3'; /* Light grey */
            spinner.style.borderTop = '8px solid #3498db'; /* Blue */
            spinner.style.borderRadius = '50%';
            spinner.style.width = '60px';
            spinner.style.height = '60px';
            spinner.style.animation = 'spin 2s linear infinite';
            spinner.style.margin = '20px auto';
            loadingElement.appendChild(spinner);
        }
        loadingElement.innerHTML = `<div>${message}</div>`;
    }

    // Function to hide the loading message
    function hideLoadingMessage() {
        const loadingElement = document.getElementById('loading-message');
        if (loadingElement) {
            loadingElement.remove();
        }
    }

    // Function to parse the stored vista time and date and use it with calculateTime
    async function useStoredVistaTime() {
        try {
            console.log('Using stored vista time and date...');
            showLoadingMessage('Fetching Critical Sort time...');
    
            // Wait for the vistaDate and vistaTime to be updated in local storage
            const time = await waitForLocalStorageUpdate('vistaTime', 20000); // Increased timeout to 20 seconds
            const date = await waitForLocalStorageUpdate('vistaDate', 20000); // Increased timeout to 20 seconds
    
            console.log('Retrieved vista time:', time);
            console.log('Retrieved vista date:', date);
    
            const [hours, minutes] = time.split(':').map(part => part.trim());
            const [month, day, year] = date.split('/').map(part => part.trim());
    
            if (!hours || !minutes || !month || !day || !year) {
                console.error('Invalid vista time or date components!', { hours, minutes, month, day, year });
                hideLoadingMessage();
                return;
            }
    
            // Create a Date object from the stored time and date
            const vistaDateTime = new Date(`${year}-${month}-${day}T${hours}:${minutes}:00`);
            console.log('Vista DateTime:', vistaDateTime);
    
            // Call calculateTime with the vistaDateTime
            const resultDate = await calculateTime(vistaDateTime);
            if (!resultDate) {
                console.error('Failed to calculate time');
                hideLoadingMessage();
                return;
            }
    
            console.log('Calculated Time:', resultDate);
    
            // Format the adjusted date and time in 24-hour format
            const adjustedDate = resultDate.toLocaleDateString('en-US');
            const adjustedTime = resultDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    
            console.log('Adjusted Date:', adjustedDate);
            console.log('Adjusted Time:', adjustedTime);
    
            const displayText = `Critical Sort: ${adjustedDate} @ ${adjustedTime}`;
    
            let displayElement = document.getElementById('calculated-time-display');
            if (!displayElement) {
                displayElement = document.createElement('div');
                displayElement.id = 'calculated-time-display';
                displayElement.style.marginTop = '10px';
                displayElement.style.padding = '10px';
                displayElement.style.backgroundColor = '#FF9900';
                displayElement.style.color = 'black';
                displayElement.style.borderRadius = '5px';
                displayElement.style.fontSize = '16px';
                document.body.appendChild(displayElement);
            }
            displayElement.innerHTML = `${displayText} <input type="text" id="additional-time-input" placeholder="Enter Drive Time" style="margin-left: 10px; padding: 5px; font-size: 14px;">`;
    
            hideLoadingMessage();
    
            // Add event listener to the input field with delay
            const inputField = document.getElementById('additional-time-input');
            let typingTimer; // Timer identifier
            const doneTypingInterval = 1000; // Time in ms (1 second)
    
            inputField.addEventListener('input', function () {
                clearTimeout(typingTimer);
                typingTimer = setTimeout(doneTyping, doneTypingInterval);
            });
    
            inputField.addEventListener('keydown', function () {
                clearTimeout(typingTimer);
            });
    
            function doneTyping() {
                const driveTime = parseInt(inputField.value);
                console.log('Entered drive time:', driveTime); // Debugging log
                if (!isNaN(driveTime)) {
                    showLoadingMessage('Calculating ITR time...');
    
                    const newDateTime = new Date(vistaDateTime.getTime());
                    newDateTime.setHours(newDateTime.getHours() - (driveTime + 6));
    
                    const newAdjustedDate = newDateTime.toLocaleDateString('en-US');
                    const newAdjustedTime = newDateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    
                    console.log('New Adjusted Date:', newAdjustedDate);
                    console.log('New Adjusted Time:', newAdjustedTime);
    
                    // Save the calculated date and time in local storage
                    localStorage.setItem('itrDate', newAdjustedDate);
                    localStorage.setItem('itrTime', newAdjustedTime);
    
                    const itrDisplayText = `ITR By: ${newAdjustedDate} @ ${newAdjustedTime}`;
                    const criticalSortText = `Critical Sort: ${adjustedDate} @ ${adjustedTime}`;
                    displayElement.innerHTML = `${criticalSortText} <input type="text" id="additional-time-input" placeholder="Enter Drive Time" style="margin-left: 10px; padding: 5px; font-size: 14px;"> <span style="margin-left: 10px;">${itrDisplayText}</span>`;
    
                    hideLoadingMessage();
                }
            }
        } catch (error) {
            console.error('Error waiting for localStorage update:', error);
            hideLoadingMessage();
        }
    }

    // Function to redesign the table with responsive design
    function redesignTable() {
        const table = document.querySelector('#fmc-execution-plans-vrs');
        if (table) {
            table.style.borderCollapse = 'collapse';
            table.querySelectorAll('thead th').forEach(th => {
                th.style.backgroundColor = '#FF9900';
                th.style.color = 'black';
            });
            table.querySelectorAll('tbody tr:nth-child(even)').forEach(row => {
                row.style.backgroundColor = '#f2f2f2';
            });

            // Inject responsive CSS
            const style = document.createElement('style');
            style.innerHTML = `
            /* Basic table styling */
            #fmc-execution-plans-vrs {
                width: 100%;
                border-collapse: collapse;
            }

            #fmc-execution-plans-vrs th, #fmc-execution-plans-vrs td {
                padding: 8px;
                text-align: left;
                border: 1px solid #ddd;
            }

            /* Responsive design for smaller screens */
            @media screen and (max-width: 768px) {
                #fmc-execution-plans-vrs, #fmc-execution-plans-vrs thead, #fmc-execution-plans-vrs tbody, #fmc-execution-plans-vrs th, #fmc-execution-plans-vrs td, #fmc-execution-plans-vrs tr {
                    display: block;
                }

                #fmc-execution-plans-vrs thead tr {
                    display: none;
                }

                #fmc-execution-plans-vrs tr {
                    margin-bottom: 15px;
                }

                #fmc-execution-plans-vrs td {
                    text-align: right;
                    padding-left: 50%;
                    position: relative;
                }

                #fmc-execution-plans-vrs td:before {
                    content: attr(data-label);
                    position: absolute;
                    left: 0;
                    width: 50%;
                    padding-left: 15px;
                    font-weight: bold;
                    text-align: left;
                }
            }

            /* Hide less important columns on smaller screens */
            @media screen and (max-width: 768px) {
                .hide-on-small {
                    display: none;
                }
            }
        `;
            document.head.appendChild(style);

            // Add data-label attributes to each cell for responsive design
            const headers = table.querySelectorAll('thead th');
            table.querySelectorAll('tbody tr').forEach(row => {
                row.querySelectorAll('td').forEach((cell, index) => {
                    if (headers[index]) {
                        cell.setAttribute('data-label', headers[index].textContent.trim());
                    }
                });
            });
        }
    }

    // Call the redesignTable function when the page loads
    document.addEventListener("DOMContentLoaded", redesignTable);

    // Use MutationObserver to call redesignTable when the table is added to the DOM
    const tableObserver = new MutationObserver((mutationsList, observer) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                const table = document.querySelector('#fmc-execution-plans-vrs');
                if (table) {
                    redesignTable();
                    // observer.disconnect(); // Stop observing once the table is found and redesigned
                    break;
                }
            }
        }
    });

    // Start observing the document body for changes
    tableObserver.observe(document.body, { childList: true, subtree: true });

    // Wait for the loading screen to disappear using MutationObserver
    function waitForLoadingToFinish(callback) {
        const loadingObserver = new MutationObserver((mutationsList, observer) => {
            const loadingElement = document.getElementById('block-ui-container');
            if (loadingElement && loadingElement.classList.contains('hidden')) {
                callback();
                observer.disconnect();
            }
        });

        loadingObserver.observe(document.body, {
            childList: true,
            subtree: true,
        });
    }

    // Fetch fc_origin and fc_final from the page
    function fetchFacilityData() {
        const fcOriginElement = document.querySelector('.origin-facility-selector');
        const fcFinalElement = document.querySelector('.final-facility-selector');

        const fcOrigin = fcOriginElement ? fcOriginElement.textContent.trim() : 'Unknown Origin';
        const fcFinal = fcFinalElement ? fcFinalElement.textContent.trim() : 'Unknown Final';

        console.log('Facility Origin:', fcOrigin);
        console.log('Facility Final:', fcFinal);

        return { fcOrigin, fcFinal };
    }

    // Page Handling
    if (window.location.pathname.includes('/fmc/execution/')) {
        highlightRunStructureLink();
        redesignTable();
        addVistaButton();
        document.addEventListener("DOMContentLoaded", addFacilityClasses);
        handleFMCPage(); // Call handleFMCPage when the FMC page loads
    } else if (window.location.pathname.includes('/wims/related/SCAC')) {
        const relatedScacPattern = /\/wims\/related\/SCAC\/[^/]+/;
        if (relatedScacPattern.test(window.location.pathname)) {
            // Wait for 5 seconds and then redirect to /wims
            setTimeout(() => {
                window.location.pathname = '/wims';
            }, 5000);
        }
    } else if (window.location.pathname.includes('/wims')) {
        if (!document.getElementById('refresh-timer')) {
            createTimer();
        }
        waitForLoadingToFinish(() => {
            checkAndSelectOptions();
            navigateToTaskDetail();
            const { fcOrigin, fcFinal } = fetchFacilityData();
            console.log('Origin Facility:', fcOrigin);
            console.log('Final Facility:', fcFinal);
        });
    }
    setInterval(updateCounter, 1000);
    setInterval(checkAndSelectOptions, 60000);
})();