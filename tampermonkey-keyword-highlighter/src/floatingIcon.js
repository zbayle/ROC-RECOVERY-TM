import { toggleMenu } from './floatingMenu';
import { makeDraggable } from './draggable';


export function createFloatingIcon() {
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