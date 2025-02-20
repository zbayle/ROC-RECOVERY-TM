// ==UserScript==
// @name         ROC Tools Tomy
// @namespace    https://amazon.com
// @version      3.4.tomy
// @description  Highlight specified keywords dynamically with custom colors using a floating menu in Tampermonkey. Also alerts when a WIM is offered on specific pages.
// @autor        zbbayle
// @match        *://*/*
// @match        https://optimus-internal.amazon.com/*
// @match        https://trans-logistics.amazon.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_log
// @grant        GM_registerMenuCommand
// @connect      raw.githubusercontent.com
// @updateURL    https://github.com/zbayle/ROC-RECOVERY-TM/raw/refs/heads/tomy/ROC-Tools.js
// @downloadURL  https://github.com/zbayle/ROC-RECOVERY-TM/raw/refs/heads/tomy/ROC-Tools.js
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
        volume: '0.5',
        visualizationType: 'eclipse'
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

function saveSettings(settings) {
    GM_setValue('settings', JSON.stringify(settings));
}

// Function to create and insert the floating icon
function createFloatingIcon() {
    if (window.top !== window.self) {
        return;
    }
    // Check if the body contains an element with the class "phone-container"
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
    // Ensure this script runs only in the top window
    if (window.top !== window.self) {
        return;
    }

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

    tabs.appendChild(keywordTab);
    tabs.appendChild(alertsTab);

    const keywordsTab = document.createElement('div');
    keywordsTab.id = 'keywordsTab';
    keywordsTab.style.display = 'block';

    // Add a label for the keyword input
    const keywordInputLabel = document.createElement('label');
    keywordInputLabel.textContent = 'Keyword: ';
    keywordInputLabel.style.display = 'block'; 
    keywordInputLabel.style.marginBottom = '5px'; 
    keywordsTab.appendChild(keywordInputLabel);

    // Create an input field for the keyword
    const keywordInput = document.createElement('input');
    keywordInput.type = 'text';
    keywordInput.id = 'keywordInput';
    keywordInput.style.marginBottom = '15px'; 
    keywordInput.style.padding = '10px';
    keywordInput.style.border = '1px solid #146eb4';
    keywordInput.style.borderRadius = '5px';
    keywordInput.style.width = '100%';
    keywordsTab.appendChild(keywordInput);

    // Add a label for the color input
    const colorInputLabel = document.createElement('label');
    colorInputLabel.textContent = ' Color: ';
    colorInputLabel.style.display = 'block'; 
    colorInputLabel.style.marginBottom = '5px'; 
    keywordsTab.appendChild(colorInputLabel);

    // Create a color input for selecting the color
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.id = 'colorInput';
    colorInput.style.marginBottom = '15px'; 
    colorInput.style.border = '1px solid #146eb4';
    colorInput.style.borderRadius = '5px';
    colorInput.style.width = '100%';
    keywordsTab.appendChild(colorInput);

    // Add a button to add/update the keyword and color
    const addButton = document.createElement('button');
    addButton.textContent = 'Add/Update Keyword';
    addButton.id = 'addButton';
    addButton.style.marginBottom = '15px'; 
    addButton.style.padding = '10px';
    addButton.style.backgroundColor = '#ff9900';
    addButton.style.color = '#000000';
    addButton.style.border = 'none';
    addButton.style.borderRadius = '5px';
    addButton.style.cursor = 'pointer';
    addButton.style.width = '100%'; 
    addButton.style.boxSizing = 'border-box';
    addButton.onmouseover = () => addButton.style.backgroundColor = '#e68a00';
    addButton.onmouseout = () => addButton.style.backgroundColor = '#ff9900';
    keywordsTab.appendChild(addButton);

    // Add event listener to the add button
    const keywordList = document.createElement('ul');
    keywordList.id = 'keywordList';
    keywordList.style.padding = '0';
    keywordList.style.listStyle = 'none';
    keywordsTab.appendChild(keywordList);

    // Define alertsTabContent here
    const alertsTabContent = document.createElement('div');
    alertsTabContent.id = 'alertsTab';
    alertsTabContent.style.display = 'none';

    // Add a label for the WIM alert toggle
    const alertToggleLabel = document.createElement('label');
    alertToggleLabel.textContent = ' Enable WIM Alerts: ';
    alertToggleLabel.style.display = 'block';
    alertToggleLabel.style.marginBottom = '5px';
    alertsTabContent.appendChild(alertToggleLabel);

    // Create a checkbox for enabling WIM alerts
    const alertToggle = document.createElement('input');
    alertToggle.type = 'checkbox';
    alertToggle.id = 'alertToggle';
    alertToggle.style.marginBottom = '15px';
    alertsTabContent.appendChild(alertToggle);

    // Add a label for the sound selection
    const soundSelectLabel = document.createElement('label');
    soundSelectLabel.textContent = ' Sound: ';
    soundSelectLabel.style.display = 'block'; 
    soundSelectLabel.style.marginBottom = '5px'; 
    alertsTabContent.appendChild(soundSelectLabel);

    // Create a select element for sound options
    const soundSelect = document.createElement('select');
    soundSelect.id = 'soundSelect';
    soundSelect.style.marginBottom = '15px'; 
    soundSelect.style.padding = '10px';
    soundSelect.style.border = '1px solid #146eb4';
    soundSelect.style.borderRadius = '5px';
    soundSelect.style.width = '100%';
    const sounds = [
        { name: 'Beep', url: 'beep' },
        { name: 'Chime', url: 'chime' },
        { name: 'Ding', url: 'ding' },
        { name: 'Level-Up', url: 'levelup' },
        { name: 'Base & Kick', url: 'hiphop' },
        { name: 'Fairy', url: 'fairy' }
    ];
    sounds.forEach(sound => {
        const option = document.createElement('option');
        option.value = sound.url;
        option.textContent = sound.name;
        soundSelect.appendChild(option);
    });
    alertsTabContent.appendChild(soundSelect);

    // Add a label for the visualization type selection
    const visualizationSelectLabel = document.createElement('label');
    visualizationSelectLabel.textContent = ' Visualization Type: ';
    visualizationSelectLabel.style.display = 'block';
    visualizationSelectLabel.style.marginBottom = '5px';
    alertsTabContent.appendChild(visualizationSelectLabel);

    // Create a select element for visualization type options
    const visualizationSelect = document.createElement('select');
    visualizationSelect.id = 'visualizationSelect';
    visualizationSelect.style.display = 'block';
    visualizationSelect.style.marginBottom = '15px';
    visualizationSelect.style.padding = '10px';
    visualizationSelect.style.border = '1px solid #146eb4';
    visualizationSelect.style.borderRadius = '5px';
    visualizationSelect.style.width = '100%';
    const visualizations = [
        { name: 'Eclipse', value: 'eclipse' },
    ];
    visualizations.forEach(visualization => {
        const option = document.createElement('option');
        option.value = visualization.value;
        option.textContent = visualization.name;
        visualizationSelect.appendChild(option);
    });
    alertsTabContent.appendChild(visualizationSelect);
    const visualizationType = GM_getValue('visualizationType', 'eclipse');
    visualizationSelect.value = visualizationType;
    visualizationSelect.addEventListener('change', () => {
        GM_setValue('visualizationType', visualizationSelect.value);
    });

    // Add a label for the volume slider
    const volumeLabel = document.createElement('label');
    volumeLabel.textContent = ' Volume: ';
    volumeLabel.style.display = 'block'; 
    volumeLabel.style.marginBottom = '5px'; 
    alertsTabContent.appendChild(volumeLabel);

    // Create a slider for volume control
    const volumeSlider = document.createElement('input');
    volumeSlider.type = 'range';
    volumeSlider.id = 'volumeSlider';
    volumeSlider.min = '0';
    volumeSlider.max = '1';
    volumeSlider.step = '0.01';
    volumeSlider.value = '0.5'; 
    volumeSlider.style.marginBottom = '15px'; 
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
    testButton.style.width = '100%';
    testButton.style.boxSizing = 'border-box';
    testButton.onmouseover = () => testButton.style.backgroundColor = '#e68a00';
    testButton.onmouseout = () => testButton.style.backgroundColor = '#ff9900';
    testButton.onclick = () => {
        const selectedSound = document.getElementById('soundSelect').value;
        playSound(selectedSound);
        // Add the canvas to the floating menu
        const canvas = document.createElement('canvas');
        canvas.id = 'audioCanvas';
        canvas.width = 300;
        canvas.height = 100;
        alertsTabContent.appendChild(canvas);
    };
    alertsTabContent.appendChild(testButton);

    const ahtTrackingTabContent = document.createElement('div');
    ahtTrackingTabContent.id = 'ahtTrackingTab';
    ahtTrackingTabContent.style.display = 'none';

    // Add a label for the AHT tracking
    const ahtTrackingList = document.createElement('ul');
    ahtTrackingList.id = 'ahtTrackingList';
    ahtTrackingList.style.padding = '0';
    ahtTrackingList.style.listStyle = 'none'; 
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

    // Load the alert toggle state
    const alertEnabled = GM_getValue('alertEnabled', true);
    if (alertToggle) {
        alertToggle.checked = alertEnabled;
        alertToggle.addEventListener('change', () => {
            GM_setValue('alertEnabled', alertToggle.checked);
        });
    }

    // Add an audio element for the alert sound
    const audio = document.createElement('audio');
    audio.id = 'alertSound';
    audio.type = 'audio/mpeg';
    document.body.appendChild(audio);
}

