// ==UserScript==
// @name         WIM Auto-Accept Timer
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Runs a timer when auto-accepting a WIM on the WIMS page.
// @author       Your Name
// @match        https://optimus-internal.amazon.com/wims*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Function to play a sound
    function playSound() {
        const audio = new Audio('https://example.com/sound.mp3'); // Replace with your sound URL
        audio.play();
    }

    // Function to click the assign button with a timer
    function clickAssignButtonWithTimer(button) {
        let countdown = 5; // 5 seconds countdown
        const interval = setInterval(() => {
            console.log(`Assign button will be clicked in ${countdown} seconds...`);
            countdown--;
            if (countdown < 0) {
                clearInterval(interval);
                button.click();
                console.log("Assign button clicked.");
            }
        }, 1000); // Update every second
    }

    // Function to observe WIM alerts and auto-accept
    function observeWIMAlerts() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) {
                            const assignButton = node.querySelector('.btn-primary.btn-block.btn.btn-info');
                            if (assignButton) {
                                console.log("Assign to me button detected.");
                                playSound();
                                clickAssignButtonWithTimer(assignButton);
                            }
                        }
                    });
                }
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
        console.log("MutationObserver is now observing the DOM.");
    }

    // Start observing WIM alerts when the page loads
    window.addEventListener('load', () => {
        observeWIMAlerts();
    });
})();