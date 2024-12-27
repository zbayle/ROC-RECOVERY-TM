// ==UserScript==
// @name         WIMS and FMC Interaction
// @namespace    http://tampermonkey.net/
// @version      1.6
// @updateURL    https://github.com/zbayle/ROC-RECOVERY-TM/raw/refs/heads/main/WIMS and FMC Interaction.user.js
// @downloadURL  https://github.com/zbayle/ROC-RECOVERY-TM/raw/refs/heads/main/WIMS and FMC Interaction.user.js
// @description  Enhanced script for WIMS and FMC with refresh timers, table redesign, toggle switches, and ITR BY integration.
// @author       zbbayle
// @match        https://optimus-internal.amazon.com/wims*
// @match        https://trans-logistics.amazon.com/fmc/execution/*
// @match        https://trans-logistics.amazon.com/sortcenter/vista/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    let highlightRunStructure = true;

    // Utility function to find elements by text
    function findElementByText(selector, text) {
        return [...document.querySelectorAll(selector)].find(el => el.textContent.includes(text));
    }

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
            } else {
                counterElement.textContent = 60;
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
            console.log('One or both filters missing. Applying filters.');
            const filterContainer = document.querySelector('.filter-input-container.form-control.clearfix');
            if (!filterContainer) {
                console.error('Filter input container not found.');
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

    // FMC Page Enhancements
    function handleFMCPage() {
        const fmcLink = document.querySelector('a[href^="https://trans-logistics.amazon.com/fmc/execution/search/"]');
        if (fmcLink) {
            window.open(fmcLink.href, '_blank');
        }

        setTimeout(() => {
            const runStructureCell = findElementByText('td a', 'run-structure');
            if (runStructureCell) {
                runStructureCell.parentElement.style.border = '4px solid #3cff00';
            }
        }, 2000);
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


    function removeGreenBorders() {
        const runStructureLinks = document.querySelectorAll('td a[href*="run-structure"]');
        runStructureLinks.forEach(link => {
            link.style.border = '';
        });
    }

    function addVistaButton() {
        const retryInterval = setInterval(() => {
            console.log('Checking for assets container...');
            const assetsContainer = document.querySelector('td.assets');

            if (assetsContainer) {
                console.log('Assets container found!');
                clearInterval(retryInterval);

                // Check for "OutboundAmazonManaged" and show the button if found
                const outboundAmazonManagedText = [...document.querySelectorAll('table.clear-table.full-width td')].find(td => td.textContent.includes('OutboundAmazonManaged'));
                if (outboundAmazonManagedText) {
                    console.log('OutboundAmazonManaged text found!');

                    // Create a new button element
                    const vistaButton = document.createElement('button');
                    vistaButton.textContent = 'Open Vista';
                    vistaButton.style.backgroundColor = '#FF9900';
                    vistaButton.style.color = 'black';
                    vistaButton.style.padding = '10px 20px';
                    vistaButton.style.border = 'none';
                    vistaButton.style.cursor = 'pointer';
                    vistaButton.style.borderRadius = '5px';
                    vistaButton.style.fontSize = '16px';

                    // Add an event listener to open the Vista URL
                    vistaButton.addEventListener('click', async function () {
                        console.log('Vista button clicked!');

                        // Select the second 'span.vr-stop-name' element
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

                        // Store the facilityId in localStorage
                        localStorage.setItem('facilityId', facilityId);
                        console.log('Stored Facility ID:', facilityId);

                        // Open the Vista page in a new tab
                        const link = document.createElement('a');
                        link.href = `https://trans-logistics.amazon.com/sortcenter/vista/?facility=${facilityId}`;
                        link.target = '_blank';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    });

                    // Append the button to the assets container
                    assetsContainer.appendChild(vistaButton);
                    console.log('Vista button added to the page.');
                } else {
                    console.warn('OutboundAmazonManaged text not found.');
                }
            } else {
                console.warn('Assets container not found. Retrying...');
            }
        }, 500);
    }

    // Table Redesign
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
        }
    }

    // Wait for the loading screen to disappear using MutationObserver
    function waitForLoadingToFinish(callback) {
        const observer = new MutationObserver((mutationsList, observer) => {
            const loadingElement = document.getElementById('block-ui-container');
            if (loadingElement && loadingElement.classList.contains('hidden')) {
                callback();
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
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
    } else if (window.location.pathname.includes('/wims')) {
        createTimer();
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
