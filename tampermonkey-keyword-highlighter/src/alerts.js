// Load alerts safely
function loadAlerts() {
    console.log("Loading saved alerts...");

    let alerts = [];
    try {
        alerts = GM_getValue('alerts', []);
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

// Add or update alert
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
    } else {
        // Add new alert
        alerts.push({ text: alertText, sound: alertSound, soundName: alertSoundName });
    }

    // Store alerts as an array
    GM_setValue('alerts', alerts);
    console.log("Updated alerts in storage:", GM_getValue('alerts'));
    loadAlerts();
}

// Edit alert
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

// Update alert
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

// Remove alert
function removeAlert(index) {
    let alerts = GM_getValue('alerts', []);
    alerts.splice(index, 1);
    GM_setValue('alerts', alerts);
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
                                audio.play().catch(error => console.error("Error playing audio:", error));
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