/**
 * PollVoteX Checklist Generator
 * ===============================
 * Dynamic interactive checklist with progress tracking.
 */
const Checklist = (() => {
    'use strict';
    const STORAGE_KEY = 'pollvotex_checklist';

    function render(items, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';

        // Load saved state
        const saved = Utils.Session.load(STORAGE_KEY) || {};
        items.forEach(item => { if (saved[item.id] !== undefined) item.checked = saved[item.id]; });

        const wrapper = Utils.createElement('div', { className: 'checklist-wrapper' });
        const progressBar = createProgress(items);
        wrapper.appendChild(progressBar);

        // Group by category
        const groups = {};
        items.forEach(item => {
            if (!groups[item.category]) groups[item.category] = [];
            groups[item.category].push(item);
        });

        Object.entries(groups).forEach(([category, categoryItems]) => {
            const group = Utils.createElement('div', { className: 'checklist-group' });
            const heading = Utils.createElement('h4', { className: 'checklist-category' });
            heading.textContent = category;
            group.appendChild(heading);

            categoryItems.forEach((item, idx) => {
                const row = createChecklistItem(item, items, progressBar);
                group.appendChild(row);
                Utils.animateIn(row, idx * 60);
            });
            wrapper.appendChild(group);
        });

        container.appendChild(wrapper);
    }

    function createProgress(items) {
        const checked = items.filter(i => i.checked).length;
        const percent = items.length ? Math.round((checked / items.length) * 100) : 0;

        const bar = Utils.createElement('div', { className: 'checklist-progress' });
        bar.innerHTML = `
            <div class="checklist-progress-header">
                <span>Checklist Progress</span>
                <span class="checklist-count">${checked}/${items.length}</span>
            </div>
            <div class="progress-bar-track">
                <div class="progress-bar-fill checklist-fill" style="width: ${percent}%"></div>
            </div>
        `;
        return bar;
    }

    function createChecklistItem(item, allItems, progressBar) {
        const row = Utils.createElement('label', {
            className: `checklist-item ${item.checked ? 'checked' : ''}`,
            id: `checklist-${item.id}`
        });

        const checkbox = Utils.createElement('input', { type: 'checkbox', 'aria-label': item.text });
        checkbox.checked = item.checked;

        const checkmark = Utils.createElement('span', { className: 'checkmark' });
        const text = Utils.createElement('span', { className: 'checklist-text' });
        text.textContent = item.text;

        checkbox.addEventListener('change', () => {
            item.checked = checkbox.checked;
            row.classList.toggle('checked', item.checked);
            saveState(allItems);
            updateProgress(allItems, progressBar);
        });

        row.appendChild(checkbox);
        row.appendChild(checkmark);
        row.appendChild(text);
        return row;
    }

    function saveState(items) {
        const state = {};
        items.forEach(i => { state[i.id] = i.checked; });
        Utils.Session.save(STORAGE_KEY, state);
    }

    function updateProgress(items, progressBar) {
        const checked = items.filter(i => i.checked).length;
        const percent = items.length ? Math.round((checked / items.length) * 100) : 0;
        const countEl = progressBar.querySelector('.checklist-count');
        const fillEl = progressBar.querySelector('.checklist-fill');
        if (countEl) countEl.textContent = `${checked}/${items.length}`;
        if (fillEl) fillEl.style.width = percent + '%';
    }

    return { render };
})();
