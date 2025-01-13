// ==UserScript==
// @name         ROC Tools with Floating Menu
// @namespace    http://tampermonkey.net/
// @version      1.0.9.1
// @description  Highlight specified keywords dynamically with custom colors using a floating menu in Tampermonkey.
// @author       zbbayle
// @match        *://*/*
// @grant        none
// @updateURL    https://github.com/raw/zbayle/ROC-RECOVERY-TM/main/tampermonkey-keyword-highlighter.user.js
// @downloadURL  https://github.com/raw/zbayle/ROC-RECOVERY-TM/main/tampermonkey-keyword-highlighter.user.js
// ==/UserScript==

// Log to verify script execution
console.log('Script is running!');

// Function to create and insert the floating menu
function createFloatingMenu() {
    console.log("Creating floating menu...");

    const menu = document.createElement('div');
    menu.style.position = 'fixed';
    menu.style.bottom = '10px';
    menu.style.right = '10px';
    menu.style.padding = '10px';
    menu.style.backgroundColor = '#333';
    menu.style.color = '#fff';
    menu.style.borderRadius = '5px';
    menu.style.zIndex = '9999';
    menu.style.cursor = 'move'; // Change cursor to indicate draggable

    const button = document.createElement('button');
    button.textContent = 'ROC Tools Menu';
    button.style.marginBottom = '10px';
    button.style.padding = '10px';
    button.style.backgroundColor = '#0fffcf';
    button.style.color = '#333';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.onclick = toggleMenu;

    console.log("Button created for menu.");

    const menuContent = document.createElement('div');
    menuContent.id = 'floatingMenuContent';
    menuContent.style.display = 'none';
    menuContent.style.marginTop = '10px';

    console.log("Menu content created.");

    const keywordInputLabel = document.createElement('label');
    keywordInputLabel.textContent = 'Keyword: ';
    menuContent.appendChild(keywordInputLabel);

    const keywordInput = document.createElement('input');
    keywordInput.type = 'text';
    keywordInput.id = 'keywordInput';
    menuContent.appendChild(keywordInput);

    const colorInputLabel = document.createElement('label');
    colorInputLabel.textContent = ' Color: ';
    menuContent.appendChild(colorInputLabel);

    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.id = 'colorInput';
    menuContent.appendChild(colorInput);

    const addButton = document.createElement('button');
    addButton.textContent = 'Add/Update Keyword';
    addButton.id = 'addButton';
    menuContent.appendChild(addButton);

    const keywordList = document.createElement('ul');
    keywordList.id = 'keywordList';
    menuContent.appendChild(keywordList);

    menu.appendChild(button);
    menu.appendChild(menuContent);

    console.log("Menu content and button appended to menu.");

    document.body.appendChild(menu);
    console.log("Floating menu injected into the page.");

    // Make the menu draggable
    makeDraggable(menu);
}

// Toggle the visibility of the floating menu
function toggleMenu() {
    console.log("Toggling menu visibility...");
    const menuContent = document.getElementById('floatingMenuContent');
    if (menuContent.style.display === 'none') {
        menuContent.style.display = 'block';
        console.log("Menu is now visible.");
    } else {
        menuContent.style.display = 'none';
        console.log("Menu is now hidden.");
    }
}

// Function to make an element draggable
function makeDraggable(element) {
    let offsetX = 0, offsetY = 0, initialX = 0, initialY = 0;

    element.addEventListener('mousedown', dragMouseDown);

    function dragMouseDown(e) {
        e.preventDefault();
        initialX = e.clientX;
        initialY = e.clientY;
        document.addEventListener('mousemove', elementDrag);
        document.addEventListener('mouseup', closeDragElement);
    }

    function elementDrag(e) {
        e.preventDefault();
        offsetX = initialX - e.clientX;
        offsetY = initialY - e.clientY;
        initialX = e.clientX;
        initialY = e.clientY;
        element.style.top = (element.offsetTop - offsetY) + "px";
        element.style.left = (element.offsetLeft - offsetX) + "px";
    }

    function closeDragElement() {
        document.removeEventListener('mousemove', elementDrag);
        document.removeEventListener('mouseup', closeDragElement);
    }
}

// Function to validate keywords
function validateKeywords(keywords) {
    return Array.isArray(keywords) ? keywords.filter(item => item.keyword && item.color) : [];
}

