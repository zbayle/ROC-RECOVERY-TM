// ==UserScript==
// @name         ROC Tools with Floating Menu
// @namespace    http://tampermonkey.net/
// @version      2.0.1.1
// @description  Highlight specified keywords dynamically with custom colors using a floating menu in Tampermonkey. Also alerts when a WIM is offered on specific pages.
// @autor        zbbayle
// @match        https://optimus-internal.amazon.com/*
// @match        https://trans-logistics.amazon.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @updateURL    https://github.com/raw/zbayle/ROC-RECOVERY-TM/main/tampermonkey-keyword-highlighter.user.js
// @downloadURL  https://github.com/raw/zbayle/ROC-RECOVERY-TM/main/tampermonkey-keyword-highlighter.user.js
// ==/UserScript==

// Log to verify script execution
console.log('Script is running!');

// Function to create and insert the floating icon
function createFloatingIcon() {
    console.log("Creating floating icon...");

    const icon = document.createElement('div');
    icon.style.position = 'fixed';
    icon.style.top = '10px'; // Set initial top position
    icon.style.left = '10px'; // Set initial left position
    icon.style.width = '40px';
    icon.style.height = '40px';
    icon.style.backgroundColor = '#0fffcf';
    icon.style.borderRadius = '50%';
    icon.style.cursor = 'pointer';
    icon.style.zIndex = '9999';
    icon.style.display = 'flex';
    icon.style.alignItems = 'center';
    icon.style.justifyContent = 'center';
    icon.textContent = 'ROC';
    icon.style.color = '#333';
    icon.style.fontWeight = 'bold';

    console.log("Icon created.");

    icon.onclick = toggleMenu;

    document.body.appendChild(icon);
    console.log("Floating icon injected into the page.");

    // Make the icon draggable
    makeDraggable(icon);
}

// Function to create and insert the floating menu
// Function to create and insert the floating menu
function createFloatingMenu() {
    console.log("Creating floating menu...");

    const menu = document.createElement('div');
    menu.id = 'floatingMenu';
    menu.style.position = 'fixed';
    menu.style.top = '60px'; // Set initial top position
    menu.style.left = '10px'; // Set initial left position
    menu.style.padding = '10px';
    menu.style.backgroundColor = '#333';
    menu.style.color = '#fff';
    menu.style.borderRadius = '5px';
    menu.style.zIndex = '9999';
    menu.style.width = '300px';
    menu.style.display = 'none';

    const handle = document.createElement('div');
    handle.style.cursor = 'move'; // Change cursor to indicate draggable
    handle.style.marginBottom = '10px';
    handle.style.padding = '5px';
    handle.style.backgroundColor = '#555';
    handle.style.color = '#fff';
    handle.style.borderRadius = '5px';
    handle.textContent = 'Drag Here';

    console.log("Handle created for menu.");

    const button = document.createElement('button');
    button.textContent = 'Close Menu';
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
    menuContent.style.marginTop = '10px';

    console.log("Menu content created.");

    const tabs = document.createElement('div');
    tabs.style.display = 'flex';
    tabs.style.justifyContent = 'space-around';
    tabs.style.marginBottom = '10px';

    const keywordTab = document.createElement('button');
    keywordTab.textContent = 'Keywords';
    keywordTab.style.flex = '1';
    keywordTab.style.padding = '10px';
    keywordTab.style.backgroundColor = '#0fffcf';
    keywordTab.style.color = '#333';
    keywordTab.style.border = 'none';
    keywordTab.style.cursor = 'pointer';
    keywordTab.onclick = () => showTab('keywordsTab');

    const alertsTab = document.createElement('button');
    alertsTab.textContent = 'Alerts';
    alertsTab.style.flex = '1';
    alertsTab.style.padding = '10px';
    alertsTab.style.backgroundColor = '#0fffcf';
    alertsTab.style.color = '#333';
    alertsTab.style.border = 'none';
    alertsTab.style.cursor = 'pointer';
    alertsTab.onclick = () => showTab('alertsTab');

    tabs.appendChild(keywordTab);
    tabs.appendChild(alertsTab);

    const keywordsTab = document.createElement('div');
    keywordsTab.id = 'keywordsTab';
    keywordsTab.style.display = 'block';

    const keywordInputLabel = document.createElement('label');
    keywordInputLabel.textContent = 'Keyword: ';
    keywordsTab.appendChild(keywordInputLabel);

    const keywordInput = document.createElement('input');
    keywordInput.type = 'text';
    keywordInput.id = 'keywordInput';
    keywordsTab.appendChild(keywordInput);

    const colorInputLabel = document.createElement('label');
    colorInputLabel.textContent = ' Color: ';
    keywordsTab.appendChild(colorInputLabel);

    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.id = 'colorInput';
    keywordsTab.appendChild(colorInput);

    const addButton = document.createElement('button');
    addButton.textContent = 'Add/Update Keyword';
    addButton.id = 'addButton';
    keywordsTab.appendChild(addButton);

    const keywordList = document.createElement('ul');
    keywordList.id = 'keywordList';
    keywordsTab.appendChild(keywordList);

    const alertsTabContent = document.createElement('div');
    alertsTabContent.id = 'alertsTab';
    alertsTabContent.style.display = 'none';

    const alertToggleLabel = document.createElement('label');
    alertToggleLabel.textContent = 'WIM Alert: ';
    alertsTabContent.appendChild(alertToggleLabel);

    const alertToggle = document.createElement('input');
    alertToggle.type = 'checkbox';
    alertToggle.id = 'alertToggle';
    alertsTabContent.appendChild(alertToggle);

    const alertInputLabel = document.createElement('label');
    alertInputLabel.textContent = 'Alert: ';
    alertsTabContent.appendChild(alertInputLabel);

    const alertInput = document.createElement('input');
    alertInput.type = 'text';
    alertInput.id = 'alertInput';
    alertsTabContent.appendChild(alertInput);

    const soundSelectLabel = document.createElement('label');
    soundSelectLabel.textContent = ' Sound: ';
    alertsTabContent.appendChild(soundSelectLabel);

    const soundSelect = document.createElement('select');
    soundSelect.id = 'soundSelect';
    const sounds = [
        { name: 'Bleep', url: 'https://github.com/zbayle/ROC-RECOVERY-TM/raw/refs/heads/main/bleep.mp3' }, // Changed to .mp3
    ];
    sounds.forEach(sound => {
        const option = document.createElement('option');
        option.value = sound.url;
        option.textContent = sound.name;
        soundSelect.appendChild(option);
    });
    alertsTabContent.appendChild(soundSelect);

    const alertButton = document.createElement('button');
    alertButton.textContent = 'Add Alert';
    alertButton.id = 'alertButton';
    alertsTabContent.appendChild(alertButton);

    const alertList = document.createElement('ul');
    alertList.id = 'alertList';
    alertsTabContent.appendChild(alertList);

    menuContent.appendChild(tabs);
    menuContent.appendChild(keywordsTab);
    menuContent.appendChild(alertsTabContent);

    menu.appendChild(handle);
    menu.appendChild(button);
    menu.appendChild(menuContent);

    console.log("Menu content, handle, and button appended to menu.");

    document.body.appendChild(menu);
    console.log("Floating menu injected into the page.");

    // Make the menu draggable using the handle
    makeDraggable(menu, handle);

    // Load the alert toggle state
    const alertEnabled = GM_getValue('alertEnabled', false);
    alertToggle.checked = alertEnabled;
    alertToggle.addEventListener('change', () => {
        GM_setValue('alertEnabled', alertToggle.checked);
    });

    // Load alerts
    loadAlerts();

    // Start observing for WIM alerts if enabled
    if (alertEnabled) {
        observeWIMAlerts();
    }

    // Add an audio element for the alert sound
    const audio = document.createElement('audio');
    audio.id = 'alertSound';
    audio.src = 'https://www.soundjay.com/button/beep-07.mp3'; // Changed to .mp3
    audio.type = 'audio/mpeg'; // Changed to 'audio/mpeg'
    document.body.appendChild(audio);
}

