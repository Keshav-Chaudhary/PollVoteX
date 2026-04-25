/**
 * PollVoteX Service Worker
 * =========================
 * Network-first strategy to always serve fresh files.
 */

const CACHE_NAME = 'pollvotex-v3';
const ASSETS = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/css/components.css',
    '/css/accessibility.css',
    '/js/config.js',
    '/js/utils.js',
    '/js/i18n.js',
    '/js/personas.js',
    '/js/voice.js',
    '/js/decisionEngine.js',
    '/js/journeyTracker.js',
    '/js/checklist.js',
    '/js/timeline.js',
    '/js/assistant.js',
    '/js/googleServices.js',
    '/js/accessibility.js',
    '/js/tests.js',
    '/js/app.js'
];

// Install — cache all assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate — clean old caches immediately
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

// Fetch — NETWORK FIRST, fall back to cache
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Clone and cache the fresh response
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                return response;
            })
            .catch(() => {
                return caches.match(event.request).then(cached => {
                    if (cached) return cached;
                    if (event.request.mode === 'navigate') {
                        return caches.match('/index.html');
                    }
                });
            })
    );
});
