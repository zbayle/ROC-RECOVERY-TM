// ==UserScript==
// @name         ROC Tools 
// @namespace    http://tampermonkey.net/
// @version      3.2.1
// @description  Highlight specified keywords dynamically with custom colors using a floating menu in Tampermonkey. Also alerts when a WIM is offered on specific pages.
// @autor        zbbayle
// @match        https://optimus-internal.amazon.com/*
// @match        https://trans-logistics.amazon.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_log
// @grant        GM_registerMenuCommand
// @connect      raw.githubusercontent.com
// @updateURL    https://raw.githubusercontent.com/zbayle/ROC-RECOVERY-TM/main/ROC-Tools.js
// @downloadURL  https://raw.githubusercontent.com/zbayle/ROC-RECOVERY-TM/main/ROC-Tools.js
// ==/UserScript==


// Ensure GM functions are available
if (typeof GM_getValue === 'undefined') {
    console.warn('GM_getValue is not defined. Using localStorage as fallback.');
    GM_getValue = function (key, defaultValue) {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : defaultValue;
    };
} else {
    console.log('GM_getValue is available.');
}

if (typeof GM_setValue === 'undefined') {
    console.warn('GM_setValue is not defined. Using localStorage as fallback.');
    GM_setValue = function (key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    };
} else {
    console.log('GM_setValue is available.');
}

console.log("ROC Tools script loaded.");



const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function loadSettings() {
    const defaultSettings = {
        alertEnabled: false,
        alerts: [],
        autoAssignEnabled: false,
        keywords: [],
        selectedSound: 'beep',
        volume: '0.5'
    };

    let settings = GM_getValue('settings', JSON.stringify(defaultSettings));
    try {
        settings = JSON.parse(settings);
    } catch (e) {
        console.error('Error parsing settings from storage. Resetting to default settings.', e);
        settings = defaultSettings;
        GM_setValue('settings', JSON.stringify(settings));
    }

    return settings;
}

function saveSettings(settings) {
    GM_setValue('settings', JSON.stringify(settings));
}

// Function to create and insert the floating icon
function createFloatingIcon() {
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
    icon.onclick = toggleMenu;

    document.body.appendChild(icon);

    // Make the icon draggable
    makeDraggable(icon);
}

