// ==UserScript==
// @name         Vista-Tool
// @namespace    http://tampermonkey.net/
// @version      1.7
// @updateURL    https://github.com/zbayle/ROC-RECOVERY-TM/raw/refs/heads/main/Vista-Tool.js
// @downloadURL  https://github.com/zbayle/ROC-RECOVERY-TM/raw/refs/heads/main/Vista-Tool.js
// @description  Combines the functionality of displaying hover box data with time and packages and auto-filling VRID with scroll, enter, and hover.
// @author       zbbayle
// @match        https://trans-logistics.amazon.com/sortcenter/vista/*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    // Function to create a floating container for displaying hover data
    function createHoverDataContainer() {
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
        document.body.appendChild(container);

        // Initialize with a default message
        updateHoverDataContainer('Hover over an element to see data');
    }

    // Function to update the hover data container content with time and packages
    function updateHoverDataContainer(content) {
        const container = document.getElementById('hoverDataContainer');
        if (container) {
            container.innerHTML = `
                <h3 style="margin-top: 0;">Package Data</h3>
                <ul style="list-style: none; padding: 0; margin: 0;">
                    ${content}
                </ul>
            `;
        }
    }

    // Function to observe and extract data from tooltips
    function observeTooltips() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1 && node.classList.contains('tooltipTitle')) {
                        console.log('Tooltip detected:', node);
                        // Grab the data from the tooltip
                        const list = node.querySelector('.listWithoutStyle.slamCptList');
                        if (list) {
                            console.log('List found in tooltip:', list);
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
                                console.log(`Cumulative packages: ${cumulativePackages}`);
                            
                                // Check if threshold is met and highlight the row
                                if (!thresholdMet && cumulativePackages >= 300) {
                                    item.classList.add('cptEntry');
                                    item.style.border = '4px groove #50ff64';
                                    item.style.borderRadius = '10px';
                                    item.style.backgroundColor = 'white';
                                    item.style.fontWeight = 'bold';
                                    thresholdMet = true;
                            
                                    // Add green border to the specific li element in the hoverDataContainer
                                    content += `<li style="margin-bottom: 5px;color:black;border: 4px groove #50ff64;border-radius: 10px;"><strong>${time}</strong> - Packages: ${pkgs}</li>`;
                                } else {
                                    content += `<li style="margin-bottom: 5px;color:black;"><strong>${time}</strong> - Packages: ${pkgs}</li>`;
                                }
                            });
                            
                            // If the cumulative package count is under 300, add a new li element
                            if (cumulativePackages < 300) {
                                content += `<li style="margin-bottom: 5px;color:red;border: 4px groove red;border-radius: 10px;"><strong>PACKAGE COUNT UNDER 300</strong></li>`;
                            }
                            
                            updateHoverDataContainer(content);
                        } else {
                            console.log('List not found in tooltip');
                        }
                    }
                });
            });
        });

        // Start observing the DOM for new nodes
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Function to wait for the page to load and then select the facility
    function selectFacility(doc) {
        const facilitySelect = doc.querySelector('select#availableNodeName');

        if (facilitySelect) {
            const facilityId = localStorage.getItem('facilityId');
            if (facilityId) {
                const optionToSelect = Array.from(facilitySelect.options).find(option => option.id === facilityId);

                if (optionToSelect) {
                    // Check if the value is already selected
                    if (facilitySelect.value !== optionToSelect.value) {
                        facilitySelect.value = optionToSelect.value;
                        const changeEvent = new Event('change');
                        facilitySelect.dispatchEvent(changeEvent);
                    }
                } else {
                    console.error('Facility ID not found in the dropdown options.');
                }
            } else {
                console.error('No Facility ID found in localStorage.');
            }
        } else {
            console.error('Facility select element not found.');
        }
    }

    // Function to wait for the VRID field and simulate keystroke
    function waitForVRIDInputAndSet(doc) {
        const vrid = localStorage.getItem('vrid'); // Retrieve VRID from localStorage
        if (!vrid) {
            console.error('No VRID found in localStorage!');
            return;
        }

        // Locate the Filter input field
        const filterInput = doc.querySelector('#inboundDataTables_filter input[type="text"]');
        if (!filterInput) {
            console.error('Filter input field not found!');
            return;
        }

        // Stop further VRID setting if it's already set
        if (filterInput.value === vrid) {
            return;
        }

        // Set the VRID value into the input field
        filterInput.value = vrid;
        const inputEvent = new Event('input', { bubbles: true, cancelable: true });
        filterInput.dispatchEvent(inputEvent);

        // Focus on the input field before dispatching Enter key
        filterInput.focus();

        // Simulate pressing the Enter key directly on the VRID input field
        const enterKeyEvent = new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            bubbles: true,
            cancelable: true
        });

        // Dispatch the Enter key event
        filterInput.dispatchEvent(enterKeyEvent);

        // Optionally, dispatch 'keyup' and 'input' events to trigger full form submission logic if needed
        const keyUpEvent = new KeyboardEvent('keyup', {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            bubbles: true,
            cancelable: true
        });
        filterInput.dispatchEvent(keyUpEvent);

        // Scroll the input field into view
        filterInput.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Emulate a mouseover on the progress bar
        hoverProgressBar(doc);
    }

    // Function to emulate mouseover on the progress bar
    function hoverProgressBar(doc) {
        const progressBar = doc.querySelector('.progressbarib'); // Locate the progress bar
        if (!progressBar) {
            console.error('Progress bar not found!');
            return;
        }

        // Create and dispatch a mouseover event
        const mouseOverEvent = new MouseEvent('mouseover', {
            bubbles: true,
            cancelable: true
        });
        progressBar.dispatchEvent(mouseOverEvent);

        // Set a timeout to dispatch the mouseleave event after 500ms
        setTimeout(() => {
            const mouseLeaveEvent = new MouseEvent('mouseleave', {
                bubbles: true,
                cancelable: true
            });
            progressBar.dispatchEvent(mouseLeaveEvent);
        }, 500); // Delay of 500ms
    }

    // Wait for page load or any other significant loading elements
    function waitForPageLoad(callback, doc) {
        const observer = new MutationObserver(() => {
            const loadingElement = doc.querySelector('#block-ui-container');
            if (!loadingElement || loadingElement.classList.contains('hidden')) {
                callback();
            }
        });

        observer.observe(doc.body, {
            childList: true,
            subtree: true
        });
    }

    // Main logic that runs after the page is loaded
    function main(doc) {
        waitForPageLoad(() => {
            selectFacility(doc);
            waitForVRIDInputAndSet(doc);
        }, doc);
    }

    // Check if the script is running inside an iframe or the main window
    if (window.self !== window.top) {
        // Running inside an iframe
        window.addEventListener('load', () => {
            const iframeDocument = window.document;
            main(iframeDocument);
        });
    } else {
        // Running in the main window
        window.addEventListener('load', () => {
            main(document);
        });
    }

    // Initialize hover data container and observe tooltips
    createHoverDataContainer();
    observeTooltips();
})();