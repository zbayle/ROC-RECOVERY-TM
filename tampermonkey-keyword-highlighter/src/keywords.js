// This file contains functions related to keyword management, including loading, adding, updating, and removing keywords.

export function loadKeywords() {
    console.log("Loading saved keywords...");

    let keywords = [];
    try {
        keywords = GM_getValue('keywords', []);
    } catch (e) {
        console.error('Error reading from storage. Resetting keywords.');
    }

    keywords = validateKeywords(keywords);

    const list = document.getElementById('keywordList');
    list.innerHTML = '';

    keywords.forEach((item, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${item.keyword}: ${item.color}`;
        listItem.style.color = item.color;

        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.onclick = () => editKeyword(index);
        listItem.appendChild(editButton);

        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.onclick = () => removeKeyword(index);
        listItem.appendChild(removeButton);

        list.appendChild(listItem);
    });

    console.log("Keywords loaded successfully.");
    highlightKeywords(keywords);
}

export function addOrUpdateKeyword() {
    const keyword = document.getElementById('keywordInput').value;
    const color = document.getElementById('colorInput').value;

    if (keyword === '') return; // Don't allow empty keywords

    let keywords = GM_getValue('keywords', []);

    if (typeof keywords === 'object' && !Array.isArray(keywords)) {
        console.error('Keywords are stored incorrectly. Resetting to an empty array.');
        keywords = [];
    }

    const existingIndex = keywords.findIndex(item => item.keyword === keyword);
    if (existingIndex !== -1) {
        keywords[existingIndex] = { keyword, color };
    } else {
        const duplicateIndex = keywords.findIndex(item => item.keyword.toLowerCase() === keyword.toLowerCase());
        if (duplicateIndex !== -1) {
            console.error("This keyword already exists. Please enter a different keyword.");
            return;
        }

        keywords.push({ keyword, color });
    }

    GM_setValue('keywords', keywords);
    console.log("Updated keywords in storage:", GM_getValue('keywords'));
    loadKeywords();
    highlightKeywords(keywords);
}

export function editKeyword(index) {
    const keywords = GM_getValue('keywords', []);
    const keyword = keywords[index];

    document.getElementById('keywordInput').value = keyword.keyword;
    document.getElementById('colorInput').value = keyword.color;

    document.getElementById('addButton').textContent = 'Update Keyword';
    document.getElementById('addButton').onclick = () => {
        updateKeyword(index);
    };
}

export function updateKeyword(index) {
    const keyword = document.getElementById('keywordInput').value;
    const color = document.getElementById('colorInput').value;

    if (keyword === '') return;

    let keywords = GM_getValue('keywords', []);
    keywords[index] = { keyword, color };

    GM_setValue('keywords', keywords);
    loadKeywords();
    highlightKeywords(keywords);

    document.getElementById('addButton').textContent = 'Add/Update Keyword';
    document.getElementById('addButton').onclick = addOrUpdateKeyword;
}

export function removeKeyword(index) {
    let keywords = GM_getValue('keywords', []);
    keywords.splice(index, 1);
    GM_setValue('keywords', keywords);
    loadKeywords();
    highlightKeywords(keywords);
}