// Function to create and insert the floating menu
function createFloatingMenu() {
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
    menu.style.width = '350px'; // Increased width
    menu.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
    menu.style.display = 'none';

    const handle = document.createElement('div');
    handle.style.cursor = 'move'; // Change cursor to indicate draggable
    handle.style.marginBottom = '15px'; // Increased margin
    handle.style.padding = '10px';
    handle.style.backgroundColor = '#146eb4';
    handle.style.color = '#f2f2f2';
    handle.style.borderRadius = '5px';
    handle.textContent = 'Drag Here';

    const button = document.createElement('button');
    button.textContent = 'Close Menu';
    button.style.marginBottom = '15px'; // Increased margin
    button.style.padding = '10px';
    button.style.backgroundColor = '#ff9900';
    button.style.color = '#000000';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.style.width = '100%'; // Full width button
    button.style.boxSizing = 'border-box';
    button.onmouseover = () => button.style.backgroundColor = '#e68a00';
    button.onmouseout = () => button.style.backgroundColor = '#ff9900';
    button.onclick = toggleMenu;

    const menuContent = document.createElement('div');
    menuContent.id = 'floatingMenuContent';
    menuContent.style.marginTop = '10px';

    const tabs = document.createElement('div');
    tabs.style.display = 'flex';
    tabs.style.justifyContent = 'space-around';
    tabs.style.marginBottom = '15px'; // Increased margin

    const keywordTab = document.createElement('button');
    keywordTab.textContent = 'Keywords';
    keywordTab.style.flex = '1';
    keywordTab.style.padding = '10px';
    keywordTab.style.backgroundColor = '#146eb4';
    keywordTab.style.color = '#f2f2f2';
    keywordTab.style.border = 'none';
    keywordTab.style.borderRadius = '5px';
    keywordTab.style.cursor = 'pointer';
    keywordTab.style.marginRight = '5px'; // Added margin between tabs
    keywordTab.onmouseover = () => keywordTab.style.backgroundColor = '#125a9e';
    keywordTab.onmouseout = () => keywordTab.style.backgroundColor = '#146eb4';
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
    alertsTab.onmouseover = () => alertsTab.style.backgroundColor = '#125a9e';
    alertsTab.onmouseout = () => alertsTab.style.backgroundColor = '#146eb4';
    alertsTab.onclick = () => showTab('alertsTab');


          // AHT Tracking tab
    /*
    const ahtTrackingTab = document.createElement('button');
    ahtTrackingTab.textContent = 'AHT Tracking';
    ahtTrackingTab.style.flex = '1';
    ahtTrackingTab.style.padding = '10px';
    ahtTrackingTab.style.backgroundColor = '#146eb4';
    ahtTrackingTab.style.color = '#f2f2f2';
    ahtTrackingTab.style.border = 'none';
    ahtTrackingTab.style.borderRadius = '5px';
    ahtTrackingTab.style.cursor = 'pointer';
    ahtTrackingTab.style.marginLeft = '5px'; // Added margin between tabs
    ahtTrackingTab.onmouseover = () => ahtTrackingTab.style.backgroundColor = '#125a9e';
    ahtTrackingTab.onmouseout = () => ahtTrackingTab.style.backgroundColor = '#146eb4';
    ahtTrackingTab.onclick = () => showTab('ahtTrackingTab');
    */

    tabs.appendChild(keywordTab);
    tabs.appendChild(alertsTab);
    //tabs.appendChild(ahtTrackingTab);

    const keywordsTab = document.createElement('div');
    keywordsTab.id = 'keywordsTab';
    keywordsTab.style.display = 'block';

    const keywordInputLabel = document.createElement('label');
    keywordInputLabel.textContent = 'Keyword: ';
    keywordInputLabel.style.display = 'block'; // Block display for better spacing
    keywordInputLabel.style.marginBottom = '5px'; // Added margin
    keywordsTab.appendChild(keywordInputLabel);

    const keywordInput = document.createElement('input');
    keywordInput.type = 'text';
    keywordInput.id = 'keywordInput';
    keywordInput.style.marginBottom = '15px'; // Increased margin
    keywordInput.style.padding = '10px';
    keywordInput.style.border = '1px solid #146eb4';
    keywordInput.style.borderRadius = '5px';
    keywordInput.style.width = '100%';
    keywordsTab.appendChild(keywordInput);

    const colorInputLabel = document.createElement('label');
    colorInputLabel.textContent = ' Color: ';
    colorInputLabel.style.display = 'block'; // Block display for better spacing
    colorInputLabel.style.marginBottom = '5px'; // Added margin
    keywordsTab.appendChild(colorInputLabel);

    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.id = 'colorInput';
    colorInput.style.marginBottom = '15px'; // Increased margin
    colorInput.style.border = '1px solid #146eb4';
    colorInput.style.borderRadius = '5px';
    colorInput.style.width = '100%';
    keywordsTab.appendChild(colorInput);

    const addButton = document.createElement('button');
    addButton.textContent = 'Add/Update Keyword';
    addButton.id = 'addButton';
    addButton.style.marginBottom = '15px'; // Increased margin
    addButton.style.padding = '10px';
    addButton.style.backgroundColor = '#ff9900';
    addButton.style.color = '#000000';
    addButton.style.border = 'none';
    addButton.style.borderRadius = '5px';
    addButton.style.cursor = 'pointer';
    addButton.style.width = '100%'; // Full width button
    addButton.style.boxSizing = 'border-box';
    addButton.onmouseover = () => addButton.style.backgroundColor = '#e68a00';
    addButton.onmouseout = () => addButton.style.backgroundColor = '#ff9900';
    keywordsTab.appendChild(addButton);

    const keywordList = document.createElement('ul');
    keywordList.id = 'keywordList';
    keywordList.style.padding = '0';
    keywordList.style.listStyle = 'none'; // Remove default list styling
    keywordsTab.appendChild(keywordList);

    const alertsTabContent = document.createElement('div');
    alertsTabContent.id = 'alertsTab';
    alertsTabContent.style.display = 'none';

    const alertToggleLabel = document.createElement('label');
    alertToggleLabel.textContent = 'WIM Alert: ';
    alertToggleLabel.style.display = 'block'; // Block display for better spacing
    alertToggleLabel.style.marginBottom = '5px'; // Added margin
    alertsTabContent.appendChild(alertToggleLabel);

    const alertToggle = document.createElement('input');
    alertToggle.type = 'checkbox';
    alertToggle.id = 'alertToggle';
    alertToggle.style.marginBottom = '15px'; // Increased margin
    alertsTabContent.appendChild(alertToggle);

    const soundSelectLabel = document.createElement('label');
    soundSelectLabel.textContent = ' Sound: ';
    soundSelectLabel.style.display = 'block'; // Block display for better spacing
    soundSelectLabel.style.marginBottom = '5px'; // Added margin
    alertsTabContent.appendChild(soundSelectLabel);

    const soundSelect = document.createElement('select');
    soundSelect.id = 'soundSelect';
    soundSelect.style.marginBottom = '15px'; // Increased margin
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
    volumeLabel.style.display = 'block'; // Block display for better spacing
    volumeLabel.style.marginBottom = '5px'; // Added margin
    alertsTabContent.appendChild(volumeLabel);

    const volumeSlider = document.createElement('input');
    volumeSlider.type = 'range';
    volumeSlider.id = 'volumeSlider';
    volumeSlider.min = '0';
    volumeSlider.max = '1';
    volumeSlider.step = '0.01';
    volumeSlider.value = '0.5'; // Default volume
    volumeSlider.style.marginBottom = '15px'; // Increased margin
    volumeSlider.style.width = '100%';
    alertsTabContent.appendChild(volumeSlider);

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
    testButton.style.width = '100%'; // Full width button
    testButton.style.boxSizing = 'border-box';
    testButton.onmouseover = () => testButton.style.backgroundColor = '#e68a00';
    testButton.onmouseout = () => testButton.style.backgroundColor = '#ff9900';
    testButton.onclick = () => {
        const selectedSound = document.getElementById('soundSelect').value;
        playSound(selectedSound);
    };
    alertsTabContent.appendChild(testButton);

    // Add the checkbox for auto-assigning WIM
    /*
    const autoAssignLabel = document.createElement('label');
    autoAssignLabel.textContent = 'Auto-Assign WIM: ';
    autoAssignLabel.style.display = 'block'; // Block display for better spacing
    autoAssignLabel.style.marginBottom = '5px'; // Added margin
    alertsTabContent.appendChild(autoAssignLabel);

    const autoAssignCheckbox = document.createElement('input');
    autoAssignCheckbox.type = 'checkbox';
    autoAssignCheckbox.id = 'autoAssignCheckbox';
    autoAssignCheckbox.style.marginBottom = '15px'; // Increased margin
    alertsTabContent.appendChild(autoAssignCheckbox);
    */


    const ahtTrackingTabContent = document.createElement('div');
    ahtTrackingTabContent.id = 'ahtTrackingTab';
    ahtTrackingTabContent.style.display = 'none';

    const ahtTrackingList = document.createElement('ul');
    ahtTrackingList.id = 'ahtTrackingList';
    ahtTrackingList.style.padding = '0';
    ahtTrackingList.style.listStyle = 'none'; // Remove default list styling
    ahtTrackingTabContent.appendChild(ahtTrackingList);

    menuContent.appendChild(tabs);
    menuContent.appendChild(keywordsTab);
    menuContent.appendChild(alertsTabContent);
    menuContent.appendChild(ahtTrackingTabContent);

    menu.appendChild(handle);
    menu.appendChild(button);
    menu.appendChild(menuContent);

    document.body.appendChild(menu);

    // Make the menu draggable using the handle
    makeDraggable(menu, handle);

    // Load the alert toggle state
    const alertEnabled = GM_getValue('alertEnabled', false);
    alertToggle.checked = alertEnabled;
    alertToggle.addEventListener('change', () => {
        GM_setValue('alertEnabled', alertToggle.checked);
        if (alertToggle.checked) {
            observeWIMAlerts();
        } else {
            stopObservingWIMAlerts();
        }
    });

    // Load the selected sound and volume
    const selectedSound = GM_getValue('selectedSound', 'beep');
    soundSelect.value = selectedSound;
    soundSelect.addEventListener('change', () => {
        GM_setValue('selectedSound', soundSelect.value);
    });

    const volume = GM_getValue('volume', 0.5);
    volumeSlider.value = volume;
    volumeSlider.addEventListener('input', () => {
        GM_setValue('volume', volumeSlider.value);
    });

    // Load the auto-assign checkbox state
    /*
    const autoAssignEnabled = GM_getValue('autoAssignEnabled', false);
    autoAssignCheckbox.checked = autoAssignEnabled;
    autoAssignCheckbox.addEventListener('change', () => {
        GM_setValue('autoAssignEnabled', autoAssignCheckbox.checked);
        console.log(`Auto-assign enabled: ${autoAssignCheckbox.checked}`);
    });
    */

    // Add an audio element for the alert sound
    const audio = document.createElement('audio');
    audio.id = 'alertSound';
    audio.type = 'audio/mpeg';
    document.body.appendChild(audio);
}

