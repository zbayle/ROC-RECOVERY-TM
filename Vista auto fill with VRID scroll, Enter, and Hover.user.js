// ==UserScript==
// @name         Vista auto fill with VRID scroll, Enter, and Hover
// @namespace    http://tampermonkey.net/
// @version      1.2
// @updateURL    https://github.com/zbayle/ROC-RECOVERY-TM/raw/refs/heads/main/Vista%20auto%20fill%20with%20VRID%20scroll,%20Enter,%20and%20Hover.user.js
// @downloadURL  https://github.com/zbayle/ROC-RECOVERY-TM/raw/refs/heads/main/Vista%20auto%20fill%20with%20VRID%20scroll,%20Enter,%20and%20Hover.user.js
// @description  Automatically selects the facility in the dropdown, sets VRID in the filter input, presses Enter, scrolls into view, and hovers over the progress bar.
// @author       You
// @match        https://trans-logistics.amazon.com/sortcenter/vista/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    // Function to wait for the page to load and then select the facility
    function selectFacility() {
        const facilitySelect = document.querySelector('select#availableNodeName');

        if (facilitySelect) {
            console.log('Found facility select element!');

            const facilityId = localStorage.getItem('facilityId');
            console.log("Facility ID from localStorage:", facilityId);

            if (facilityId) {
                const optionToSelect = Array.from(facilitySelect.options).find(option => option.id === facilityId);

                if (optionToSelect) {
                    // Check if the value is already selected
                    if (facilitySelect.value !== optionToSelect.value) {
                        facilitySelect.value = optionToSelect.value;
                        const changeEvent = new Event('change');
                        facilitySelect.dispatchEvent(changeEvent);

                        console.log('Facility selected:', optionToSelect.textContent);
                    } else {
                        console.log('Facility is already selected.');
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
    function waitForVRIDInputAndSet() {
        const vrid = localStorage.getItem('vrid'); // Retrieve VRID from localStorage
        if (!vrid) {
            console.error('No VRID found in localStorage!');
            return;
        }

        // Locate the Filter input field
        const filterInput = document.querySelector('#inboundDataTables_filter input[type="text"]');
        if (!filterInput) {
            console.error('Filter input field not found!');
            return;
        }

        // Stop further VRID setting if it's already set
        if (filterInput.value === vrid) {
            console.log('VRID is already set.');
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
        hoverProgressBar();
    }

    // Function to emulate mouseover on the progress bar
    function hoverProgressBar() {
        const progressBar = document.querySelector('.progressbarib'); // Locate the progress bar
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
    function waitForPageLoad(callback) {
        const observer = new MutationObserver(() => {
            const loadingElement = document.querySelector('#block-ui-container');
            if (!loadingElement || loadingElement.classList.contains('hidden')) {
                callback();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Main logic that runs after the page is loaded
    waitForPageLoad(() => {
        selectFacility();
        waitForVRIDInputAndSet();
    });
})();

