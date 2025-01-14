// This file contains the implementation of the createFloatingMenu function, which creates and injects the floating menu into the page.

export function createFloatingMenu() {
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

    const button = document.createElement('button');
    button.textContent = 'Close Menu';
    button.style.marginBottom = '10px';
    button.style.padding = '10px';
    button.style.backgroundColor = '#0fffcf';
    button.style.color = '#333';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.onclick = toggleMenu;

    const menuContent = document.createElement('div');
    menuContent.id = 'floatingMenuContent';
    menuContent.style.marginTop = '10px';

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

    document.body.appendChild(menu);

    // Make the menu draggable using the handle
    makeDraggable(menu, handle);

    // Load the alert toggle state
    const alertEnabled = GM_getValue('alertEnabled', false);
    alertToggle.checked = alertEnabled;
    alertToggle.addEventListener('change', () => {
        GM_setValue('alertEnabled', alertToggle.checked);
    });

    // Start observing for WIM alerts if enabled
    if (alertEnabled) {
        observeWIMAlerts();
    }

    // Add an audio element for the alert sound
    const audio = document.createElement('audio');
    audio.id = 'alertSound';
    audio.src = 'https://www.soundjay.com/button/beep-07.wav'; // Replace with your preferred sound URL
    audio.type = 'audio/wav';
    document.body.appendChild(audio);
}