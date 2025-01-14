# Tampermonkey Keyword Highlighter

## Overview
The Tampermonkey Keyword Highlighter is a userscript designed to dynamically highlight specified keywords on web pages. It features a floating menu that allows users to manage keywords and alerts easily.

## Project Structure
```
tampermonkey-keyword-highlighter
├── src
│   ├── main.js            # Entry point of the application
│   ├── floatingIcon.js    # Functionality for the floating icon
│   ├── floatingMenu.js     # Functionality for the floating menu
│   ├── draggable.js        # Draggable functionality for elements
│   ├── keywords.js         # Keyword management functions
│   ├── alerts.js           # Alert management functions
│   └── utils.js            # Utility functions
├── package.json            # npm configuration file
├── .eslintrc.json          # ESLint configuration file
└── README.md               # Project documentation
```

## Installation
1. Install Tampermonkey extension in your browser.
2. Clone this repository or download the script files.
3. Create a new userscript in Tampermonkey and copy the contents of `src/main.js` into it.

## Usage
- After installing the script, a floating icon will appear on the specified web pages.
- Click the icon to open the floating menu, where you can add or update keywords and manage alerts.
- Keywords will be highlighted in the page content based on the specified colors.

## Contributing
Feel free to submit issues or pull requests for improvements and bug fixes.

## License
This project is open-source and available under the MIT License.