// Load the alert toggle state
const alertEnabled = GM_getValue('alertEnabled', true);
const alertToggle = document.getElementById('alertToggle');
if (alertToggle) {
    alertToggle.checked = true;
    alertToggle.disabled = true;
}


// Load the alert toggle state
function loadAlerts() {
    const settings = loadSettings();

    const alertToggle = document.getElementById('alertToggle');
    if (alertToggle) {
        alertToggle.checked = settings.alertEnabled;
        alertToggle.disabled = true;
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

    const analyser = audioCtx.createAnalyser();
    gainNode.connect(analyser);
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const canvas = document.getElementById('audioCanvas');
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }
    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) {
        console.error('Failed to get canvas context!');
        return;
    }

    function draw() {
        requestAnimationFrame(draw);

        analyser.getByteFrequencyData(dataArray);

        // Clear the canvas before drawing
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

        const visualizationType = document.getElementById('visualizationSelect').value;

        if (visualizationType === 'eclipse') {
            drawEclipse();
        } else if (visualizationType === 'wave') {
            drawWave();
        }
    }

    function drawEclipse() {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;
        const barWidth = (2 * Math.PI) / bufferLength;

        for (let i = 0; i < bufferLength; i++) {
            const barHeight = dataArray[i] / 2;
            const angle = i * barWidth;

            const randomOffsetX = (Math.random() - 0.5) * 10;
            const randomOffsetY = (Math.random() - 0.5) * 10;

            const x1 = centerX + Math.cos(angle) * (radius + randomOffsetX);
            const y1 = centerY + Math.sin(angle) * (radius + randomOffsetY);
            const x2 = centerX + Math.cos(angle) * (radius + barHeight + randomOffsetX);
            const y2 = centerY + Math.sin(angle) * (radius + barHeight + randomOffsetY);

            canvasCtx.strokeStyle = `rgb(${barHeight + 100}, 50, 50)`;
            canvasCtx.lineWidth = 2;
            canvasCtx.beginPath();
            canvasCtx.moveTo(x1, y1);
            canvasCtx.lineTo(x2, y2);
            canvasCtx.stroke();
        }
    }

    function drawWave() {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;
        const barWidth = (2 * Math.PI) / bufferLength;

        for (let i = 0; i < bufferLength; i++) {
            const barHeight = dataArray[i] / 2;
            const angle = i * barWidth;

            const randomOffsetX = (Math.random() - 0.5) * 10;
            const randomOffsetY = (Math.random() - 0.5) * 10;

            const x1 = centerX + Math.cos(angle) * (radius + randomOffsetX);
            const y1 = centerY + Math.sin(angle) * (radius + randomOffsetY);
            const x2 = centerX + Math.cos(angle) * (radius + barHeight + randomOffsetX);
            const y2 = centerY + Math.sin(angle) * (radius + barHeight + randomOffsetY);

            canvasCtx.strokeStyle = `rgb(${barHeight + 100}, 50, 50)`;
            canvasCtx.lineWidth = 2;
            canvasCtx.beginPath();
            canvasCtx.moveTo(centerX, centerY);
            canvasCtx.quadraticCurveTo(x1, y1, x2, y2); // Create a wave effect
            canvasCtx.stroke();
        }
    }

    draw();

    const playNote = (frequency, duration, startTime, type = 'sine') => {
        const oscillator = audioCtx.createOscillator();
        oscillator.connect(gainNode);
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime + startTime);
        oscillator.start(audioCtx.currentTime + startTime);
        oscillator.stop(audioCtx.currentTime + startTime + duration);
    };

    switch (type) {
        case 'beep':
            playNote(440, 1, 0, 'square'); // A4 for 1 second with square waveform
            break;
        case 'chime':
            playNoteSequence([
                { frequency: 392.00, duration: 0.3, type: 'sine' }, // G4
                { frequency: 440.00, duration: 0.3, type: 'sine' }, // A4
                { frequency: 523.25, duration: 0.3, type: 'sine' }, // C5
                { frequency: 392.00, duration: 0.3, type: 'sine' }, // G4
                { frequency: 659.25, duration: 0.3, type: 'sine' }, // E5
                { frequency: 783.99, duration: 0.3, type: 'sine' }  // G5
            ]);
            break;
        case 'ding':
            playNoteSequence([
                { frequency: 523.25, duration: 0.3, type: 'triangle' }, // C5
                { frequency: 587.33, duration: 0.3, type: 'triangle' }, // D5
                { frequency: 659.25, duration: 0.3, type: 'triangle' }, // E5
                { frequency: 523.25, duration: 0.3, type: 'triangle' }  // C5
            ]);
            break;
        case 'levelup':
            playNoteSequence([
                { frequency: 523.25, duration: 0.2, type: 'sine' }, // C5
                { frequency: 659.25, duration: 0.2, type: 'sine' }, // E5
                { frequency: 783.99, duration: 0.2, type: 'sine' }, // G5
                { frequency: 1046.50, duration: 0.4, type: 'sine' }, // C6
                { frequency: 880.00, duration: 0.2, type: 'square' }, // A5
                { frequency: 987.77, duration: 0.2, type: 'square' }, // B5
                { frequency: 1046.50, duration: 0.4, type: 'square' }  // C6
            ]);
            break;
        case 'hiphop':
            playNoteSequence([
                { frequency: 60, duration: 0.5, type: 'sine' }, // Kick
                { frequency: 120, duration: 0.2, type: 'square' }, // Snare
                { frequency: 60, duration: 0.5, type: 'sine' }, // Kick
                { frequency: 120, duration: 0.2, type: 'square' }, // Snare
                { frequency: 80, duration: 0.3, type: 'triangle' }, // Hi-hat
                { frequency: 80, duration: 0.3, type: 'triangle' }  // Hi-hat
            ]);
            break;
        case 'fairy':
            playNoteSequence([
                { frequency: 1046.50, duration: 0.2, type: 'square' }, // C6
                { frequency: 1174.66, duration: 0.2, type: 'square' }, // D6
                { frequency: 1318.51, duration: 0.2, type: 'square' }, // E6
                { frequency: 1567.98, duration: 0.4, type: 'square' }, // G6
                { frequency: 2093.00, duration: 0.2, type: 'square' }, // C7
                { frequency: 2349.32, duration: 0.2, type: 'square' }, // D7
                { frequency: 2637.02, duration: 0.4, type: 'square' }  // E7
            ]);
            break;
        default:
            playNoteSequence([
                { frequency: 440, duration: 0.3, type: 'sine' }, // A4
                { frequency: 523.25, duration: 0.3, type: 'sine' }, // C5
                { frequency: 659.25, duration: 0.3, type: 'sine' }, // E5
                { frequency: 783.99, duration: 0.3, type: 'sine' } // G5
            ]);
    }

    function playNoteSequence(notes) {
        let startTime = 0;
        notes.forEach(note => {
            playNote(note.frequency, note.duration, startTime, note.type);
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
    //console.log("Tracking WIM:", vrid, wimLink); // Debug log
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

// Define hard-coded keywords and their colors
const hardCodedKeywords = [
    { keyword: 'Trailer Not Moving', color: '#ff0000' },
    { keyword: 'GAPS', color: '#ff9900' },
];

// Highlight keywords in page content
function highlightKeywords(keywords) {
    // Ensure keywords is an array
    if (!Array.isArray(keywords)) {
        console.error('Keywords are stored incorrectly. Resetting to an empty array.');
        keywords = [];
    }

    // Validate keywords
    keywords = keywords.filter(item => typeof item.keyword === 'string' && typeof item.color === 'string');

    // Merge hard-coded keywords with user-defined keywords
    const allKeywords = [...hardCodedKeywords, ...keywords];

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

        allKeywords.forEach(keyword => {
            const regex = new RegExp(`(${keyword.keyword})`, 'gi');
            const parts = text.split(regex);

            if (parts.length > 1) {
                const fragment = document.createDocumentFragment();

                parts.forEach(part => {
                    if (regex.test(part)) {
                        const span = document.createElement('span');
                        span.className = 'highlighted-keyword';
                        span.style.border = `2px solid ${keyword.color}`;
                        span.style.backgroundColor = keyword.color; // Set background color
                        span.style.color = '#ffffff'; // Set text color to white for better contrast
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
                                //console.log("Assign to me button not found.");
                            }
                        }
                    });
                }
            });
        });

        // Initial check for the "Assign to me" button
        const initialAssignButton = document.querySelector('.btn-primary.btn-block.btn.btn-info');
        if (initialAssignButton) {
            console.log("Initial 'Assign to me' button detected.");
            const selectedSound = document.getElementById('soundSelect').value;
            console.log("Selected sound:", selectedSound);
            playSound(selectedSound);
        }

        wimObserver.observe(document.body, { childList: true, subtree: true });
    } else {
        console.log("URL does not match WIMS page.");
    }
}

// Function to stop observing WIM alerts
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
        alertToggle.disabled = false;
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
            // Remove the canvas when the menu is closed
            const canvas = document.getElementById('audioCanvas');
            if (canvas) {
                canvas.remove();
                console.log("Canvas removed from the floating menu.");
            }
        }
    } else {
        console.error('Floating menu element not found!');
    }
}
loadKeywords();
