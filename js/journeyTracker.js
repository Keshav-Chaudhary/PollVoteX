/**
 * PollVoteX Journey Tracker
 * ==========================
 * Visual step-by-step navigator component.
 */
const JourneyTracker = (() => {
    'use strict';

    function render(steps, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';

        const tracker = Utils.createElement('div', { className: 'journey-tracker' });
        const progressBar = createProgressBar(steps);
        tracker.appendChild(progressBar);

        const stepsContainer = Utils.createElement('div', { className: 'journey-steps' });
        steps.forEach((step, index) => {
            const stepEl = createStepCard(step, index, steps.length);
            stepsContainer.appendChild(stepEl);
            Utils.animateIn(stepEl, index * 100);
        });
        tracker.appendChild(stepsContainer);
        container.appendChild(tracker);
    }

    function createProgressBar(steps) {
        const completed = steps.filter(s => s.status === 'completed').length;
        const active = steps.filter(s => s.status === 'active').length;
        const percent = Math.round(((completed + active * 0.5) / steps.length) * 100);

        const wrapper = Utils.createElement('div', { className: 'progress-wrapper' });
        const label = Utils.createElement('div', { className: 'progress-label' });
        label.innerHTML = `<span>Your Progress</span><span class="progress-percent">${percent}%</span>`;
        wrapper.appendChild(label);

        const bar = Utils.createElement('div', { className: 'journey-progress' });
        const fill = Utils.createElement('div', { className: 'journey-progress-fill' });
        fill.style.width = '0%';
        bar.appendChild(fill);
        wrapper.appendChild(bar);

        // Animate fill
        setTimeout(() => { fill.style.width = percent + '%'; }, 100);
        return wrapper;
    }

    function createStepCard(step, index, total) {
        const card = Utils.createElement('div', {
            className: `step-card step-${step.status}`,
            id: `step-${step.id}`,
            role: 'button',
            tabindex: '0',
            'aria-label': `Step ${index + 1} of ${total}: ${step.title} - ${step.status}`
        });

        // Header row: circle + text + badge
        const header = Utils.createElement('div', { className: 'step-header' });

        // Numbered circle
        const circle = Utils.createElement('div', { className: `step-icon step-icon-${step.status}` });
        circle.textContent = step.status === 'completed' ? '\u2713' : (index + 1);

        // Text block
        const textGroup = Utils.createElement('div', { className: 'step-text-group' });

        const stepLabel = Utils.createElement('div', { className: 'step-number' });
        stepLabel.textContent = `Step ${index + 1}`;

        const titleEl = Utils.createElement('h3', { className: 'step-title' });
        titleEl.textContent = step.title;

        const descEl = Utils.createElement('p', { className: 'step-description' });
        descEl.textContent = step.description;

        textGroup.appendChild(stepLabel);
        textGroup.appendChild(titleEl);
        textGroup.appendChild(descEl);

        // Status badge
        const statusBadge = Utils.createElement('span', { className: `status-badge status-${step.status}` });
        statusBadge.textContent = step.status.charAt(0).toUpperCase() + step.status.slice(1);

        header.appendChild(circle);
        header.appendChild(textGroup);
        header.appendChild(statusBadge);
        card.appendChild(header);

        // Expandable detail (starts hidden — no .expanded class)
        const detail = Utils.createElement('div', { className: 'step-detail' });
        detail.innerHTML = `<p>${step.detail}</p>`;
        card.appendChild(detail);

        // Toggle detail on click
        card.addEventListener('click', () => toggleDetail(card, detail));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleDetail(card, detail);
            }
        });

        return card;
    }

    function toggleDetail(card, detail) {
        const isOpen = detail.classList.contains('expanded');
        // Close all others first
        document.querySelectorAll('.step-detail').forEach(d => d.classList.remove('expanded'));
        document.querySelectorAll('.step-card').forEach(c => c.classList.remove('expanded'));
        if (!isOpen) {
            detail.classList.add('expanded');
            card.classList.add('expanded');
        }
    }

    return { render };
})();