// Load keywords safely
function loadKeywords() {
    console.log("Loading saved keywords...");

    let keywords = [];
    try {
        keywords = JSON.parse(localStorage.getItem('keywords')) || [];
    } catch (e) {
        console.error('Error reading from localStorage. Resetting keywords.');
    }

    keywords = validateKeywords(keywords);

    const list = document.getElementById('keywordList');
    list.innerHTML = '';

    keywords.forEach((item, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${item.keyword}: ${item.color}`;
        listItem.style.color = item.color;

        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.onclick = () => editKeyword(index);
        listItem.appendChild(editButton);

        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.onclick = () => removeKeyword(index);
        listItem.appendChild(removeButton);

        list.appendChild(listItem);
    });

    console.log("Keywords loaded successfully.");
    highlightKeywords(keywords);
}

// Add or update keyword and color
function addOrUpdateKeyword() {
    const keyword = document.getElementById('keywordInput').value;
    const color = document.getElementById('colorInput').value;

    if (keyword === '') return; // Don't allow empty keywords

    let keywords = JSON.parse(localStorage.getItem('keywords')) || [];

    // Ensure keywords is an array (in case it's been incorrectly stored as an object)
    if (typeof keywords === 'object' && !Array.isArray(keywords)) {
        console.error('Keywords are stored incorrectly in localStorage. Resetting to an empty array.');
        keywords = [];
    }

    // Check if the keyword already exists
    const existingIndex = keywords.findIndex(item => item.keyword === keyword);
    if (existingIndex !== -1) {
        // Edit existing keyword and color
        keywords[existingIndex] = { keyword, color };
    } else {
        // Check for duplicate keyword before adding
        const duplicateIndex = keywords.findIndex(item => item.keyword.toLowerCase() === keyword.toLowerCase());
        if (duplicateIndex !== -1) {
            console.error("This keyword already exists. Please enter a different keyword.");
            return; // Exit if the keyword is a duplicate
        }

        // Add new keyword and color
        keywords.push({ keyword, color });
    }

    // Store keywords as an array
    localStorage.setItem('keywords', JSON.stringify(keywords));
    console.log("Updated keywords in localStorage:", localStorage.getItem('keywords'));
    loadKeywords();
}

// Edit keyword and color
function editKeyword(index) {
    const keywords = JSON.parse(localStorage.getItem('keywords')) || [];
    const keyword = keywords[index];

    document.getElementById('keywordInput').value = keyword.keyword;
    document.getElementById('colorInput').value = keyword.color;

    document.getElementById('addButton').textContent = 'Update Keyword';
    document.getElementById('addButton').onclick = () => {
        updateKeyword(index);
    };
}

// Update keyword
function updateKeyword(index) {
    const keyword = document.getElementById('keywordInput').value;
    const color = document.getElementById('colorInput').value;

    if (keyword === '') return;

    let keywords = JSON.parse(localStorage.getItem('keywords')) || [];
    keywords[index] = { keyword, color };

    localStorage.setItem('keywords', JSON.stringify(keywords));
    loadKeywords();

    document.getElementById('addButton').textContent = 'Add/Update Keyword';
    document.getElementById('addButton').onclick = addOrUpdateKeyword;
}

// Remove keyword
function removeKeyword(index) {
    let keywords = JSON.parse(localStorage.getItem('keywords')) || [];
    keywords.splice(index, 1);
    localStorage.setItem('keywords', JSON.stringify(keywords));
    loadKeywords();
}

// Highlight keywords in page content
function highlightKeywords(keywords) {
    console.log("Highlighting keywords...");

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    const nodes = [];

    while (walker.nextNode()) {
        nodes.push(walker.currentNode);
    }

    nodes.forEach(node => {
        const parent = node.parentNode;
        const text = node.nodeValue;

        keywords.forEach(keyword => {
            const regex = new RegExp(`(${keyword.keyword})`, 'gi');
            const parts = text.split(regex);

            if (parts.length > 1) {
                const fragment = document.createDocumentFragment();

                parts.forEach(part => {
                    if (regex.test(part)) {
                        const span = document.createElement('span');
                        span.style.border = `2px solid ${keyword.color}`;
                        span.style.padding = '2px';
                        span.textContent = part;
                        fragment.appendChild(span);
                    } else {
                        fragment.appendChild(document.createTextNode(part));
                    }
                });

                parent.replaceChild(fragment, node);
            }
        });
    });
}

// Ensure the DOM is loaded before trying to access elements
window.onload = function () {
    console.log("Window loaded.");

    createFloatingMenu();
    loadKeywords();

    const addButton = document.getElementById('addButton');
    if (addButton) {
        console.log("Add button exists.");
        addButton.addEventListener('click', addOrUpdateKeyword);
    } else {
        console.error('Add button not found!');
    }
};