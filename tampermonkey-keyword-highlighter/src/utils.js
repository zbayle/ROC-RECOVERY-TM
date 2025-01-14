// Utility functions for the keyword highlighter script

// Validate keywords to ensure they have the required properties
export function validateKeywords(keywords) {
    return Array.isArray(keywords) ? keywords.filter(item => item.keyword && item.color) : [];
}

// Highlight keywords in the page content
export function highlightKeywords(keywords) {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    const nodes = [];

    while (walker.nextNode()) {
        nodes.push(walker.currentNode);
    }

    nodes.forEach(node => {
        const parent = node.parentNode;
        const text = node.nodeValue;

        keywords.forEach(keyword => {
            const regex = new RegExp(`(${keyword.keyword})`, 'gi');
            const parts = text.split(regex);

            if (parts.length > 1) {
                const fragment = document.createDocumentFragment();

                parts.forEach(part => {
                    if (regex.test(part)) {
                        const span = document.createElement('span');
                        span.style.border = `2px solid ${keyword.color}`;
                        span.style.padding = '2px';
                        span.textContent = part;
                        fragment.appendChild(span);
                    } else {
                        fragment.appendChild(document.createTextNode(part));
                    }
                });

                parent.replaceChild(fragment, node);
            }
        });
    });
}