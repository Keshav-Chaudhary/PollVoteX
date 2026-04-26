/**
 * PollVoteX Map & Calendar Services
 * ===================================
 * Leaflet + OpenStreetMap for polling booth visualization.
 * No API key required. Works offline with mock data.
 */
const GoogleServices = (() => {
    'use strict';

    // ── State ────────────────────────────────────────────────────────
    let activeMap = null;
    let userMarker = null;

    // ── Custom Marker Icons ──────────────────────────────────────────
    const BoothIcon = L.divIcon({
        className: 'booth-marker-icon',
        html: '<div class="booth-marker-pin">' +
            '<svg width="28" height="36" viewBox="0 0 28 36" fill="none">' +
            '<path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22c0-7.732-6.268-14-14-14z" fill="#1A73E8"/>' +
            '<circle cx="14" cy="14" r="5" fill="#fff"/>' +
            '</svg></div>',
        iconSize: [28, 36],
        iconAnchor: [14, 36],
        popupAnchor: [0, -36]
    });

    const NearestBoothIcon = L.divIcon({
        className: 'booth-marker-icon nearest',
        html: '<div class="booth-marker-pin nearest">' +
            '<svg width="32" height="40" viewBox="0 0 32 40" fill="none">' +
            '<path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 24 16 24s16-12 16-24c0-8.837-7.163-16-16-16z" fill="#34A853"/>' +
            '<circle cx="16" cy="16" r="6" fill="#fff"/>' +
            '<text x="16" y="20" text-anchor="middle" fill="#34A853" font-size="10" font-weight="700">★</text>' +
            '</svg></div>',
        iconSize: [32, 40],
        iconAnchor: [16, 40],
        popupAnchor: [0, -40]
    });

    const UserLocationIcon = L.divIcon({
        className: 'user-location-icon',
        html: '<div class="user-location-dot"></div><div class="user-location-pulse"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });

    // ── Haversine Distance Calculator ────────────────────────────────
    function calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    // ── OSRM Route Fetcher ─────────────────────────────────────────
    async function fetchRoadRoute(fromLat, fromLng, toLat, toLng) {
        const url = 'https://router.project-osrm.org/route/v1/driving/' +
            fromLng + ',' + fromLat + ';' + toLng + ',' + toLat +
            '?overview=full&geometries=geojson';
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Route service unavailable');
            const data = await response.json();
            if (!data.routes || data.routes.length === 0) throw new Error('No route found');
            const route = data.routes[0];
            return {
                geometry: route.geometry.coordinates.map(c => [c[1], c[0]]), // [lat, lng]
                distance: route.distance / 1000, // km
                duration: Math.round(route.duration / 60) // minutes
            };
        } catch (err) {
            console.warn('OSRM routing failed, falling back to straight line:', err.message);
            return null;
        }
    }

    // ── Maps ─────────────────────────────────────────────────────────
    const Maps = {
        render(containerId, location) {
            const container = document.getElementById(containerId);
            if (!container) return;
            container.innerHTML = '';

            // Always use Leaflet — no Google dependency
            if (typeof L !== 'undefined') {
                this.renderLeafletMap(container, location);
            } else {
                this.renderMockMap(container, location);
            }
        },

        renderLeafletMap(container, location) {
            const mapId = 'leaflet-map-' + Utils.generateId('map');
            const booths = CONFIG.MOCK_BOOTHS[location] || CONFIG.MOCK_BOOTHS['_default'];

            // Create map wrapper with relative positioning for locate button
            const wrapper = Utils.createElement('div', { className: 'leaflet-map-wrapper' });
            const mapDiv = Utils.createElement('div', {
                id: mapId,
                className: 'leaflet-map',
                'aria-label': 'Interactive map showing polling booth locations'
            });
            wrapper.appendChild(mapDiv);
            container.appendChild(wrapper);

            // Determine map center from booth data or fallback to India
            let center = CONFIG.MAP_DEFAULT_CENTER;
            let zoom = CONFIG.MAP_DEFAULT_ZOOM;

            if (booths.length > 0) {
                const avgLat = booths.reduce((sum, b) => sum + b.lat, 0) / booths.length;
                const avgLng = booths.reduce((sum, b) => sum + b.lng, 0) / booths.length;
                center = [avgLat, avgLng];
                zoom = CONFIG.MAP_BOOTH_ZOOM;
            }

            // Initialize Leaflet map
            activeMap = L.map(mapId).setView(center, zoom);

            // Fix: container may be hidden when map initializes; invalidate size once visible
            setTimeout(() => { if (activeMap) activeMap.invalidateSize(); }, 100);
            setTimeout(() => { if (activeMap) activeMap.invalidateSize(); }, 400);

            // Add CARTO Voyager tiles (India-correct borders, no API key)
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 19
            }).addTo(activeMap);

            // Add India boundary overlay to visually ensure correct borders
            fetch('data/india-composite.geojson')
                .then(res => res.json())
                .then(data => {
                    L.geoJSON(data, {
                        style: {
                            color: '#FF9933',   // saffron border vibe 🇮🇳
                            weight: 2,
                            fill: false
                        }
                    }).addTo(activeMap);
                });

            // Add booth markers
            const markerRefs = [];
            booths.forEach((booth, idx) => {
                const marker = L.marker([booth.lat, booth.lng], { icon: BoothIcon })
                    .addTo(activeMap)
                    .bindPopup(
                        '<div class="booth-popup">' +
                        '<h4>' + booth.name + '</h4>' +
                        '<p>' + booth.address + '</p>' +
                        '<p class="booth-coords">' + booth.lat.toFixed(4) + '\u00b0N, ' + booth.lng.toFixed(4) + '\u00b0E</p>' +
                        '</div>'
                    );
                markerRefs.push({ marker, booth, idx });
            });

            // Add "Locate Me" button
            const locateBtn = Utils.createElement('button', {
                className: 'locate-btn',
                'aria-label': 'Find my current location',
                title: 'Find my location'
            });
            locateBtn.innerHTML =
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                '<circle cx="12" cy="12" r="3"/>' +
                '<path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>' +
                '</svg>' +
                '<span>Locate Me</span>';
            wrapper.appendChild(locateBtn);

            locateBtn.addEventListener('click', () => {
                if (!navigator.geolocation) {
                    this.handleLocationError('Geolocation is not supported by your browser', locateBtn);
                    return;
                }
                locateBtn.classList.add('locating');
                locateBtn.innerHTML = '<span class="locate-spinner"></span> Requesting Access...';

                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        try {
                            const userLat = position.coords.latitude;
                            const userLng = position.coords.longitude;

                            // Remove old user marker
                            if (userMarker) activeMap.removeLayer(userMarker);

                            // Add user marker
                            userMarker = L.marker([userLat, userLng], { icon: UserLocationIcon })
                                .addTo(activeMap)
                                .bindPopup('<b>📍 You are here</b>')
                                .openPopup();

                            // Pan to user
                            activeMap.setView([userLat, userLng], 14);

                            // Calculate distances and find nearest
                            let nearestIdx = -1;
                            let minDistance = Infinity;

                            markerRefs.forEach(({ marker, booth, idx }) => {
                                const dist = calculateDistance(userLat, userLng, booth.lat, booth.lng);
                                booth.distance = dist;
                                if (dist < minDistance) {
                                    minDistance = dist;
                                    nearestIdx = idx;
                                }
                            });

                            // Highlight nearest booth and draw real road route
                            if (nearestIdx >= 0) {
                                const nearest = markerRefs[nearestIdx];
                                nearest.marker.setIcon(NearestBoothIcon);
                                nearest.marker.openPopup();

                                // Remove old route layer
                                if (activeMap.userToNearestLine) {
                                    activeMap.removeLayer(activeMap.userToNearestLine);
                                }

                                // Fetch real road route from OSRM
                                fetchRoadRoute(userLat, userLng, nearest.booth.lat, nearest.booth.lng)
                                    .then(route => {
                                        if (route && activeMap) {
                                            activeMap.userToNearestLine = L.polyline(route.geometry, {
                                                color: '#34A853',
                                                weight: 4,
                                                opacity: 0.8,
                                                lineCap: 'round',
                                                lineJoin: 'round'
                                            }).addTo(activeMap);

                                            // Fit map to show full route with padding
                                            activeMap.fitBounds(activeMap.userToNearestLine.getBounds(), {
                                                padding: [40, 40],
                                                maxZoom: 15
                                            });

                                            // Show route distance/duration in nearest popup
                                            nearest.marker.setPopupContent(
                                                '<b>⭐️ ' + nearest.booth.name + '</b><br>' +
                                                '🚗 ' + route.duration + ' min &nbsp;•&nbsp; 🛣️ ' + route.distance.toFixed(1) + ' km'
                                            );
                                            nearest.marker.openPopup();
                                        } else {
                                            // Fallback: straight line
                                            activeMap.userToNearestLine = L.polyline(
                                                [[userLat, userLng], [nearest.booth.lat, nearest.booth.lng]],
                                                { color: '#34A853', weight: 3, opacity: 0.6, dashArray: '8, 6' }
                                            ).addTo(activeMap);
                                        }
                                    })
                                    .catch(() => {
                                        // Fallback
                                        activeMap.userToNearestLine = L.polyline(
                                            [[userLat, userLng], [nearest.booth.lat, nearest.booth.lng]],
                                            { color: '#34A853', weight: 3, opacity: 0.6, dashArray: '8, 6' }
                                        ).addTo(activeMap);
                                    });
                            }

                            // Re-render booth list with distances
                            this.renderBoothList(listContainer, booths, nearestIdx);

                            // Reset button
                            locateBtn.classList.remove('locating');
                            locateBtn.innerHTML =
                                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                                '<circle cx="12" cy="12" r="3"/>' +
                                '<path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>' +
                                '</svg>' +
                                '<span>Update Location</span>';

                            Utils.showToast('📍 Found ' + booths.length + ' booths. Nearest: ' + minDistance.toFixed(1) + ' km away');
                        } catch (err) {
                            console.error('Location processing error:', err);
                            this.handleLocationError('Error processing location data.', locateBtn);
                        }
                    },
                    (error) => {
                        let msg = 'Unable to retrieve location.';
                        switch (error.code) {
                            case 1: // PERMISSION_DENIED
                                msg = 'Location access denied. Please enable it in your browser settings to find booths.';
                                break;
                            case 2: // POSITION_UNAVAILABLE
                                msg = 'Location signal lost. Try moving to a more open area.';
                                break;
                            case 3: // TIMEOUT
                                msg = 'Location request timed out. Please try again.';
                                break;
                            default:
                                msg = 'An unknown location error occurred.';
                                break;
                        }
                        this.handleLocationError(msg, locateBtn);
                    },
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                );
            });

            // Booth list below map
            const listContainer = Utils.createElement('div', { className: 'booth-list' });
            const listTitle = Utils.createElement('h4', { className: 'booth-list-title' });
            listTitle.textContent = 'Polling Booths in ' + location;
            listContainer.appendChild(listTitle);
            container.appendChild(listContainer);

            this.renderBoothList(listContainer, booths, -1);

            // Merged Map Information Overlay
            const unhideBtn = Utils.createElement('button', {
                className: 'map-info-unhide hidden',
                'aria-label': 'Show map information',
                title: 'Show map information'
            });
            unhideBtn.innerHTML = '<span>ℹ️</span>';
            wrapper.appendChild(unhideBtn);

            const infoOverlay = Utils.createElement('div', { className: 'map-info-overlay' });
            infoOverlay.innerHTML =
                '<button class="map-info-close" aria-label="Close info overlay" title="Hide info">' +
                '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
                '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>' +
                '</svg>' +
                '</button>' +
                '<div class="map-info-header">🗺️ OpenStreetMap via CARTO — India borders correct</div>' +
                '<div class="map-info-divider"></div>' +
                '<div class="map-india-notice-content">' +
                '<span class="india-notice-icon">🇮🇳</span>' +
                '<span class="india-notice-text">' +
                '<strong>Official India Boundary:</strong> The saffron outline (#FF9933) represents the ' +
                'territorial boundary of India as officially depicted by the Government of India. ' +
                'This overlay ensures correct representation of India\'s borders on the map.' +
                '</span>' +
                '</div>';
            wrapper.appendChild(infoOverlay);

            // Toggle Logic
            const closeBtn = infoOverlay.querySelector('.map-info-close');
            closeBtn.addEventListener('click', () => {
                infoOverlay.classList.add('hidden');
                unhideBtn.classList.remove('hidden');
            });
            unhideBtn.addEventListener('click', () => {
                infoOverlay.classList.remove('hidden');
                unhideBtn.classList.add('hidden');
            });

            // Accessibility: allow Escape to close popups
            mapDiv.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && activeMap) activeMap.closePopup();
            });
        },

        /**
         * Helper to reset locate button and show error feedback
         */
        handleLocationError(message, btn) {
            btn.classList.remove('locating');
            btn.classList.add('btn-error-shake');
            btn.innerHTML =
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                '<circle cx="12" cy="12" r="3"/>' +
                '<path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>' +
                '</svg>' +
                '<span>Locate Me</span>';
            
            Utils.showToast(message);
            
            // Remove shake class after animation
            setTimeout(() => {
                btn.classList.remove('btn-error-shake');
            }, 500);
        },

        renderBoothList(container, booths, nearestIdx) {
            // Remove existing cards (keep title)
            const existing = container.querySelectorAll('.booth-card');
            existing.forEach(el => el.remove());

            // Sort by distance if available
            const sorted = [...booths].map((b, i) => ({ ...b, originalIdx: i }));
            if (sorted[0]?.distance !== undefined) {
                sorted.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
            }

            sorted.forEach((booth, idx) => {
                const isNearest = booth.originalIdx === nearestIdx;
                const card = Utils.createElement('div', {
                    className: 'booth-card' + (isNearest ? ' nearest' : '')
                });

                let distanceHtml = '';
                if (booth.distance !== undefined) {
                    distanceHtml = '<span class="distance-badge">' + booth.distance.toFixed(1) + ' km away</span>';
                }

                let nearestBadge = '';
                if (isNearest) {
                    nearestBadge = '<span class="nearest-badge">⭐ Nearest Booth</span>';
                }

                card.innerHTML =
                    '<div class="booth-icon">🏫</div>' +
                    '<div class="booth-info">' +
                    '<h5 class="booth-name">' + booth.name + '</h5>' +
                    '<p class="booth-address">' + booth.address + '</p>' +
                    '<p class="booth-coords">' + booth.lat.toFixed(4) + '\u00b0N, ' + booth.lng.toFixed(4) + '\u00b0E ' + distanceHtml + '</p>' +
                    nearestBadge +
                    '</div>' +
                    '<a href="https://www.openstreetmap.org/directions?from=&to=' + booth.lat + '%2C' + booth.lng + '"' +
                    ' target="_blank" rel="noopener" class="booth-directions-btn" aria-label="Get directions to ' + booth.name + '">' +
                    'Directions ↗' +
                    '</a>';
                container.appendChild(card);
                Utils.animateIn(card, idx * 80);
            });
        },

        renderMockMap(container, location) {
            const booths = CONFIG.MOCK_BOOTHS[location] || CONFIG.MOCK_BOOTHS['_default'];
            const wrapper = Utils.createElement('div', { className: 'mock-map-wrapper' });

            // Mock map visual
            const mapVisual = Utils.createElement('div', { className: 'mock-map' });
            let pinsHtml = '';
            booths.forEach((b, i) => {
                pinsHtml += '<div class="mock-pin" style="top: ' + (25 + i * 22) + '%; left: ' + (20 + i * 25) + '%;" title="' + b.name + '">' +
                    '<div class="pin-marker">📍</div>' +
                    '<div class="pin-tooltip">' + b.name + '</div>' +
                    '</div>';
            });
            mapVisual.innerHTML =
                '<div class="mock-map-bg">' +
                '<div class="mock-map-grid"></div>' +
                '<div class="mock-map-label">' +
                '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A73E8" stroke-width="2">' +
                '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>' +
                '<circle cx="12" cy="10" r="3"></circle>' +
                '</svg>' +
                '<span>' + location + '</span>' +
                '</div>' +
                pinsHtml +
                '<div class="mock-map-badge">🗺️ Mock Map — Demo Mode</div>' +
                '</div>';
            wrapper.appendChild(mapVisual);

            // Booth list
            const list = Utils.createElement('div', { className: 'booth-list' });
            const listTitle = Utils.createElement('h4', { className: 'booth-list-title' });
            listTitle.textContent = 'Polling Booths in ' + location;
            list.appendChild(listTitle);

            booths.forEach((booth, idx) => {
                const card = Utils.createElement('div', { className: 'booth-card' });
                card.innerHTML =
                    '<div class="booth-icon">🏫</div>' +
                    '<div class="booth-info">' +
                    '<h5 class="booth-name">' + booth.name + '</h5>' +
                    '<p class="booth-address">' + booth.address + '</p>' +
                    '<p class="booth-coords">Coordinates: ' + booth.lat.toFixed(4) + '\u00b0N, ' + booth.lng.toFixed(4) + '\u00b0E</p>' +
                    '</div>' +
                    '<a href="https://www.openstreetmap.org/directions?to=' + booth.lat + '%2C' + booth.lng + '"' +
                    ' target="_blank" rel="noopener" class="booth-directions-btn" aria-label="Get directions to ' + booth.name + '">' +
                    'Directions ↗' +
                    '</a>';
                list.appendChild(card);
                Utils.animateIn(card, idx * 100);
            });

            wrapper.appendChild(list);

            // API mode notice
            const notice = Utils.createElement('div', { className: 'api-notice' });
            notice.innerHTML = '🔧 <strong>Demo Mode:</strong> Leaflet library not loaded. Using simulated map data.';
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
        btn.innerHTML = '<span class="reminder-icon">📅</span><span>' + label + '</span><span class="reminder-date">' + Utils.formatDate(date) + '</span>';

        btn.addEventListener('click', () => {
            if (CONFIG.GOOGLE_CALENDAR_ENABLED) {
                openGoogleCalendar(date, title, description);
            }
            // Visual feedback
            showMockCalendarConfirm(btn, date, title);
        });
        return btn;
    }

    function openGoogleCalendar(date, title, description) {
        const startDate = date.replace(/-/g, '');
        const endDate = startDate; // All-day event
        const url = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(title) + '&dates=' + startDate + '/' + endDate + '&details=' + encodeURIComponent(description) + '&sf=true';
        window.open(url, '_blank', 'noopener');
    }

    function showMockCalendarConfirm(btn, date, title) {
        // Track state directly on button to avoid closure issues
        if (btn._isConfirming) return;
        btn._isConfirming = true;

        const originalHTML = btn.innerHTML;
        btn.classList.add('reminder-confirmed');
        btn.innerHTML = '<span class="reminder-icon">✅</span><span>Added to Calendar</span>';

        // Show toast
        showToast('📅 "' + title + '" added for ' + Utils.formatDate(date));

        setTimeout(() => {
            btn._isConfirming = false;
            btn.classList.remove('reminder-confirmed');
            if (btn.isConnected) {
                btn.innerHTML = originalHTML;
            }
        }, 2000);
    }


    return { Maps, Calendar };
})();
