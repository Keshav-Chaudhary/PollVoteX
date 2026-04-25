/**
 * PollVoteX Google Services
 * ==========================
 * Mock + Real API toggle for Google Maps and Google Calendar.
 * Controlled by CONFIG.USE_REAL_APIS flag in config.js.
 */
const GoogleServices = (() => {
    'use strict';

    // ── Google Maps ──────────────────────────────────────────────────
    const Maps = {
        render(containerId, location) {
            const container = document.getElementById(containerId);
            if (!container) return;
            container.innerHTML = '';

            if (CONFIG.USE_REAL_APIS && CONFIG.GOOGLE_MAPS_API_KEY) {
                this.renderRealMap(container, location);
            } else {
                this.renderMockMap(container, location);
            }
        },

        renderRealMap(container, location) {
            // Real Google Maps Embed API
            const iframe = Utils.createElement('iframe', {
                src: `https://www.google.com/maps/embed/v1/search?key=${CONFIG.GOOGLE_MAPS_API_KEY}&q=polling+booth+near+${encodeURIComponent(location)}`,
                className: 'google-map-iframe',
                'aria-label': 'Google Maps showing polling booths',
                loading: 'lazy',
                allowfullscreen: ''
            });
            container.appendChild(iframe);
        },

        renderMockMap(container, location) {
            const booths = CONFIG.MOCK_BOOTHS[location] || CONFIG.MOCK_BOOTHS['_default'];
            const wrapper = Utils.createElement('div', { className: 'mock-map-wrapper' });

            // Mock map visual
            const mapVisual = Utils.createElement('div', { className: 'mock-map' });
            mapVisual.innerHTML = `
                <div class="mock-map-bg">
                    <div class="mock-map-grid"></div>
                    <div class="mock-map-label">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A73E8" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <span>${location}</span>
                    </div>
                    ${booths.map((b, i) => `
                        <div class="mock-pin" style="top: ${25 + (i * 22)}%; left: ${20 + (i * 25)}%;" title="${b.name}">
                            <div class="pin-marker">📍</div>
                            <div class="pin-tooltip">${b.name}</div>
                        </div>
                    `).join('')}
                    <div class="mock-map-badge">🗺️ Mock Map — Demo Mode</div>
                </div>
            `;
            wrapper.appendChild(mapVisual);

            // Booth list
            const list = Utils.createElement('div', { className: 'booth-list' });
            const listTitle = Utils.createElement('h4', { className: 'booth-list-title' });
            listTitle.textContent = `Polling Booths in ${location}`;
            list.appendChild(listTitle);

            booths.forEach((booth, idx) => {
                const card = Utils.createElement('div', { className: 'booth-card' });
                card.innerHTML = `
                    <div class="booth-icon">🏫</div>
                    <div class="booth-info">
                        <h5 class="booth-name">${booth.name}</h5>
                        <p class="booth-address">${booth.address}</p>
                        <p class="booth-coords">Coordinates: ${booth.lat.toFixed(4)}°N, ${booth.lng.toFixed(4)}°E</p>
                    </div>
                    <a href="https://www.google.com/maps/search/${encodeURIComponent(booth.name + ' ' + booth.address)}" 
                       target="_blank" rel="noopener" class="booth-directions-btn" aria-label="Get directions to ${booth.name}">
                        Directions ↗
                    </a>
                `;
                list.appendChild(card);
                Utils.animateIn(card, idx * 100);
            });

            wrapper.appendChild(list);

            // API mode notice
            const notice = Utils.createElement('div', { className: 'api-notice' });
            notice.innerHTML = '🔧 <strong>Demo Mode:</strong> Using simulated map data. Set <code>CONFIG.USE_REAL_APIS = true</code> and add your Google Maps API key to enable real maps.';
            wrapper.appendChild(notice);

            container.appendChild(wrapper);
        }
    };

    // ── Google Calendar ──────────────────────────────────────────────
    const Calendar = {
        render(containerId) {
            const container = document.getElementById(containerId);
            if (!container) return;

            const wrapper = Utils.createElement('div', { className: 'calendar-wrapper' });

            const title = Utils.createElement('h3', { className: 'calendar-title' });
            title.innerHTML = '📅 Set Voting Reminders';

            const desc = Utils.createElement('p', { className: 'calendar-desc' });
            desc.textContent = 'Never miss important election dates. Add reminders to your calendar.';

            wrapper.appendChild(title);
            wrapper.appendChild(desc);

            const buttons = Utils.createElement('div', { className: 'calendar-buttons' });

            // Voting Day Reminder
            const voteBtn = createReminderButton(
                '🗳️ Voting Day Reminder',
                CONFIG.ELECTION_DATE,
                CONFIG.ELECTION_NAME,
                'Remember to vote today! Carry your Voter ID and visit your assigned polling booth. Polling hours: 7 AM - 6 PM.',
                'vote-reminder-btn'
            );
            buttons.appendChild(voteBtn);

            // Registration Deadline
            const regBtn = createReminderButton(
                '📝 Registration Deadline',
                CONFIG.REGISTRATION_DEADLINE,
                'Voter Registration Deadline',
                'Last date to submit voter registration application. Visit nvsp.in or your local ERO office.',
                'reg-reminder-btn'
            );
            buttons.appendChild(regBtn);

            wrapper.appendChild(buttons);
            container.appendChild(wrapper);
        }
    };

    function createReminderButton(label, date, title, description, id) {
        const btn = Utils.createElement('button', {
            className: 'reminder-btn',
            id: id,
            'aria-label': label
        });
        btn.innerHTML = `<span class="reminder-icon">📅</span><span>${label}</span><span class="reminder-date">${Utils.formatDate(date)}</span>`;

        btn.addEventListener('click', () => {
            if (CONFIG.USE_REAL_APIS) {
                openGoogleCalendar(date, title, description);
            } else {
                showMockCalendarConfirm(btn, date, title, description);
            }
        });
        return btn;
    }

    function openGoogleCalendar(date, title, description) {
        const startDate = date.replace(/-/g, '');
        const endDate = startDate; // All-day event
        const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(description)}&sf=true`;
        window.open(url, '_blank', 'noopener');
    }

    function showMockCalendarConfirm(btn, date, title, description) {
        // Check if already showing confirmation
        if (btn.classList.contains('reminder-confirmed')) return;

        btn.classList.add('reminder-confirmed');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = `<span class="reminder-icon">✅</span><span>Reminder Set! (Demo Mode)</span>`;

        // Show toast
        showToast(`📅 Reminder "${title}" set for ${Utils.formatDate(date)} — In real mode, this opens Google Calendar.`);

        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.classList.remove('reminder-confirmed');
        }, 3000);
    }

    function showToast(message) {
        let toast = document.getElementById('pvx-toast');
        if (!toast) {
            toast = Utils.createElement('div', { className: 'toast', id: 'pvx-toast' });
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add('toast-show');
        setTimeout(() => toast.classList.remove('toast-show'), 4000);
    }

    return { Maps, Calendar };
})();