// Toggle the visibility of the floating menu
function toggleMenu() {
    console.log("Toggling menu visibility...");
    const menu = document.getElementById('floatingMenu');
    if (menu.style.display === 'none') {
        menu.style.display = 'block';
        console.log("Menu is now visible.");
    } else {
        menu.style.display = 'none';
        console.log("Menu is now hidden.");
    }
}

// Show the selected tab
function showTab(tabId) {
    const keywordsTab = document.getElementById('keywordsTab');
    const alertsTabContent = document.getElementById('alertsTab');

    if (tabId === 'keywordsTab') {
        keywordsTab.style.display = 'block';
        alertsTabContent.style.display = 'none';
    } else if (tabId === 'alertsTab') {
        keywordsTab.style.display = 'none';
        alertsTabContent.style.display = 'block';
    }
}

// Function to make an element draggable using a handle
function makeDraggable(element, handle = element) {
    let offsetX = 0, offsetY = 0, initialX = 0, initialY = 0;

    handle.addEventListener('mousedown', dragMouseDown);

    function dragMouseDown(e) {
        e.preventDefault();
        initialX = e.clientX - element.offsetLeft;
        initialY = e.clientY - element.offsetTop;
        document.addEventListener('mousemove', elementDrag);
        document.addEventListener('mouseup', closeDragElement);
    }

    function elementDrag(e) {
        e.preventDefault();
        offsetX = e.clientX - initialX;
        offsetY = e.clientY - initialY;
        let newTop = element.offsetTop + offsetY;
        let newLeft = element.offsetLeft + offsetX;

        // Boundary checks
        if (newTop < 0) newTop = 0;
        if (newLeft < 0) newLeft = 0;
        if (newTop + element.offsetHeight > window.innerHeight) newTop = window.innerHeight - element.offsetHeight;
        if (newLeft + element.offsetWidth > window.innerWidth) newLeft = window.innerWidth - element.offsetWidth;

        element.style.top = newTop + "px";
        element.style.left = newLeft + "px";
        initialX = e.clientX;
        initialY = e.clientY;
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
        keywords = GM_getValue('keywords', []);
    } catch (e) {
        console.error('Error reading from storage. Resetting keywords.');
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

    let keywords = GM_getValue('keywords', []);

    // Ensure keywords is an array (in case it's been incorrectly stored as an object)
    if (typeof keywords === 'object' && !Array.isArray(keywords)) {
        console.error('Keywords are stored incorrectly. Resetting to an empty array.');
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
    GM_setValue('keywords', keywords);
    console.log("Updated keywords in storage:", GM_getValue('keywords'));
    loadKeywords();
    highlightKeywords(keywords); // Ensure keywords are highlighted after adding/updating
}

// Edit keyword and color
function editKeyword(index) {
    const keywords = GM_getValue('keywords', []);
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

    let keywords = GM_getValue('keywords', []);
    keywords[index] = { keyword, color };

    GM_setValue('keywords', keywords);
    loadKeywords();
    highlightKeywords(keywords); // Ensure keywords are highlighted after updating

    document.getElementById('addButton').textContent = 'Add/Update Keyword';
    document.getElementById('addButton').onclick = addOrUpdateKeyword;
}

// Remove keyword
function removeKeyword(index) {
    let keywords = GM_getValue('keywords', []);
    keywords.splice(index, 1);
    GM_setValue('keywords', keywords);
    loadKeywords();
    highlightKeywords(keywords); // Ensure keywords are highlighted after removing
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

                // Check if the node is still a child of its parent before replacing
                if (parent && node.parentNode === parent) {
                    parent.replaceChild(fragment, node);
                } else {
                    console.warn("Node is no longer a child of its parent. Skipping replacement.");
                }
            }
        });
    });
}

