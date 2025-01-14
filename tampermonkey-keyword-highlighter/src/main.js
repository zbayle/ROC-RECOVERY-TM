// Entry point of the application
import { createFloatingIcon } from './floatingIcon.js';
import { createFloatingMenu } from './floatingMenu.js';
import { loadKeywords } from './keywords.js';

window.onload = function () {
    console.log("Window loaded.");

    createFloatingIcon();
    createFloatingMenu();
    loadKeywords();
};