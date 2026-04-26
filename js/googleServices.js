/**
 * PollVoteX Map & Calendar Services
 * ===================================
 * Leaflet + OpenStreetMap for polling booth visualization.
 * Firebase Analytics for usage tracking.
 * Google Calendar URL integration for election reminders.
 * No paid API key required. Works offline with mock data.
 *
 * @module GoogleServices
 */
const GoogleServices = (() => {
    'use strict';

    // ── Firebase Analytics ───────────────────────────────────────────

    /**
     * Initializes Firebase Analytics using the compat SDK loaded via CDN.
     * Falls back silently if SDK is unavailable or config is missing.
     */
    function initFirebaseAnalytics() {
        try {
            if (typeof firebase === 'undefined') return;
            if (!CONFIG.FIREBASE_CONFIG || !CONFIG.FIREBASE_CONFIG.projectId) return;

            // Only initialize once
            if (!firebase.apps.length) {
                firebase.initializeApp(CONFIG.FIREBASE_CONFIG);
            }

            if (CONFIG.FIREBASE_ANALYTICS_ENABLED && firebase.analytics) {
                const analytics = firebase.analytics();
                analytics.logEvent('app_open', {
                    app_name: 'PollVoteX',
                    version: '1.0.0'
                });
                console.info('🔥 Firebase Analytics initialized');
            }
        } catch (err) {
            // Non-critical — analytics failure must never break the app
            console.warn('Firebase Analytics init skipped:', err.message);
        }
    }

    /**
     * Logs a named analytics event with optional parameters.
     * Safe to call even if Firebase is not initialized.
     *
     * @param {string} eventName - Firebase Analytics event name.
     * @param {Object} [params={}] - Optional event parameters.
     */
    function logEvent(eventName, params = {}) {
        try {
            if (typeof firebase !== 'undefined' && firebase.apps.length && firebase.analytics) {
                firebase.analytics().logEvent(eventName, params);
            }
        } catch (err) {
            // Silently swallow analytics errors
        }
    }

    // ── State ────────────────────────────────────────────────────────
    let activeMap = null;
    let userMarker = null;

    // ── Custom Marker Icons ──────────────────────────────────────────

    /** @type {L.DivIcon} Standard polling booth map marker */
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

    /** @type {L.DivIcon} Highlighted marker for the nearest polling booth */
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

    /** @type {L.DivIcon} Pulsing marker for the user's current location */
    const UserLocationIcon = L.divIcon({
        className: 'user-location-icon',
        html: '<div class="user-location-dot"></div><div class="user-location-pulse"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });

    // ── Haversine Distance Calculator ────────────────────────────────

    /**
     * Calculates the great-circle distance between two coordinates using
     * the Haversine formula.
     *
     * @param {number} lat1 - Latitude of point A in decimal degrees.
     * @param {number} lng1 - Longitude of point A in decimal degrees.
     * @param {number} lat2 - Latitude of point B in decimal degrees.
     * @param {number} lng2 - Longitude of point B in decimal degrees.
     * @returns {number} Distance in kilometres.
     */
    function calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    // ── OSRM Route Fetcher ────────────────────────────────────────────

    /**
     * Fetches a real road route between two coordinates using the
     * OSRM public routing API.
     *
     * @param {number} fromLat - Origin latitude.
     * @param {number} fromLng - Origin longitude.
     * @param {number} toLat - Destination latitude.
     * @param {number} toLng - Destination longitude.
     * @returns {Promise<{geometry: number[][], distance: number, duration: number}|null>}
     *   Resolved route object or null on failure.
     */
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
                geometry: route.geometry.coordinates.map(c => [c[1], c[0]]),
                distance: route.distance / 1000,
                duration: Math.round(route.duration / 60)
            };
        } catch (err) {
            console.warn('OSRM routing failed, falling back to straight line:', err.message);
            return null;
        }
    }

    // ── Google Maps API Integration ───────────────────────────────────

    /**
     * Fetches a driving route using the Google Maps Directions API.
     * Only called when USE_REAL_APIS is true and the google SDK is loaded.
     *
     * @param {number} fromLat - Origin latitude.
     * @param {number} fromLng - Origin longitude.
     * @param {number} toLat - Destination latitude.
     * @param {number} toLng - Destination longitude.
     * @returns {Promise<{geometry: number[][], distance: number, duration: number}|null>}
     */
    async function fetchGoogleRoute(fromLat, fromLng, toLat, toLng) {
        if (typeof google === 'undefined' || !google.maps) return null;
        const directionsService = new google.maps.DirectionsService();

        return new Promise((resolve) => {
            directionsService.route({
                origin: new google.maps.LatLng(fromLat, fromLng),
                destination: new google.maps.LatLng(toLat, toLng),
                travelMode: google.maps.TravelMode.DRIVING,
            }, (result, status) => {
                if (status === 'OK') {
                    const route = result.routes[0].legs[0];
                    resolve({
                        geometry: result.routes[0].overview_path.map(p => [p.lat(), p.lng()]),
                        distance: route.distance.value / 1000,
                        duration: Math.round(route.duration.value / 60)
                    });
                } else {
                    resolve(null);
                }
            });
        });
    }

    // ── Maps ──────────────────────────────────────────────────────────

    /**
     * Map rendering module. Chooses between Google Maps, Leaflet/OSM,
     * or a static mock based on API availability.
     *
     * @namespace Maps
     */
    const Maps = {

        /**
         * Renders the appropriate map variant into a DOM container.
         *
         * @param {string} containerId - ID of the target DOM element.
         * @param {string} location - Indian state name used to look up booth data.
         */
        render(containerId, location) {
            const container = document.getElementById(containerId);
            if (!container) return;
            container.innerHTML = '';

            logEvent('map_viewed', { location });

            if (CONFIG.USE_REAL_APIS && typeof google !== 'undefined') {
                this.renderGoogleMap(container, location);
            } else if (typeof L !== 'undefined') {
                this.renderLeafletMap(container, location);
            } else {
                this.renderMockMap(container, location);
            }
        },

        /**
         * Renders a Google Maps instance with booth markers.
         * Only called when USE_REAL_APIS is true.
         *
         * @param {HTMLElement} container - DOM element to render into.
         * @param {string} location - State name for booth lookup.
         */
        renderGoogleMap(container, location) {
            const mapId = 'google-map-' + Utils.generateId('map');
            const booths = CONFIG.MOCK_BOOTHS[location] || CONFIG.MOCK_BOOTHS['_default'];

            const mapDiv = Utils.createElement('div', {
                id: mapId,
                className: 'google-map-element',
                style: 'height: 400px; width: 100%; border-radius: 12px;'
            });
            container.appendChild(mapDiv);

            const map = new google.maps.Map(mapDiv, {
                center: { lat: CONFIG.MAP_DEFAULT_CENTER[0], lng: CONFIG.MAP_DEFAULT_CENTER[1] },
                zoom: CONFIG.MAP_DEFAULT_CENTER,
                mapId: 'POLLVOTEX_MAP_ID'
            });

            booths.forEach(booth => {
                new google.maps.Marker({
                    position: { lat: booth.lat, lng: booth.lng },
                    map: map,
                    title: booth.name,
                    animation: google.maps.Animation.DROP
                });
            });

            const listContainer = Utils.createElement('div', { className: 'booth-list' });
            container.appendChild(listContainer);
            this.renderBoothList(listContainer, booths, -1);
        },

        /**
         * Renders a Leaflet/OpenStreetMap instance with real geolocation,
         * OSRM routing, and India boundary GeoJSON overlay.
         *
         * @param {HTMLElement} container - DOM element to render into.
         * @param {string} location - State name for booth lookup.
         */
        renderLeafletMap(container, location) {
            const mapId = 'leaflet-map-' + Utils.generateId('map');
            const booths = CONFIG.MOCK_BOOTHS[location] || CONFIG.MOCK_BOOTHS['_default'];

            const wrapper = Utils.createElement('div', { className: 'leaflet-map-wrapper' });
            const mapDiv = Utils.createElement('div', {
                id: mapId,
                className: 'leaflet-map',
                'aria-label': 'Interactive map showing polling booth locations'
            });
            wrapper.appendChild(mapDiv);
            container.appendChild(wrapper);

            let center = CONFIG.MAP_DEFAULT_CENTER;
            let zoom = CONFIG.MAP_DEFAULT_ZOOM;

            if (booths.length > 0) {
                const avgLat = booths.reduce((sum, b) => sum + b.lat, 0) / booths.length;
                const avgLng = booths.reduce((sum, b) => sum + b.lng, 0) / booths.length;
                center = [avgLat, avgLng];
                zoom = CONFIG.MAP_BOOTH_ZOOM;
            }

            activeMap = L.map(mapId).setView(center, zoom);
            setTimeout(() => { if (activeMap) activeMap.invalidateSize(); }, 100);
            setTimeout(() => { if (activeMap) activeMap.invalidateSize(); }, 400);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 19
            }).addTo(activeMap);

            fetch('data/india-composite.geojson')
                .then(res => res.json())
                .then(data => {
                    L.geoJSON(data, {
                        style: { color: '#FF9933', weight: 2, fill: false }
                    }).addTo(activeMap);
                })
                .catch(() => {/* GeoJSON overlay is decorative — safe to skip */});

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

            // ── Locate Me Button ─────────────────────────────────────
            const locateBtn = Utils.createElement('button', {
                className: 'locate-btn',
                'aria-label': 'Find my current location',
                title: 'Find my location'
            });
            locateBtn.innerHTML =
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                '<circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>' +
                '</svg><span>Locate Me</span>';
            wrapper.appendChild(locateBtn);

            locateBtn.addEventListener('click', () => {
                if (!navigator.geolocation) {
                    this.handleLocationError('Geolocation is not supported by your browser', locateBtn);
                    return;
                }
                locateBtn.classList.add('locating');
                locateBtn.innerHTML = '<span class="locate-spinner"></span> Requesting Access...';
                logEvent('locate_me_clicked', { location });

                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        try {
                            const userLat = position.coords.latitude;
                            const userLng = position.coords.longitude;

                            if (userMarker) activeMap.removeLayer(userMarker);

                            userMarker = L.marker([userLat, userLng], { icon: UserLocationIcon })
                                .addTo(activeMap)
                                .bindPopup('<b>📍 You are here</b>')
                                .openPopup();

                            activeMap.setView([userLat, userLng], 14);

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

                            if (nearestIdx >= 0) {
                                const nearest = markerRefs[nearestIdx];
                                nearest.marker.setIcon(NearestBoothIcon);
                                nearest.marker.openPopup();

                                if (activeMap.userToNearestLine) {
                                    activeMap.removeLayer(activeMap.userToNearestLine);
                                }

                                fetchRoadRoute(userLat, userLng, nearest.booth.lat, nearest.booth.lng)
                                    .then(route => {
                                        if (route && activeMap) {
                                            activeMap.userToNearestLine = L.polyline(route.geometry, {
                                                color: '#34A853', weight: 4, opacity: 0.8,
                                                lineCap: 'round', lineJoin: 'round'
                                            }).addTo(activeMap);

                                            activeMap.fitBounds(activeMap.userToNearestLine.getBounds(), {
                                                padding: [40, 40], maxZoom: 15
                                            });

                                            nearest.marker.setPopupContent(
                                                '<b>⭐️ ' + nearest.booth.name + '</b><br>' +
                                                '🚗 ' + route.duration + ' min &nbsp;•&nbsp; 🛣️ ' + route.distance.toFixed(1) + ' km'
                                            );
                                            nearest.marker.openPopup();

                                            logEvent('route_calculated', {
                                                distance_km: route.distance.toFixed(1),
                                                duration_min: route.duration
                                            });
                                        } else {
                                            activeMap.userToNearestLine = L.polyline(
                                                [[userLat, userLng], [nearest.booth.lat, nearest.booth.lng]],
                                                { color: '#34A853', weight: 3, opacity: 0.6, dashArray: '8, 6' }
                                            ).addTo(activeMap);
                                        }
                                    })
                                    .catch(() => {
                                        activeMap.userToNearestLine = L.polyline(
                                            [[userLat, userLng], [nearest.booth.lat, nearest.booth.lng]],
                                            { color: '#34A853', weight: 3, opacity: 0.6, dashArray: '8, 6' }
                                        ).addTo(activeMap);
                                    });
                            }

                            this.renderBoothList(listContainer, booths, nearestIdx);

                            locateBtn.classList.remove('locating');
                            locateBtn.innerHTML =
                                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                                '<circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>' +
                                '</svg><span>Update Location</span>';

                            Utils.showToast('📍 Found ' + booths.length + ' booths. Nearest: ' + minDistance.toFixed(1) + ' km away');
                        } catch (err) {
                            console.error('Location processing error:', err);
                            this.handleLocationError('Error processing location data.', locateBtn);
                        }
                    },
                    (error) => {
                        const messages = {
                            1: 'Location access denied. Please enable it in your browser settings.',
                            2: 'Location signal lost. Try moving to a more open area.',
                            3: 'Location request timed out. Please try again.'
                        };
                        this.handleLocationError(messages[error.code] || 'An unknown location error occurred.', locateBtn);
                    },
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                );
            });

            // ── Booth List ────────────────────────────────────────────
            const listContainer = Utils.createElement('div', { className: 'booth-list' });
            const listTitle = Utils.createElement('h4', { className: 'booth-list-title' });
            listTitle.textContent = 'Polling Booths in ' + location;
            listContainer.appendChild(listTitle);
            container.appendChild(listContainer);
            this.renderBoothList(listContainer, booths, -1);

            // ── Map Info Overlay ──────────────────────────────────────
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
                '</svg></button>' +
                '<div class="map-info-header">🗺️ OpenStreetMap via CARTO — India borders correct</div>' +
                '<div class="map-info-divider"></div>' +
                '<div class="map-india-notice-content">' +
                '<span class="india-notice-icon">🇮🇳</span>' +
                '<span class="india-notice-text"><strong>Official India Boundary:</strong> The saffron outline (#FF9933) represents the territorial boundary of India as officially depicted by the Government of India.</span>' +
                '</div>';
            wrapper.appendChild(infoOverlay);

            infoOverlay.querySelector('.map-info-close').addEventListener('click', () => {
                infoOverlay.classList.add('hidden');
                unhideBtn.classList.remove('hidden');
            });
            unhideBtn.addEventListener('click', () => {
                infoOverlay.classList.remove('hidden');
                unhideBtn.classList.add('hidden');
            });

            mapDiv.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && activeMap) activeMap.closePopup();
            });
        },

        /**
         * Resets the locate button state and shows an error toast.
         *
         * @param {string} message - Error message to display.
         * @param {HTMLButtonElement} btn - The locate button element.
         */
        handleLocationError(message, btn) {
            btn.classList.remove('locating');
            btn.classList.add('btn-error-shake');
            btn.innerHTML =
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                '<circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>' +
                '</svg><span>Locate Me</span>';
            Utils.showToast(message);
            setTimeout(() => btn.classList.remove('btn-error-shake'), 500);
        },

        /**
         * Renders sorted booth cards inside a list container.
         *
         * @param {HTMLElement} container - Target container element.
         * @param {Array<Object>} booths - Array of booth objects (may include .distance).
         * @param {number} nearestIdx - Index of the nearest booth (or -1 if unknown).
         */
        renderBoothList(container, booths, nearestIdx) {
            container.querySelectorAll('.booth-card').forEach(el => el.remove());

            const sorted = [...booths].map((b, i) => ({ ...b, originalIdx: i }));
            if (sorted[0]?.distance !== undefined) {
                sorted.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
            }

            sorted.forEach((booth, idx) => {
                const isNearest = booth.originalIdx === nearestIdx;
                const card = Utils.createElement('div', {
                    className: 'booth-card' + (isNearest ? ' nearest' : '')
                });

                const distanceHtml = booth.distance !== undefined
                    ? '<span class="distance-badge">' + booth.distance.toFixed(1) + ' km away</span>'
                    : '';

                const nearestBadge = isNearest
                    ? '<span class="nearest-badge">⭐ Nearest Booth</span>'
                    : '';

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
                    'Directions ↗</a>';
                container.appendChild(card);
                Utils.animateIn(card, idx * 80);
            });
        },

        /**
         * Renders a static mock map when Leaflet is not available.
         *
         * @param {HTMLElement} container - Target container element.
         * @param {string} location - State name for booth lookup.
         */
        renderMockMap(container, location) {
            const booths = CONFIG.MOCK_BOOTHS[location] || CONFIG.MOCK_BOOTHS['_default'];
            const wrapper = Utils.createElement('div', { className: 'mock-map-wrapper' });
            const mapVisual = Utils.createElement('div', { className: 'mock-map' });

            let pinsHtml = '';
            booths.forEach((b, i) => {
                pinsHtml += '<div class="mock-pin" style="top:' + (25 + i * 22) + '%;left:' + (20 + i * 25) + '%;" title="' + b.name + '">' +
                    '<div class="pin-marker">📍</div>' +
                    '<div class="pin-tooltip">' + b.name + '</div></div>';
            });

            mapVisual.innerHTML =
                '<div class="mock-map-bg"><div class="mock-map-grid"></div>' +
                '<div class="mock-map-label">' +
                '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A73E8" stroke-width="2">' +
                '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>' +
                '<circle cx="12" cy="10" r="3"></circle></svg><span>' + location + '</span></div>' +
                pinsHtml +
                '<div class="mock-map-badge">🗺️ Mock Map — Demo Mode</div></div>';
            wrapper.appendChild(mapVisual);

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
                    'Directions ↗</a>';
                list.appendChild(card);
                Utils.animateIn(card, idx * 100);
            });

            wrapper.appendChild(list);

            const notice = Utils.createElement('div', { className: 'api-notice' });
            notice.innerHTML = '🔧 <strong>Demo Mode:</strong> Using simulated map data.';
            wrapper.appendChild(notice);
            container.appendChild(wrapper);
        }
    };

    // ── Google Calendar ───────────────────────────────────────────────

    /**
     * Calendar reminder module. Generates real Google Calendar event URLs
     * for election day and voter registration deadline.
     *
     * @namespace Calendar
     */
    const Calendar = {

        /**
         * Renders calendar reminder buttons into a DOM container.
         *
         * @param {string} containerId - ID of the target DOM element.
         */
        render(containerId) {
            const container = document.getElementById(containerId);
            if (!container) return;

            const wrapper = Utils.createElement('div', { className: 'calendar-wrapper' });

            const title = Utils.createElement('h3', { className: 'calendar-title' });
            title.innerHTML = '📅 Set Voting Reminders';

            const desc = Utils.createElement('p', { className: 'calendar-desc' });
            desc.textContent = 'Never miss important election dates. Add reminders directly to Google Calendar.';

            wrapper.appendChild(title);
            wrapper.appendChild(desc);

            const buttons = Utils.createElement('div', { className: 'calendar-buttons' });

            buttons.appendChild(createReminderButton(
                '🗳️ Voting Day Reminder',
                CONFIG.ELECTION_DATE,
                CONFIG.ELECTION_NAME,
                'Remember to vote today! Carry your Voter ID and visit your assigned polling booth. Polling hours: 7 AM – 6 PM.',
                'vote-reminder-btn'
            ));

            buttons.appendChild(createReminderButton(
                '📝 Registration Deadline',
                CONFIG.REGISTRATION_DEADLINE,
                'Voter Registration Deadline',
                'Last date to submit voter registration application. Visit nvsp.in or your local ERO office.',
                'reg-reminder-btn'
            ));

            buttons.appendChild(createReminderButton(
                '📋 Voter List Publication',
                CONFIG.VOTER_LIST_PUBLICATION,
                'Voter Roll Publication Date',
                'Check if your name appears on the final voter roll at voters.eci.gov.in.',
                'roll-reminder-btn'
            ));

            wrapper.appendChild(buttons);
            container.appendChild(wrapper);
        }
    };

    /**
     * Creates a calendar reminder button that opens Google Calendar on click.
     *
     * @param {string} label - Button display text.
     * @param {string} date - ISO date string (YYYY-MM-DD).
     * @param {string} title - Calendar event title.
     * @param {string} description - Calendar event description.
     * @param {string} id - DOM id for the button.
     * @returns {HTMLButtonElement} Configured button element.
     */
    function createReminderButton(label, date, title, description, id) {
        const btn = Utils.createElement('button', {
            className: 'reminder-btn',
            id: id,
            'aria-label': label
        });
        btn.innerHTML =
            '<span class="reminder-icon">📅</span>' +
            '<span>' + label + '</span>' +
            '<span class="reminder-date">' + Utils.formatDate(date) + '</span>';

        btn.addEventListener('click', () => {
            logEvent('calendar_reminder_clicked', { event_title: title, date });
            if (CONFIG.GOOGLE_CALENDAR_ENABLED) {
                openGoogleCalendar(date, title, description);
            }
            showCalendarConfirm(btn, date, title);
        });
        return btn;
    }

    /**
     * Opens a pre-filled Google Calendar event creation page in a new tab.
     *
     * @param {string} date - ISO date string (YYYY-MM-DD) for the event.
     * @param {string} title - Event title.
     * @param {string} description - Event description/notes.
     */
    function openGoogleCalendar(date, title, description) {
        const startDate = date.replace(/-/g, '');
        const url = 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
            '&text=' + encodeURIComponent(title) +
            '&dates=' + startDate + '/' + startDate +
            '&details=' + encodeURIComponent(description) +
            '&sf=true';
        window.open(url, '_blank', 'noopener');
    }

    /**
     * Temporarily changes a reminder button to a "confirmed" state,
     * then restores the original label after 2 seconds.
     *
     * @param {HTMLButtonElement} btn - The reminder button.
     * @param {string} date - ISO date string shown in toast.
     * @param {string} title - Event title shown in toast.
     */
    function showCalendarConfirm(btn, date, title) {
        if (btn._isConfirming) return;
        btn._isConfirming = true;

        const originalHTML = btn.innerHTML;
        btn.classList.add('reminder-confirmed');
        btn.innerHTML = '<span class="reminder-icon">✅</span><span>Opening Google Calendar…</span>';

        Utils.showToast('📅 "' + title + '" — opening for ' + Utils.formatDate(date));

        setTimeout(() => {
            btn._isConfirming = false;
            btn.classList.remove('reminder-confirmed');
            if (btn.isConnected) btn.innerHTML = originalHTML;
        }, 2000);
    }

    // ── Init ──────────────────────────────────────────────────────────

    // Auto-init Firebase Analytics when module loads
    initFirebaseAnalytics();

    return { Maps, Calendar, logEvent, initFirebaseAnalytics };
})();