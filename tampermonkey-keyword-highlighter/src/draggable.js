export function makeDraggable(element, handle = element) {
    let offsetX = 0, offsetY = 0, initialX = 0, initialY = 0;

    handle.addEventListener('mousedown', dragMouseDown);

    function dragMouseDown(e) {
        e.preventDefault();
        initialX = e.clientX - element.offsetLeft;
        initialY = e.clientY - element.offsetTop;
        document.addEventListener('mousemove', elementDrag);
        document.addEventListener('mouseup', closeDragElement);
    }

    function elementDrag(e) {
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
        document.removeEventListener('mousemove', elementDrag);
        document.removeEventListener('mouseup', closeDragElement);
    }
}