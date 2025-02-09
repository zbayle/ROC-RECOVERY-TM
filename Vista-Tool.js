// ==UserScript==
// @name         Vista-Tool
// @namespace    http://tampermonkey.net/
// @version      1.11.8
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
        const iframe = document.querySelector('iframe[src="https://trans-logistics.amazon.com/sortcenter/vista/"]');
        if (iframe) {
            iframe.onload = () => {
                console.log('Iframe loaded:', iframe);
                callback(iframe);
            };
            console.log('Iframe found, waiting for it to load:', iframe);
        } else {
            console.error('Iframe not found! Retrying in 1 second...');
            setTimeout(() => waitForIframe(callback), 1000); // Retry after 1 second
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

    // Main logic that runs after the page is loaded
    function main(doc) {
        console.log('Main function started...');
        waitForIframe((iframe) => {
            retrieveDataFromIframe(iframe);
        });
    }

    // Run the main function after the DOM is fully loaded
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOMContentLoaded event fired...');
        main(document);
    });
})();