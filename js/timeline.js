/**
 * PollVoteX Timeline Engine
 * ==========================
 * Displays election milestones in a vertical timeline.
 */
const Timeline = (() => {
    'use strict';

    function render(events, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';

        const timeline = Utils.createElement('div', { className: 'timeline' });

        events.forEach((event, index) => {
            const node = createTimelineNode(event, index);
            timeline.appendChild(node);
            Utils.animateIn(node, index * 120);
        });

        container.appendChild(timeline);
    }

    function createTimelineNode(event, index) {
        const isPast = event.isPast;
        const isHighlight = event.highlight;
        const classes = ['timeline-node'];
        if (isPast) classes.push('timeline-past');
        if (isHighlight) classes.push('timeline-highlight');

        const node = Utils.createElement('div', {
            className: classes.join(' '),
            id: `timeline-${index}`
        });

        // Dot
        const dot = Utils.createElement('div', { className: 'timeline-dot' });
        dot.innerHTML = event.icon;
        node.appendChild(dot);

        // Line connector
        const line = Utils.createElement('div', { className: 'timeline-line' });
        node.appendChild(line);

        // Content
        const content = Utils.createElement('div', { className: 'timeline-content' });

        const dateEl = Utils.createElement('div', { className: 'timeline-date' });
        const formattedDate = Utils.formatDate(event.date);
        const daysText = event.daysAway > 0 ? `${event.daysAway} days away` :
                         event.daysAway === 0 ? 'Today!' : `${Math.abs(event.daysAway)} days ago`;
        dateEl.innerHTML = `<span class="date-text">${formattedDate}</span><span class="days-badge ${event.daysAway <= 0 ? 'past' : event.daysAway <= 30 ? 'soon' : ''}">${daysText}</span>`;

        const titleEl = Utils.createElement('h4', { className: 'timeline-title' });
        titleEl.textContent = event.title;

        const descEl = Utils.createElement('p', { className: 'timeline-desc' });
        descEl.textContent = event.description;

        content.appendChild(dateEl);
        content.appendChild(titleEl);
        content.appendChild(descEl);
        node.appendChild(content);

        return node;
    }

    return { render };
})();