// Define the loadAlerts function
function loadAlerts() {
    const settings = loadSettings();

    const alertToggle = document.getElementById('alertToggle');
    if (alertToggle) {
        alertToggle.checked = settings.alertEnabled;
        alertToggle.addEventListener('change', () => {
            settings.alertEnabled = alertToggle.checked;
            saveSettings(settings);
            if (alertToggle.checked) {
                observeWIMAlerts();
            } else {
                stopObservingWIMAlerts();
            }
        });
    }

    const soundSelect = document.getElementById('soundSelect');
    if (soundSelect) {
        soundSelect.value = settings.selectedSound;
        soundSelect.addEventListener('change', () => {
            settings.selectedSound = soundSelect.value;
            saveSettings(settings);
        });
    }

    const volumeSlider = document.getElementById('volumeSlider');
    if (volumeSlider) {
        volumeSlider.value = settings.volume;
        volumeSlider.addEventListener('input', () => {
            settings.volume = volumeSlider.value;
            saveSettings(settings);
        });
    }

    const autoAssignCheckbox = document.getElementById('autoAssignCheckbox');
    if (autoAssignCheckbox) {
        autoAssignCheckbox.checked = settings.autoAssignEnabled;
        autoAssignCheckbox.addEventListener('change', () => {
            settings.autoAssignEnabled = autoAssignCheckbox.checked;
            saveSettings(settings);
        });
    }
}

