// ==UserScript==
// @name         Vista-Tool
// @namespace    http://tampermonkey.net/
// @version      1.10.4
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

        function appendIframe() {
            const container = document.querySelector('.expanded-child-table-container');
            console.log('Container:', container);

            if (container) {
                container.appendChild(iframe);
                console.log('Iframe appended to container.');
            } else {
                console.error('Container not found! Retrying in 1 second...');
                setTimeout(appendIframe, 1000); // Retry after 1 second
            }
        }

        appendIframe();
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

            // Reintroduce the following line with additional logging and error handling
            calculateTime(entryDateTime).then(displayCalculatedTime).catch(error => {
                console.error('Error in calculateTime or displayCalculatedTime:', error);
            });
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

    // Main logic that runs after the page is loaded
    function main(doc) {
        createIframe('https://trans-logistics.amazon.com/sortcenter/vista/', (iframe) => {
            retrieveDataFromIframe(iframe);
        });
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