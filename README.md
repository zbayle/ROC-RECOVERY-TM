# ROC Tools TOMY 3.1

This Tampermonkey script provides alerts when ATR is on and a task is offered. It also dynamically highlights specified keywords with customizable colors using a floating menu.

## Features

- **Keyword Highlighting**: Dynamically highlight specified keywords with custom colors.
- **Floating Menu**: A draggable floating menu to manage keywords and settings.
- **Audio Alerts**: Play customizable alert sounds when specific conditions are met.

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) in your browser.
2. Click [here](https://github.com/zbayle/ROC-RECOVERY-TM/raw/refs/heads/tomy/ROC-Tools.js) to install the script.

## Usage

1. A floating icon will appear on the page. Click it to open the floating menu.
2. Use the menu to add keywords and select highlight colors.
3. The keywords will be dynamically highlighted on the page.
4. Configure alert settings to receive audio notifications.

## Settings

### Keyword Management

- **Add/Update Keyword**: Enter a keyword and select a color to highlight it on the page.
- **Edit Keyword**: Modify an existing keyword and its color.
- **Remove Keyword**: Delete a keyword from the list.
- **Critical Keywords**: Highlights critical keywords, set by admins of the project.

### Critical Keywords

The following keywords are hard-coded and will always be highlighted with the specified colors:

- **Trailer Not Moving**: Highlighted in red (`#ff0000`).
- **GAPS**: Highlighted in orange (`#ff9900`).

### Alerts

- **Select Alert Sound**: Choose from different alert sounds.
- **Volume Control**: Adjust the volume of the alert sound.
- **Test Alert Sound**: Play the selected alert sound to test it.