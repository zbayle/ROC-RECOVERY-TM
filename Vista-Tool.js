// ==UserScript==
// @name         Vista-Tool
// @namespace    http://tampermonkey.net/
// @version      1.10.0
// @updateURL    https://github.com/zbayle/ROC-RECOVERY-TM/raw/refs/heads/main/Vista-Tool.js
// @downloadURL  https://github.com/zbayle/ROC-RECOVERY-TM/raw/refs/heads/main/Vista-Tool.js
// @description  Combines the functionality of displaying hover box data with time and packages and auto-filling VRID with scroll, enter, and hover, and stores the time and date of the entry that reaches 300 packages in local storage.
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
                        const lists = node.querySelectorAll('.listWithoutStyle.slamCptList');
                        if (lists.length > 0) {
                            lists.forEach((list, listIndex) => {
                                console.log(`List ${listIndex + 1} found in tooltip:`, list);
                                // Extract and format the time and package info
                                let content = '';
                                let cumulativePackages = 0;
                                let thresholdMet = false;
                                const items = list.querySelectorAll('li');

                                if (items.length === 0) {
                                    console.log('No list items found in tooltip');
                                }

                                items.forEach((item, index) => {
                                    console.log('Processing item:', item);
                                    const timeElement = item.querySelector('.cpt');
                                    const pkgsElement = item.querySelector('.pkgs');
                                    
                                    const timeAndDate = timeElement ? timeElement.innerText.split('  ') : ['', ''];
                                    const time = timeAndDate[0];
                                    const date = timeAndDate[1];
                                    const pkgsText = pkgsElement ? pkgsElement.innerText : '0';
                                    const pkgs = parseInt(pkgsText.replace(/[^0-9]/g, '')) || 0;

                                    console.log(`Time: ${time}, Date: ${date}, Packages: ${pkgs}`);

                                    if (time && date) {
                                        // Convert date format from "6-Feb" to "02/06/2025"
                                        const dateParts = date.split('-');
                                        const day = dateParts[0].padStart(2, '0');
                                        const monthName = dateParts[1];
                                        const monthMapping = {
                                            'Jan': '01',
                                            'Feb': '02',
                                            'Mar': '03',
                                            'Apr': '04',
                                            'May': '05',
                                            'Jun': '06',
                                            'Jul': '07',
                                            'Aug': '08',
                                            'Sep': '09',
                                            'Oct': '10',
                                            'Nov': '11',
                                            'Dec': '12'
                                        };
                                        const month = monthMapping[monthName];
                                        const formattedDate = `${month}/${day}/2025`;

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

                                            // Store the time and date in local storage
                                            localStorage.setItem('thresholdTime', time);
                                            localStorage.setItem('thresholdDate', formattedDate);
                                            console.log(`Stored threshold time: ${time}`);
                                            console.log(`Stored threshold date: ${formattedDate}`);

                                            // Add green border to the specific li element in the hoverDataContainer
                                            content += `<li style="margin-bottom: 5px;color:black;border: 4px groove #50ff64;border-radius: 10px;"><strong>${time}</strong> - Packages: ${pkgs}</li>`;
                                        } else {
                                            content += `<li style="margin-bottom: 5px;color:black;"><strong>${time}</strong> - Packages: ${pkgs}</li>`;
                                        }
                                    } else {
                                        console.log('Time or date not found in item:', item);
                                    }
                                });

                                // If the cumulative package count is under 300, add a new li element
                                if (cumulativePackages < 300) {
                                    content += `<li style="margin-bottom: 5px;color:red;border: 4px groove red;border-radius: 10px;"><strong>PACKAGE COUNT UNDER 300</strong></li>`;
                                }

                                updateHoverDataContainer(content);
                            });
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
    
        const intervalId = setInterval(() => {
            // Locate the Filter input field
            const filterInput = doc.querySelector('#inboundDataTables_filter input[type="text"]');
            if (!filterInput) {
                console.error('Filter input field not found!');
                return;
            }
    
            // Stop further VRID setting if it's already set
            if (filterInput.value === vrid) {
                console.log('VRID is already set.');
                clearInterval(intervalId); // Stop the interval
                return;
            }
    
            // Set the VRID value into the input field
            filterInput.value = vrid;
            const inputEvent = new Event('input', { bubbles: true, cancelable: true });
            filterInput.dispatchEvent(inputEvent);
    
            console.log('VRID set in the filter input field:', vrid);
    
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
    
            console.log('Enter key events dispatched for VRID input field.');
    
            // Scroll the input field into view
            filterInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
            // Emulate a mouseover on the progress bar
            hoverProgressBar(doc);
    
            clearInterval(intervalId); // Stop the interval after setting the VRID
        }, 4000); // Check every 4 seconds
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

    // Function to create and append an iframe
    function createIframe(url, callback) {
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.height = '500px';
        iframe.src = url;

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
            container.appendChild(iframe);
        } else {
            console.error('Container not found!');
        }
    }

    // Function to retrieve data from the iframe
    function retrieveDataFromIframe(iframe) {
        try {
            const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
            const destinationElement = iframeDocument.querySelector('.cptEntry');
            if (!destinationElement) {
                console.error('Destination element not found!');
                return;
            }

            const destinationID = destinationElement.textContent.trim();
            localStorage.setItem('destinationID', destinationID);
            console.log('Stored Destination ID:', destinationID);

            const entryDateTimeElement = destinationElement.querySelector('strong');
            if (!entryDateTimeElement) {
                console.error('Entry DateTime element not found!');
                return;
            }

            const entryDateTime = entryDateTimeElement.textContent.trim();
            if (!entryDateTime) {
                console.error('Entry DateTime not found!');
                return;
            }

            console.log('Retrieved Entry DateTime:', entryDateTime);

            // Split the entryDateTime into time and date
            const parts = entryDateTime.split('  ').map(part => part.trim());
            if (parts.length !== 2) {
                console.error('Invalid entryDateTime format!', entryDateTime);
                return;
            }

            const time = parts[0];
            const date = parts[1];

            if (!time || !date) {
                console.error('Invalid time or date!', { time, date });
                return;
            }

            // Reformat the date to MM/DD/YYYY
            const [day, monthName] = date.split('-').map(part => part.trim());
            const monthMapping = {
                'Jan': '01',
                'Feb': '02',
                'Mar': '03',
                'Apr': '04',
                'May': '05',
                'Jun': '06',
                'Jul': '07',
                'Aug': '08',
                'Sep': '09',
                'Oct': '10',
                'Nov': '11',
                'Dec': '12'
            };
            const month = monthMapping[monthName];
            const year = new Date().getFullYear(); // Assuming the current year
            const formattedDate = `${month}/${day}/${year}`;

            localStorage.setItem('thresholdTime', time);
            localStorage.setItem('thresholdDate', formattedDate);

            console.log('Stored threshold time:', time);
            console.log('Stored threshold date:', formattedDate);

            calculateTime(entryDateTime).then(displayCalculatedTime);
        } catch (error) {
            console.error('Error retrieving data from iframe:', error);
        }
    }

    // Main logic that runs after the page is loaded
    function main(doc) {
        waitForPageLoad(() => {
            selectFacility(doc);
            waitForVRIDInputAndSet(doc);
            createHoverDataContainer();
            observeTooltips();
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
})();