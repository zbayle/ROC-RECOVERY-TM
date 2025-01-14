function createFloatingIcon() {
    const icon = document.createElement('div');
    icon.style.position = 'fixed';
    icon.style.top = '10px';
    icon.style.left = '10px';
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

    icon.onclick = toggleMenu;

    document.body.appendChild(icon);

    makeDraggable(icon);
}

export { createFloatingIcon };