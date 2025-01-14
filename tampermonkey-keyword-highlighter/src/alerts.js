// This file contains functions related to alert management, including observeWIMAlerts and handling alert toggles.

export function observeWIMAlerts() {
    if (window.location.href.includes('https://optimus-internal.amazon.com/wims')) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1 && node.querySelector('.btn-primary.btn-block.btn.btn-info')) {
                            const audio = document.getElementById('alertSound');
                            if (audio) {
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

export function setupAlertToggle() {
    const alertToggle = document.getElementById('alertToggle');
    const alertEnabled = GM_getValue('alertEnabled', false);
    alertToggle.checked = alertEnabled;

    alertToggle.addEventListener('change', () => {
        GM_setValue('alertEnabled', alertToggle.checked);
        if (alertToggle.checked) {
            observeWIMAlerts();
        }
    });
}