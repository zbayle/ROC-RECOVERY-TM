// ==UserScript==
// @name         ROC Tools with Floating Menu
// @namespace    http://tampermonkey.net/
// @version      2.0.3.2
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

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// Function to create and insert the floating icon
function createFloatingIcon() {
    console.log("Creating floating icon...");

    const icon = document.createElement('div');
    icon.style.position = 'fixed';
    icon.style.top = '10px'; // Set initial top position
    icon.style.left = '10px'; // Set initial left position
    icon.style.width = '40px';
    icon.style.height = '40px';
    icon.style.backgroundColor = '#ff9900';
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
function createFloatingMenu() {
    console.log("Creating floating menu...");

    const menu = document.createElement('div');
    menu.id = 'floatingMenu';
    menu.style.position = 'fixed';
    menu.style.top = '60px'; // Set initial top position
    menu.style.left = '10px'; // Set initial left position
    menu.style.padding = '20px';
    menu.style.backgroundColor = '#232f3e';
    menu.style.color = '#f2f2f2';
    menu.style.borderRadius = '10px';
    menu.style.zIndex = '9999';
    menu.style.width = '300px';
    menu.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
    menu.style.display = 'none';

    const handle = document.createElement('div');
    handle.style.cursor = 'move'; // Change cursor to indicate draggable
    handle.style.marginBottom = '10px';
    handle.style.padding = '10px';
    handle.style.backgroundColor = '#146eb4';
    handle.style.color = '#f2f2f2';
    handle.style.borderRadius = '5px';
    handle.textContent = 'Drag Here';

    console.log("Handle created for menu.");

    const button = document.createElement('button');
    button.textContent = 'Close Menu';
    button.style.marginBottom = '10px';
    button.style.padding = '10px';
    button.style.backgroundColor = '#ff9900';
    button.style.color = '#000000';
    button.style.border = 'none';
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
    keywordTab.style.backgroundColor = '#146eb4';
    keywordTab.style.color = '#f2f2f2';
    keywordTab.style.border = 'none';
    keywordTab.style.borderRadius = '5px';
    keywordTab.style.cursor = 'pointer';
    keywordTab.onclick = () => showTab('keywordsTab');

    const alertsTab = document.createElement('button');
    alertsTab.textContent = 'Alerts';
    alertsTab.style.flex = '1';
    alertsTab.style.padding = '10px';
    alertsTab.style.backgroundColor = '#146eb4';
    alertsTab.style.color = '#f2f2f2';
    alertsTab.style.border = 'none';
    alertsTab.style.borderRadius = '5px';
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
    keywordInput.style.marginBottom = '10px';
    keywordInput.style.padding = '10px';
    keywordInput.style.border = '1px solid #146eb4';
    keywordInput.style.borderRadius = '5px';
    keywordInput.style.width = '100%';
    keywordsTab.appendChild(keywordInput);

    const colorInputLabel = document.createElement('label');
    colorInputLabel.textContent = ' Color: ';
    keywordsTab.appendChild(colorInputLabel);

    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.id = 'colorInput';
    colorInput.style.marginBottom = '10px';
    colorInput.style.padding = '10px';
    colorInput.style.border = '1px solid #146eb4';
    colorInput.style.borderRadius = '5px';
    colorInput.style.width = '100%';
    keywordsTab.appendChild(colorInput);

    const addButton = document.createElement('button');
    addButton.textContent = 'Add/Update Keyword';
    addButton.id = 'addButton';
    addButton.style.marginBottom = '10px';
    addButton.style.padding = '10px';
    addButton.style.backgroundColor = '#ff9900';
    addButton.style.color = '#000000';
    addButton.style.border = 'none';
    addButton.style.borderRadius = '5px';
    addButton.style.cursor = 'pointer';
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
    alertInput.style.marginBottom = '10px';
    alertInput.style.padding = '10px';
    alertInput.style.border = '1px solid #146eb4';
    alertInput.style.borderRadius = '5px';
    alertInput.style.width = '100%';
    alertsTabContent.appendChild(alertInput);

    const soundSelectLabel = document.createElement('label');
    soundSelectLabel.textContent = ' Sound: ';
    alertsTabContent.appendChild(soundSelectLabel);

    const soundSelect = document.createElement('select');
    soundSelect.id = 'soundSelect';
    soundSelect.style.marginBottom = '10px';
    soundSelect.style.padding = '10px';
    soundSelect.style.border = '1px solid #146eb4';
    soundSelect.style.borderRadius = '5px';
    soundSelect.style.width = '100%';
    const sounds = [
        { name: 'Beep', url: 'beep' },
        { name: 'Chime', url: 'chime' },
        { name: 'Ding', url: 'ding' }
    ];
    sounds.forEach(sound => {
        const option = document.createElement('option');
        option.value = sound.url;
        option.textContent = sound.name;
        soundSelect.appendChild(option);
    });
    alertsTabContent.appendChild(soundSelect);

    const volumeLabel = document.createElement('label');
    volumeLabel.textContent = ' Volume: ';
    alertsTabContent.appendChild(volumeLabel);

    const volumeSlider = document.createElement('input');
    volumeSlider.type = 'range';
    volumeSlider.id = 'volumeSlider';
    volumeSlider.min = '0';
    volumeSlider.max = '1';
    volumeSlider.step = '0.01';
    volumeSlider.value = '0.5'; // Default volume
    volumeSlider.style.marginBottom = '10px';
    volumeSlider.style.width = '100%';
    alertsTabContent.appendChild(volumeSlider);

    const alertButton = document.createElement('button');
    alertButton.textContent = 'Add Alert';
    alertButton.id = 'alertButton';
    alertButton.style.marginBottom = '10px';
    alertButton.style.padding = '10px';
    alertButton.style.backgroundColor = '#ff9900';
    alertButton.style.color = '#000000';
    alertButton.style.border = 'none';
    alertButton.style.borderRadius = '5px';
    alertButton.style.cursor = 'pointer';
    alertsTabContent.appendChild(alertButton);

    const alertList = document.createElement('ul');
    alertList.id = 'alertList';
    alertsTabContent.appendChild(alertList);

    // Add a test button to manually trigger the alert sound
    const testButton = document.createElement('button');
    testButton.textContent = 'Test Alert Sound';
    testButton.style.marginTop = '10px';
    testButton.style.padding = '10px';
    testButton.style.backgroundColor = '#ff9900';
    testButton.style.color = '#000000';
    testButton.style.border = 'none';
    testButton.style.borderRadius = '5px';
    testButton.style.cursor = 'pointer';
    testButton.onclick = () => {
        const selectedSound = document.getElementById('soundSelect').value;
        playSound(selectedSound);
    };
    alertsTabContent.appendChild(testButton);

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
    audio.type = 'audio/mpeg';
    document.body.appendChild(audio);
}

// Function to play sound using Web Audio API
function playSound(type) {
    console.log(`Playing sound: ${type}`);
    const gainNode = audioCtx.createGain();
    gainNode.connect(audioCtx.destination);

    const volume = document.getElementById('volumeSlider').value;

    const playNote = (frequency, duration, startTime, volume = 1) => {
        const oscillator = audioCtx.createOscillator();
        const noteGainNode = audioCtx.createGain();
        noteGainNode.gain.value = volume;
        oscillator.connect(noteGainNode);
        noteGainNode.connect(gainNode);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime + startTime);
        oscillator.start(audioCtx.currentTime + startTime);
        oscillator.stop(audioCtx.currentTime + startTime + duration);
    };

    switch (type) {
        case 'beep':
            playNote(440, 1, 0, volume); // A4 for 1 second
            break;
        case 'chime':
            playNoteSequence([
                { frequency: 392.00, duration: 0.3, volume: volume }, // G4
                { frequency: 440.00, duration: 0.3, volume: volume }, // A4
                { frequency: 523.25, duration: 0.3, volume: volume }, // C5
                { frequency: 392.00, duration: 0.3, volume: volume }  // G4
            ]);
            break;
        case 'ding':
            playNoteSequence([
                { frequency: 523.25, duration: 0.3, volume: volume }, // C5
                { frequency: 587.33, duration: 0.3, volume: volume }, // D5
                { frequency: 659.25, duration: 0.3, volume: volume }, // E5
                { frequency: 523.25, duration: 0.3, volume: volume }  // C5
            ]);
            break;
        default:
            playNoteSequence([
                { frequency: 440, duration: 0.3, volume: volume }, // A4
                { frequency: 523.25, duration: 0.3, volume: volume }, // C5
                { frequency: 659.25, duration: 0.3, volume: volume }, // E5
                { frequency: 783.99, duration: 0.3, volume: volume } // G5
            ]);
    }

    function playNoteSequence(notes) {
        let startTime = 0;
        notes.forEach(note => {
            playNote(note.frequency, note.duration, startTime, note.volume);
            startTime += note.duration;
        });
    }
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
    let isDragging = false;

    handle.addEventListener('mousedown', dragMouseDown);

    function dragMouseDown(e) {
        e.preventDefault();
        isDragging = true;
        initialX = e.clientX - element.offsetLeft;
        initialY = e.clientY - element.offsetTop;
        document.addEventListener('mousemove', elementDrag);
        document.addEventListener('mouseup', closeDragElement);
        document.addEventListener('mouseleave', closeDragElement); // Ensure drag stops if mouse leaves window
    }

    function elementDrag(e) {
        if (!isDragging) return;
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
        if (isDragging) {
            isDragging = false;
            document.removeEventListener('mousemove', elementDrag);
            document.removeEventListener('mouseup', closeDragElement);
            document.removeEventListener('mouseleave', closeDragElement);
        }
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

// Function to download the audio file
function downloadAudioFile(url, callback) {
    console.log("Starting download of audio file from URL:", url);
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'blob';
    xhr.onload = function() {
        if (xhr.status === 200) {
            console.log("Audio file downloaded successfully.");
            const blob = xhr.response;
            const objectURL = URL.createObjectURL(blob);
            callback(objectURL);
        } else {
            console.error('Failed to download audio file:', xhr.status, xhr.statusText);
        }
    };
    xhr.onerror = function() {
        console.error('Network error while downloading audio file.');
    };
    xhr.send();
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

// Function to edit an alert
function editAlert(index) {
    const alerts = GM_getValue('alerts', []);
    const alert = alerts[index];

    document.getElementById('alertInput').value = alert.text;
    document.getElementById('soundSelect').value = alert.sound;

    document.getElementById('alertButton').textContent = 'Update Alert';
    document.getElementById('alertButton').onclick = () => {
        updateAlert(index);
    };
}

// Function to update an alert
function updateAlert(index) {
    const alertText = document.getElementById('alertInput').value;
    const alertSound = document.getElementById('soundSelect').value;
    const alertSoundName = document.getElementById('soundSelect').selectedOptions[0].text;

    if (alertText === '') return;

    let alerts = GM_getValue('alerts', []);
    alerts[index] = { text: alertText, sound: alertSound, soundName: alertSoundName };

    GM_setValue('alerts', alerts);
    loadAlerts();

    document.getElementById('alertButton').textContent = 'Add Alert';
    document.getElementById('alertButton').onclick = addOrUpdateAlert;
}


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
                            const selectedSound = document.getElementById('soundSelect').value;
                            playSound(selectedSound);
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