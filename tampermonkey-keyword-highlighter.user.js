// ==UserScript==
// @name         ROC Tools with Floating Menu
// @namespace    http://tampermonkey.net/
// @version      1.0.1
// @description  Highlight specified keywords dynamically with custom colors using a floating menu in Tampermonkey.
// @author       zbbayle
// @match        *://*/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/zbayle/tampermonkey-keyword-highlighter/main/tampermonkey-keyword-highlighter.user.js
// @downloadURL  https://raw.githubusercontent.com/zbayle/tampermonkey-keyword-highlighter/main/tampermonkey-keyword-highlighter.user.js
// ==/UserScript==

(function() {
    'use strict';

    // Create floating menu and styles
    const menuHTML = `
        <div id="hamburger-menu" style="
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: #333;
            color: white;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 1000;
            font-size: 24px;
        ">☰</div>
        <div id="menu-content" style="
            position: fixed;
            bottom: 80px;
            right: 20px;
            background-color: white;
            border: 1px solid #ccc;
            border-radius: 10px;
            padding: 10px;
            display: none;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            z-index: 1000;
        ">
            <input type="text" id="keyword-input" placeholder="Enter keyword" style="
                margin: 5px 0;
                width: 100%;
                padding: 5px;
            "/>
            <input type="color" id="color-input" style="
                margin: 5px 0;
                width: 100%;
                padding: 5px;
            "/>
            <button id="add-keyword" style="
                margin-top: 10px;
                padding: 5px 10px;
                cursor: pointer;
                background-color: #333;
                color: white;
                border: none;
                border-radius: 5px;
                width: 100%;
            ">Add Keyword</button>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', menuHTML);

    // Manage keywords and their colors
    const keywords = {};

    // Function to highlight keywords
    function highlightKeywords() {
        console.log('Highlight Keywords');
        const boxContentSpans = document.querySelectorAll('span.box-content');
        boxContentSpans.forEach(span => {
            Object.keys(keywords).forEach(keyword => {
                const color = keywords[keyword];
                const regex = new RegExp(`(${keyword})`, 'g');
                if (regex.test(span.textContent) && !span.dataset[`highlighted-${keyword}`]) {
                    span.innerHTML = span.innerHTML.replace(regex, `<span style="background-color: ${color}; color: black; padding: 2px;">$1</span>`);
                    span.dataset[`highlighted-${keyword}`] = "true"; // Mark as processed
                }
            });
        });
    }

    // Observe dynamically added content
    const observer = new MutationObserver(() => highlightKeywords());
    observer.observe(document.body, { childList: true, subtree: true });

    // Toggle menu visibility
    const menu = document.getElementById('menu-content');
    document.getElementById('hamburger-menu').addEventListener('click', () => {
        menu.style.display = menu.style.display === 'none' || menu.style.display === '' ? 'block' : 'none';
    });

    // Add new keywords and colors
    document.getElementById('add-keyword').addEventListener('click', () => {
        const keyword = document.getElementById('keyword-input').value.trim();
        const color = document.getElementById('color-input').value;
        if (keyword) {
            keywords[keyword] = color;
            highlightKeywords(); // Apply highlighting immediately
            document.getElementById('keyword-input').value = ''; // Clear input
        }
    });

    // Initial highlight on page load
    highlightKeywords();
})();