function loadAlerts() {
    console.log("Loading saved alerts...");

    let alerts = [];
    try {
        alerts = GM_getValue('alerts', []);
        console.log("Loaded alerts from storage:", alerts);
    } catch (e) {
        console.error('Error reading from storage. Resetting alerts.');
    }

    const list = document.getElementById('alertList');
    list.innerHTML = '';

    alerts.forEach((alert, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${alert.text} (${alert.soundName})`;

        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.onclick = () => editAlert(index);
        listItem.appendChild(editButton);

        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.onclick = () => removeAlert(index);
        listItem.appendChild(removeButton);

        list.appendChild(listItem);
    });

    console.log("Alerts loaded successfully.");
}

// Add or update alert and sound
function addOrUpdateAlert() {
    const alertText = document.getElementById('alertInput').value;
    const alertSound = document.getElementById('soundSelect').value;
    const alertSoundName = document.getElementById('soundSelect').selectedOptions[0].text;

    if (alertText === '') return; // Don't allow empty alerts

    let alerts = GM_getValue('alerts', []);

    // Ensure alerts is an array (in case it's been incorrectly stored as an object)
    if (typeof alerts === 'object' && !Array.isArray(alerts)) {
        console.error('Alerts are stored incorrectly. Resetting to an empty array.');
        alerts = [];
    }

    // Check if the alert already exists
    const existingIndex = alerts.findIndex(alert => alert.text === alertText);
    if (existingIndex !== -1) {
        // Edit existing alert
        alerts[existingIndex] = { text: alertText, sound: alertSound, soundName: alertSoundName };
        console.log("Updated existing alert:", alerts[existingIndex]);
    } else {
        // Add new alert
        alerts.push({ text: alertText, sound: alertSound, soundName: alertSoundName });
        console.log("Added new alert:", { text: alertText, sound: alertSound, soundName: alertSoundName });
    }

    // Store alerts as an array
    GM_setValue('alerts', alerts);
    console.log("Updated alerts in storage:", GM_getValue('alerts'));
    loadAlerts();
}

// Function to observe WIM alerts
function observeWIMAlerts() {
    if (window.location.href.includes('https://optimus-internal.amazon.com/wims')) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1 && node.querySelector('.btn-primary.btn-block.btn.btn-info')) {
                            console.log("Assign to me button detected.");
                            const audio = document.getElementById('alertSound');
                            if (audio) {
                                console.log("Playing alert sound.");
                                audio.play().catch(error => {
                                    console.error("Error playing audio:", error);
                                    console.error("Audio element:", audio);
                                    console.error("Audio source URL:", audio.src);
                                });
                            } else {
                                console.error("Audio element not found.");
                            }
                        }
                    });
                }
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }
}

// Ensure the DOM is loaded before trying to access elements
window.onload = function () {
    console.log("Window loaded.");

    createFloatingIcon();
    createFloatingMenu();
    loadKeywords();
    loadAlerts();

    const addButton = document.getElementById('addButton');
    if (addButton) {
        console.log("Add button exists.");
        addButton.addEventListener('click', addOrUpdateKeyword);
    } else {
        console.error('Add button not found!');
    }

    const alertButton = document.getElementById('alertButton');
    if (alertButton) {
        console.log("Alert button exists.");
        alertButton.addEventListener('click', addOrUpdateAlert);
    } else {
        console.error('Alert button not found!');
    }
};