// Function to play sound using Web Audio API
function playSound(type) {
    console.log("playSound function called with type:", type);
    // Ensure the audio context is resumed
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const gainNode = audioCtx.createGain();
    gainNode.connect(audioCtx.destination);

    const volume = document.getElementById('volumeSlider').value;
    gainNode.gain.value = volume;

    const playNote = (frequency, duration, startTime) => {
        const oscillator = audioCtx.createOscillator();
        oscillator.connect(gainNode);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime + startTime);
        oscillator.start(audioCtx.currentTime + startTime);
        oscillator.stop(audioCtx.currentTime + startTime + duration);
    };

    switch (type) {
        case 'beep':
            playNote(440, 1, 0); // A4 for 1 second
            break;
        case 'chime':
            playNoteSequence([
                { frequency: 392.00, duration: 0.3 }, // G4
                { frequency: 440.00, duration: 0.3 }, // A4
                { frequency: 523.25, duration: 0.3 }, // C5
                { frequency: 392.00, duration: 0.3 }  // G4
            ]);
            break;
        case 'ding':
            playNoteSequence([
                { frequency: 523.25, duration: 0.3 }, // C5
                { frequency: 587.33, duration: 0.3 }, // D5
                { frequency: 659.25, duration: 0.3 }, // E5
                { frequency: 523.25, duration: 0.3 }  // C5
            ]);
            break;
        default:
            playNoteSequence([
                { frequency: 440, duration: 0.3 }, // A4
                { frequency: 523.25, duration: 0.3 }, // C5
                { frequency: 659.25, duration: 0.3 }, // E5
                { frequency: 783.99, duration: 0.3 } // G5
            ]);
    }

    function playNoteSequence(notes) {
        let startTime = 0;
        notes.forEach(note => {
            playNote(note.frequency, note.duration, startTime);
            startTime += note.duration;
        });
    }
}

