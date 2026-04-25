
/**
 * PollVoteX Accessibility Module (Professional)
 * ============================================
 * Settings drawer, dark mode with icon toggle,
 * simple language, dyslexia font, large text,
 * focus mode, keyboard navigation, adaptive UI.
 */
const Accessibility = (() => {
    'use strict';

    const A11Y_KEY = 'pollvotex_a11y';
    let state = {
        simpleLanguage: false,
        highContrast: false,
        dyslexiaFont: false,
        largeText: false,
        focusMode: false
    };

    let confusionScore = 0;
    let lastInteractionTime = Date.now();

    function init() {
        const saved = Utils.Session.load(A11Y_KEY);
        if (saved) { state = { ...state, ...saved }; applyState(); }
        setupKeyboardNav();
        setupSettingsDrawer();
        setupAdaptiveTracking();
        updateButtons();
    }

    // ── Settings Drawer ────────────────────────────────────────
    function setupSettingsDrawer() {
        const toggle = document.getElementById('settings-toggle-btn');
        const drawer = document.getElementById('settings-drawer');
        const overlay = document.getElementById('settings-overlay');
        const close = document.getElementById('settings-close-btn');

        if (!toggle || !drawer) return;

        const openDrawer = () => { drawer.classList.add('open'); overlay.classList.add('open'); };
        const closeDrawer = () => { drawer.classList.remove('open'); overlay.classList.remove('open'); };

        toggle.addEventListener('click', openDrawer);
        close.addEventListener('click', closeDrawer);
        overlay.addEventListener('click', closeDrawer);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
        });
    }

    function toggle(key) {
        if (state[key] === undefined) return;
        state[key] = !state[key];
        applyState();
        Utils.Session.save(A11Y_KEY, state);
        updateButtons();
    }

    function toggleSimpleLanguage() { toggle('simpleLanguage'); }
    function toggleHighContrast() { toggle('highContrast'); }
    function toggleDyslexiaFont() { toggle('dyslexiaFont'); }
    function toggleLargeText() { toggle('largeText'); }
    function toggleFocusMode() { toggle('focusMode'); }

    function applyState() {
        document.body.classList.toggle('simple-language', state.simpleLanguage);
        document.body.classList.toggle('high-contrast', state.highContrast);
        document.body.classList.toggle('dyslexia-font', state.dyslexiaFont);
        document.body.classList.toggle('large-text', state.largeText);
        document.body.classList.toggle('focus-mode', state.focusMode);

        // Update theme icon
        const themeIcon = document.getElementById('theme-icon');
        if (themeIcon) {
            themeIcon.textContent = state.highContrast ? '◑' : '◐';
        }
    }

    function updateButtons() {
        // Update switch states in settings drawer
        const switches = {
            'toggle-simple-language': 'simpleLanguage',
            'toggle-high-contrast': 'highContrast',
            'toggle-dyslexia-font': 'dyslexiaFont',
            'toggle-large-text': 'largeText',
            'toggle-focus-mode': 'focusMode'
        };
        Object.entries(switches).forEach(([id, key]) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.classList.toggle('active', state[key]);
                btn.setAttribute('aria-pressed', state[key]);
            }
        });
    }

    function setupKeyboardNav() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.step-detail').forEach(d => d.classList.add('collapsed'));
                document.querySelectorAll('.step-card').forEach(c => c.classList.remove('expanded'));
            }
        });
    }

    // ── Adaptive UI ─────────────────────────────────────────────
    function setupAdaptiveTracking() {
        document.addEventListener('click', () => {
            const now = Date.now();
            if (now - lastInteractionTime < 500) confusionScore += 2;
            lastInteractionTime = now;
            if (confusionScore > 10 && !state.simpleLanguage) {
                showAdaptiveHint();
                confusionScore = 0;
            }
        });

        let lastScrollY = 0, scrollReverseCount = 0;
        window.addEventListener('scroll', Utils.debounce(() => {
            const currentY = window.scrollY;
            if (Math.abs(currentY - lastScrollY) > 200) {
                scrollReverseCount++;
                if (scrollReverseCount > 5 && !state.simpleLanguage) {
                    showAdaptiveHint();
                    scrollReverseCount = 0;
                }
            }
            lastScrollY = currentY;
        }, 200));
    }

    function showAdaptiveHint() {
        if (Utils.Session.load('pollvotex_hint_shown')) return;
        Utils.Session.save('pollvotex_hint_shown', true);

        const hint = Utils.createElement('div', { className: 'adaptive-hint', id: 'adaptive-hint' });
        hint.innerHTML = `
            <div class="hint-content">
                <span class="hint-icon">💡</span>
                <span class="hint-text">${I18n.t('needHelp')}</span>
                <button class="hint-btn" id="hint-enable-simple" aria-label="Enable simple mode">
                    ${I18n.t('simpleLanguage')}
                </button>
                <button class="hint-close" aria-label="Dismiss">&times;</button>
            </div>
        `;
        document.body.appendChild(hint);
        setTimeout(() => hint.classList.add('hint-visible'), 100);

        hint.querySelector('#hint-enable-simple').addEventListener('click', () => {
            if (!state.simpleLanguage) toggleSimpleLanguage();
            hint.remove();
        });
        hint.querySelector('.hint-close').addEventListener('click', () => hint.remove());
        setTimeout(() => { if (hint.parentNode) hint.remove(); }, 10000);
    }

    // Simple language replacements
    const SIMPLE_TERMS = {
        'Electoral Roll': 'Voter List', 'electoral roll': 'voter list',
        'Constituency': 'Voting Area', 'constituency': 'voting area',
        'EPIC': 'Voter ID Card', 'Electors Photo Identity Card': 'Voter ID Card',
        'ERO': 'Registration Office', 'Electoral Registration Officer': 'Registration Officer',
        'BLO': 'Verification Officer', 'Booth Level Officer': 'Verification Officer',
        'EVM': 'Voting Machine', 'Electronic Voting Machine': 'Voting Machine',
        'VVPAT': 'Vote Receipt Printer',
        'Indelible ink': 'Voting ink (on your finger)', 'indelible ink': 'voting ink (on your finger)',
        'transposition': 'address change',
        'Form 6': 'Registration Form', 'Form 8': 'Correction Form', 'Form 6A': 'Overseas Voter Form'
    };

    function applySimpleLanguage(element) {
        if (!state.simpleLanguage || !element) return;
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while (node = walker.nextNode()) {
            let text = node.nodeValue;
            Object.entries(SIMPLE_TERMS).forEach(([term, simple]) => {
                text = text.replace(new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), simple);
            });
            node.nodeValue = text;
        }
    }

    return {
        init, toggleSimpleLanguage, toggleHighContrast,
        toggleDyslexiaFont, toggleLargeText, toggleFocusMode,
        applySimpleLanguage, getState: () => state
    };
})();
