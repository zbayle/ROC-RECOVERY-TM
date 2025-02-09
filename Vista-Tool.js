// ==UserScript==
// @name         Vista-Tool
// @namespace    http://tampermonkey.net/
// @version      1.12.0
// @updateURL    https://github.com/zbbayle/ROC-RECOVERY-TM/raw/refs/heads/main/Vista-Tool.js
// @downloadURL  https://github.com/zbayle/ROC-RECOVERY-TM/raw/refs/heads/main/Vista-Tool.js
// @description  Combines the functionality of displaying hover box data with time and packages and auto-filling VRID with scroll, enter, and hover, and stores the time and date of the entry that reaches 300 packages in local storage.
// @author       zbbayle
// @match        https://trans-logistics.amazon.com/sortcenter/vista/*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    // Function to retrieve data from the iframe
    function retrieveDataFromIframe(iframe) {
        try {
            console.log('Attempting to retrieve data from iframe...');
            const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
            console.log('Iframe document accessed:', iframeDocument);

            // Simulate mouse over event on .progressbarib
            simulateMouseOver(iframeDocument.querySelector('.progressbarib'));

            // Retry mechanism to wait for the destination element to be available
            function waitForDestinationElement() {
                const destinationElement = iframeDocument.querySelector('.cptEntry');
                if (!destinationElement) {
                    console.error('Destination element not found! Retrying in 1 second...');
                    setTimeout(waitForDestinationElement, 1000); // Retry after 1 second
                    return;
                }
                console.log('Destination element found:', destinationElement);

                const destinationID = destinationElement.textContent.trim();
                localStorage.setItem('destinationID', destinationID);
                console.log('Stored Destination ID:', destinationID);

                const entryDateTimeElement = destinationElement.querySelector('strong');
                if (!entryDateTimeElement) {
                    console.error('Entry DateTime element not found!');
                    return;
                }
                console.log('Entry DateTime element found:', entryDateTimeElement);

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
                console.log('Entry DateTime split into parts:', parts);

                const time = parts[0];
                const date = parts[1];

                if (!time || !date) {
                    console.error('Invalid time or date!', { time, date });
                    return;
                }
                console.log('Time and date extracted:', { time, date });

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

                // Reintroduce the following line with additional logging and error handling
                calculateTime(entryDateTime).then(displayCalculatedTime).catch(error => {
                    console.error('Error in calculateTime or displayCalculatedTime:', error);
                });

                // Set the VRID in the filter input field
                setFilterInput(destinationID);
            }

            waitForDestinationElement();
        } catch (error) {
            console.error('Error retrieving data from iframe:', error);
        }
    }

    // Dummy implementation of calculateTime for testing purposes
    function calculateTime(entryDateTime) {
        return new Promise((resolve, reject) => {
            console.log('Calculating time for:', entryDateTime);
            // Simulate some asynchronous operation
            setTimeout(() => {
                const calculatedTime = 'Calculated Time: ' + entryDateTime;
                resolve(calculatedTime);
            }, 1000);
        });
    }

    // Dummy implementation of displayCalculatedTime for testing purposes
    function displayCalculatedTime(calculatedTime) {
        console.log('Displaying calculated time:', calculatedTime);
        const displayElement = document.getElementById('calculated-time-display');
        if (displayElement) {
            displayElement.textContent = calculatedTime;
        } else {
            console.error('Display element not found!');
        }
    }

    // Function to wait for the iframe to be available
    function waitForIframe(callback) {
        console.log('Waiting for iframe to be available...');
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                const iframe = document.querySelector('iframe[src="https://trans-logistics.amazon.com/sortcenter/vista/"]');
                if (iframe) {
                    console.log('Iframe found:', iframe);
                    observer.disconnect();
                    callback(iframe);
                }
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });

        // Initial check in case the iframe is already available
        const iframe = document.querySelector('iframe[src="https://trans-logistics.amazon.com/sortcenter/vista/"]');
        if (iframe) {
            console.log('Iframe found initially:', iframe);
            observer.disconnect();
            callback(iframe);
        }
    }

    // Function to simulate mouse over event
    function simulateMouseOver(element) {
        if (element) {
            const event = new MouseEvent('mouseover', {
                view: window,
                bubbles: true,
                cancelable: true
            });
            element.dispatchEvent(event);
            console.log('Mouse over event simulated on:', element);
        } else {
            console.error('Element .progressbarib not found!');
        }
    }

    // Function to set the VRID in the filter input field
    function setFilterInput(vrid) {
        console.log('Setting VRID in filter input:', vrid);
        const filterInput = document.querySelector('#inboundDataTables_filter input[type="text"]');
        if (filterInput) {
            filterInput.value = vrid;
            console.log('Set VRID in filter input:', vrid);
        } else {
            console.error('Filter input not found!');
        }
    }

    // Function to update the container with the extracted content
    function updateContainer(content) {
        const container = document.getElementById('calculated-time-display');
        if (container) {
            container.innerHTML = content;
            console.log('Updated container with content:', content);
        } else {
            console.error('Container not found!');
        }
    }

    // Watch for the addition of the tooltipTitle element
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1 && node.classList.contains('tooltipTitle')) {
                    console.log('tooltipTitle element added:', node);
                    // Grab the data from the tooltip
                    const list = node.querySelector('.listWithoutStyle.slamCptList');
                    if (list) {
                        console.log('List found in tooltipTitle:', list);
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
                            if (!thresholdMet && cumulativePackages >= 300) {
                                item.classList.add('cptEntry');
                                item.style.border = '4px ridge #50ff64';
                                item.style.backgroundColor = 'white';
                                item.style.fontWeight = 'bold';
                                thresholdMet = true;
                            }

                            content += `<li style="margin-bottom: 5px;color:black;"><strong>${time}</strong> - Packages: ${pkgs}</li>`;
                        });

                        updateContainer(content);
                    }
                }
            });
        });
    });

    // Start observing the DOM for new nodes
    observer.observe(document.body, { childList: true, subtree: true });

    // Function to select the facility
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
            console.log('Filter input field scrolled into view.');

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
        console.log('Mouseover event dispatched on the progress bar.');

        // Set a timeout to dispatch the mouseleave event after 500ms
        setTimeout(() => {
            const mouseLeaveEvent = new MouseEvent('mouseleave', {
                bubbles: true,
                cancelable: true
            });
            progressBar.dispatchEvent(mouseLeaveEvent);
            console.log('Mouseleave event dispatched on the progress bar.');
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

    // Run the main function after the DOM is fully loaded
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOMContentLoaded event fired...');
        main(document);
    });

    // Wait for the iframe to be available and retrieve data from it
    waitForIframe((iframe) => {
        retrieveDataFromIframe(iframe);
    });

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
    document.body.appendChild(container);

    // Initialize with a default message
    updateContainer('Hover over an element to see data');
})();