// Ensure the audio context is resumed on user interaction
document.addEventListener('click', () => {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
});


// Show the selected tab
function showTab(tabId) {
    const keywordsTab = document.getElementById('keywordsTab');
    const alertsTabContent = document.getElementById('alertsTab');
    const ahtTrackingTabContent = document.getElementById('ahtTrackingTab');

    if (tabId === 'keywordsTab') {
        keywordsTab.style.display = 'block';
        alertsTabContent.style.display = 'none';
        ahtTrackingTabContent.style.display = 'none';
    } else if (tabId === 'alertsTab') {
        keywordsTab.style.display = 'none';
        alertsTabContent.style.display = 'block';
        ahtTrackingTabContent.style.display = 'none';
    } else if (tabId === 'ahtTrackingTab') {
        keywordsTab.style.display = 'none';
        alertsTabContent.style.display = 'none';
        ahtTrackingTabContent.style.display = 'block';
    }
}

function trackWIM(vrid, wimLink) {
    console.log("Tracking WIM:", vrid, wimLink); // Debug log
    const ahtTrackingList = document.getElementById('ahtTrackingList');
    const listItem = document.createElement('li');
    listItem.textContent = `VRID: ${vrid} | Timer: 0s | WIM Link: ${wimLink}`;
    listItem.dataset.startTime = Date.now();
    listItem.dataset.vrid = vrid;
    listItem.dataset.wimLink = wimLink;

    const stopButton = document.createElement('button');
    stopButton.textContent = 'Stop';
    stopButton.style.marginLeft = '10px';
    stopButton.style.padding = '5px';
    stopButton.style.backgroundColor = '#ff0000';
    stopButton.style.color = '#ffffff';
    stopButton.style.border = 'none';
    stopButton.style.borderRadius = '5px';
    stopButton.style.cursor = 'pointer';
    stopButton.onclick = () => stopTrackingWIM(vrid);

    listItem.appendChild(stopButton);
    ahtTrackingList.appendChild(listItem);

    const interval = setInterval(() => {
        const elapsedTime = Math.floor((Date.now() - listItem.dataset.startTime) / 1000);
        listItem.firstChild.textContent = `VRID: ${vrid} | Timer: ${elapsedTime}s | WIM Link: ${wimLink}`;
    }, 1000);

    listItem.dataset.interval = interval;

    // Save the entry to Tampermonkey storage
    saveWIMEntries();
}

function stopTrackingWIM(vrid) {
    const ahtTrackingList = document.getElementById('ahtTrackingList');
    const listItem = Array.from(ahtTrackingList.children).find(item => item.dataset.vrid === vrid);

    if (listItem) {
        clearInterval(listItem.dataset.interval);
        listItem.textContent += ' | Resolved';
        saveWIMEntries(); // Save the updated entries to Tampermonkey storage
    }
}

function saveWIMEntries() {
    const ahtTrackingList = document.getElementById('ahtTrackingList');
    const entries = Array.from(ahtTrackingList.children).map(item => ({
        vrid: item.dataset.vrid,
        wimLink: item.dataset.wimLink,
        startTime: item.dataset.startTime,
        resolved: item.textContent.includes(' | Resolved')
    }));
    GM_setValue('wimEntries', JSON.stringify(entries));
}

function loadWIMEntries() {
    const entries = JSON.parse(GM_getValue('wimEntries', '[]'));
    entries.forEach(entry => {
        const ahtTrackingList = document.getElementById('ahtTrackingList');
        const listItem = document.createElement('li');
        listItem.textContent = `VRID: ${entry.vrid} | Timer: 0s | WIM Link: ${entry.wimLink}`;
        listItem.dataset.startTime = entry.startTime;
        listItem.dataset.vrid = entry.vrid;
        listItem.dataset.wimLink = entry.wimLink;

        const stopButton = document.createElement('button');
        stopButton.textContent = 'Stop';
        stopButton.style.marginLeft = '10px';
        stopButton.style.padding = '5px';
        stopButton.style.backgroundColor = '#ff0000';
        stopButton.style.color = '#ffffff';
        stopButton.style.border = 'none';
        stopButton.style.borderRadius = '5px';
        stopButton.style.cursor = 'pointer';
        stopButton.onclick = () => stopTrackingWIM(entry.vrid);

        listItem.appendChild(stopButton);
        ahtTrackingList.appendChild(listItem);

        if (!entry.resolved) {
            const interval = setInterval(() => {
                const elapsedTime = Math.floor((Date.now() - listItem.dataset.startTime) / 1000);
                listItem.firstChild.textContent = `VRID: ${entry.vrid} | Timer: ${elapsedTime}s | WIM Link: ${entry.wimLink}`;
            }, 1000);
            listItem.dataset.interval = interval;
        } else {
            listItem.textContent += ' | Resolved';
        }
    });
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
    }

    function elementDrag(e) {
        if (!isDragging) return;
        e.preventDefault();
        offsetX = e.clientX - initialX;
        offsetY = e.clientY - initialY;
        element.style.top = offsetY + "px";
        element.style.left = offsetX + "px";
    }

    function closeDragElement() {
        if (isDragging) {
            isDragging = false;
            document.removeEventListener('mousemove', elementDrag);
            document.removeEventListener('mouseup', closeDragElement);
        }
    }
}

// Function to validate keywords
function validateKeywords(keywords) {
    if (!Array.isArray(keywords)) {
        return [];
    }
    return keywords.filter(item => typeof item.keyword === 'string' && typeof item.color === 'string');
}

// Function to load keywords from storage
function loadKeywords() {
    console.log("Loading keywords..."); // Debug log

    const settings = loadSettings();
    const keywords = settings.keywords;

    console.log("Loaded keywords:", keywords); // Debug log

    const list = document.getElementById('keywordList');
    if (list) {
        list.innerHTML = '';

        keywords.forEach((item, index) => {
            console.log("Adding keyword to list:", item); // Debug log

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
    } else {
        console.error('Keyword list element not found!'); // Debug log
    }

    highlightKeywords(keywords);
}
// Function to save keywords to storage
function saveKeywords(keywords) {
    if (Array.isArray(keywords)) {
        GM_setValue('keywords', JSON.stringify(keywords));
    } else {
        console.error("Keywords are not an array. Not saving.");
    }
}
// Add or update keyword and color
function addOrUpdateKeyword() {
    const keyword = document.getElementById('keywordInput').value;
    const color = document.getElementById('colorInput').value;

    console.log("Adding/updating keyword:", keyword, "with color:", color); // Debug log

    if (keyword === '') return; // Don't allow empty keywords

    const settings = loadSettings();
    let keywords = settings.keywords;

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

    settings.keywords = keywords;
    saveSettings(settings);
    loadKeywords();
    highlightKeywords(keywords); // Ensure keywords are highlighted after adding/updating
}

// Edit keyword and color
function editKeyword(index) {
    const settings = loadSettings();
    const keyword = settings.keywords[index];

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

    const settings = loadSettings();
    settings.keywords[index] = { keyword, color };

    saveSettings(settings);
    loadKeywords();
    highlightKeywords(settings.keywords); // Ensure keywords are highlighted after updating

    document.getElementById('addButton').textContent = 'Add/Update Keyword';
    document.getElementById('addButton').onclick = addOrUpdateKeyword;
}
// Remove keyword
function removeKeyword(index) {
    const settings = loadSettings();
    settings.keywords.splice(index, 1);

    saveSettings(settings);
    loadKeywords();
    highlightKeywords(settings.keywords); // Ensure keywords are highlighted after removing
}

// Highlight keywords in page content
function highlightKeywords(keywords) {
    //console.log("Highlighting keywords...", keywords); // Debug log

    // Ensure keywords is an array
    if (!Array.isArray(keywords)) {
        console.error('Keywords are stored incorrectly. Resetting to an empty array.');
        keywords = [];
    }

    // Validate keywords
    keywords = keywords.filter(item => typeof item.keyword === 'string' && typeof item.color === 'string');

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    const nodes = [];

    while (walker.nextNode()) {
        nodes.push(walker.currentNode);
    }

    nodes.forEach(node => {
        const parent = node.parentNode;
        const text = node.nodeValue;

        // Skip nodes that are already highlighted
        if (parent && parent.classList && parent.classList.contains('highlighted-keyword')) {
            return;
        }

        keywords.forEach(keyword => {
            const regex = new RegExp(`(${keyword.keyword})`, 'gi');
            const parts = text.split(regex);

            if (parts.length > 1) {
                const fragment = document.createDocumentFragment();

                parts.forEach(part => {
                    if (regex.test(part)) {
                        const span = document.createElement('span');
                        span.className = 'highlighted-keyword';
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
    xhr.onload = function () {
        if (xhr.status === 200) {
            console.log("Audio file downloaded successfully.");
            const blob = xhr.response;
            const objectURL = URL.createObjectURL(blob);
            callback(objectURL);
        } else {
            console.error('Failed to download audio file:', xhr.status, xhr.statusText);
        }
    };
    xhr.onerror = function () {
        console.error('Network error while downloading audio file.');
    };
    xhr.send();
}

let wimObserver;
// Function to observe WIM alerts.
function observeWIMAlerts() {
    console.log("observeWIMAlerts function called.");
    if (window.location.href.includes('https://optimus-internal.amazon.com/wims')) {
        console.log("URL matches WIMS page.");
        wimObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) {
                            const assignButton = node.querySelector('.btn-primary.btn-block.btn.btn-info');
                            const autoAssignEnabled = GM_getValue('autoAssignEnabled', false);
                            if (assignButton) {
                                console.log("Assign to me button detected.");
                                const selectedSound = document.getElementById('soundSelect').value;
                                console.log("Selected sound:", selectedSound);
                                playSound(selectedSound);

                                // Capture the WIM URL with retry mechanism
                                let wimUrlElement = node.querySelector('td.TASK_ID.severity-1 a.task-link');
                                let retries = 0;
                                const maxRetries = 5;
                                const retryInterval = setInterval(() => {
                                    if (wimUrlElement || retries >= maxRetries) {
                                        clearInterval(retryInterval);
                                        if (!wimUrlElement) {
                                            console.error("WIM URL element not found after retries.");
                                            return;
                                        }
                                        const wimUrl = wimUrlElement.href;
                                        console.log("WIM URL detected:", wimUrl);

                                        if (autoAssignEnabled) {
                                            let countdown = 5;
                                            const interval = setInterval(() => {
                                                countdown--;
                                                console.log(`Auto-assign countdown: ${countdown}`);
                                                if (countdown < 0) {
                                                    clearInterval(interval);
                                                    assignButton.click();
                                                    console.log("Assign button clicked automatically.");
                                                    // Capture the URL of the page that loads
                                                    setTimeout(() => {
                                                        const newPageUrl = window.location.href;
                                                        console.log("Attempting to store new page URL after assignment:", newPageUrl);
                                                        localStorage.setItem('wimURL', newPageUrl);
                                                        console.log("New page URL stored in local storage:", newPageUrl);
                                                        trackWIM(wimUrl, newPageUrl);
                                                    }, 1000);
                                                }
                                            }, 1000);
                                        } else {
                                            assignButton.addEventListener('click', () => {
                                                console.log("Assign button clicked manually.");
                                                // Capture the URL of the page that loads
                                                setTimeout(() => {
                                                    const newPageUrl = window.location.href;
                                                    console.log("Attempting to store new page URL after assignment:", newPageUrl);
                                                    localStorage.setItem('wimURL', newPageUrl);
                                                    console.log("New page URL stored in local storage:", newPageUrl);
                                                    trackWIM(wimUrl, newPageUrl);
                                                }, 1000);
                                            });
                                        }
                                    } else {
                                        console.log("Retrying to find WIM URL element...");
                                        wimUrlElement = node.querySelector('td.TASK_ID.severity-1 a.task-link');
                                        retries++;
                                    }
                                }, 1000);
                            } else {
                                console.log("Assign to me button not found.");
                            }
                        }
                    });
                }
            });
        });

        wimObserver.observe(document.body, { childList: true, subtree: true });
    } else {
        console.log("URL does not match WIMS page.");
    }
}

// ...existing code...

function stopObservingWIMAlerts() {
    if (wimObserver) {
        wimObserver.disconnect();
        console.log("Stopped observing WIM alerts.");
    }
}

// Function to click the assign button with retry mechanism
function clickAssignButton(button) {
    const maxRetries = 5;
    let retries = 0;

    const interval = setInterval(() => {
        if (button) {
            button.click();
            console.log("Assign button clicked.");
            clearInterval(interval);
        } else if (retries >= maxRetries) {
            console.log("Failed to find the assign button after multiple attempts.");
            clearInterval(interval);
        } else {
            console.log("Retrying to find the assign button...");
            retries++;
        }
    }, 1000); // Retry every second
}

// Ensure the page is fully loaded before trying to access elements
window.addEventListener('load', function () {
    console.log("Window loaded.");

    createFloatingIcon();
    createFloatingMenu();
    loadKeywords();
    loadAlerts();
    loadWIMEntries(); 

    const addButton = document.getElementById('addButton');
    if (addButton) {
        console.log("Add button exists.");
        addButton.addEventListener('click', addOrUpdateKeyword);
    } else {
        console.error('Add button not found!');
    }

    // Ensure the "WIM Alert" checkbox is enabled on load
    const alertToggle = document.getElementById('alertToggle');
    if (alertToggle) {
        alertToggle.checked = true;
        alertToggle.dispatchEvent(new Event('change'));
    } else {
        console.error('Alert toggle not found!');
    }

    // Highlight keywords every 15 seconds
    setInterval(() => {
        const settings = loadSettings();
        highlightKeywords(settings.keywords);
    }, 15000);
});

// Toggle the visibility of the floating menu
function toggleMenu() {
    const menu = document.getElementById('floatingMenu');
    if (menu) {
        if (menu.style.display === 'none') {
            menu.style.display = 'block';
            console.log("Menu is now visible.");
        } else {
            menu.style.display = 'none';
            console.log("Menu is now hidden.");
        }
    } else {
        console.error('Floating menu element not found!');
    }
}
loadKeywords();
