/**
 * PollVoteX Main App Controller (Enhanced)
 * ==========================================
 * Orchestrates all modules including i18n, personas, voice, and adaptive UI.
 */
const App = (() => {
    'use strict';

    let currentResult = null;
    let currentInput = null;

    function init() {
        I18n.init();
        Accessibility.init();
        Voice.init();
        setupForm();
        setupAccessibilityButtons();
        setupNavigation();
        setupLanguageSelector();
        setupVoiceButtons();
        registerServiceWorker();
        Assistant.render('assistant-container');

        // Restore session if exists
        const saved = Utils.Session.load(CONFIG.SESSION_KEY);
        if (saved && saved.input) {
            restoreSession(saved);
        }
    }

    function setupForm() {
        const form = document.getElementById('user-input-form');
        const ageInput = document.getElementById('input-age');
        const locationSelect = document.getElementById('input-location');
        const personaSelect = document.getElementById('input-persona');
        const scenarioSelect = document.getElementById('input-scenario');

        // Populate location dropdown
        if (locationSelect) {
            CONFIG.STATES.forEach(state => {
                const opt = document.createElement('option');
                opt.value = state;
                opt.textContent = state;
                locationSelect.appendChild(opt);
            });
        }

        // Populate persona dropdown
        if (personaSelect) {
            Personas.PERSONA_LIST.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.id;
                opt.textContent = I18n.t(Personas.getPersonaLabelKey(p.id));
                personaSelect.appendChild(opt);
            });
        }

        // Populate scenario dropdown
        if (scenarioSelect) {
            Personas.SCENARIO_LIST.forEach(s => {
                const opt = document.createElement('option');
                opt.value = s.id;
                opt.textContent = I18n.t(Personas.getScenarioLabelKey(s.id));
                scenarioSelect.appendChild(opt);
            });
        }

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                handleSubmit();
            });
        }

        // Live validation
        if (ageInput) {
            ageInput.addEventListener('input', Utils.debounce(() => {
                const result = Utils.validateAge(ageInput.value);
                toggleFieldError('age-error', result);
            }, 300));
        }
    }

    function handleSubmit() {
        const age = document.getElementById('input-age').value;
        const location = document.getElementById('input-location').value;
        const statusEl = document.querySelector('input[name="registration-status"]:checked');
        const persona = document.getElementById('input-persona')?.value || 'default';
        const scenario = document.getElementById('input-scenario')?.value || 'none';

        // Validate
        const ageResult = Utils.validateAge(age);
        const locResult = Utils.validateLocation(location);
        const regResult = statusEl ? Utils.validateRegistration(statusEl.value) : { valid: false, error: I18n.t('errorStatus') };

        toggleFieldError('age-error', ageResult);
        toggleFieldError('location-error', locResult);
        toggleFieldError('status-error', regResult);

        if (!ageResult.valid || !locResult.valid || !regResult.valid) return;

        currentInput = {
            age: ageResult.value,
            location: locResult.value,
            registrationStatus: regResult.value,
            persona: persona,
            scenario: scenario
        };

        // Run decision engine
        currentResult = DecisionEngine.analyze(currentInput);

        // Merge persona & scenario steps
        const personaSteps = Personas.getPersonaSteps(persona, currentInput.location);
        const scenarioSteps = Personas.getScenarioSteps(scenario);
        if (personaSteps.length > 0) {
            currentResult.journeySteps = currentResult.journeySteps.concat(personaSteps);
        }
        if (scenarioSteps.length > 0) {
            currentResult.journeySteps = currentResult.journeySteps.concat(scenarioSteps);
        }

        // Normalize: only the first non-completed step should be 'active'
        let foundActive = false;
        currentResult.journeySteps.forEach(step => {
            if (step.status === 'completed') return;
            if (!foundActive) {
                step.status = 'active';
                foundActive = true;
            } else {
                step.status = 'pending';
            }
        });

        // Merge persona & scenario checklists
        const personaChecklist = Personas.getPersonaChecklist(persona);
        const scenarioChecklist = Personas.getScenarioChecklist(scenario);
        currentResult.checklist = currentResult.checklist.concat(personaChecklist, scenarioChecklist);

        // Save session
        Utils.Session.save(CONFIG.SESSION_KEY, { input: currentInput, timestamp: Date.now() });

        // Render
        renderResults(currentResult, currentInput);

        // Show & scroll
        const resultsSection = document.getElementById('results-section');
        if (resultsSection) {
            resultsSection.style.display = 'block';
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // Apply simple language if active
        if (Accessibility.getState().simpleLanguage) {
            Accessibility.applySimpleLanguage(document.getElementById('results-section'));
        }
    }

    function renderResults(result, userInput) {
        // Guidance banner
        const banner = document.getElementById('guidance-banner');
        if (banner) {
            banner.className = `guidance-banner guidance-${result.guidance.color}`;
            banner.innerHTML = `
                <div class="guidance-icon">${getGuidanceIcon(result.guidance.color)}</div>
                <div class="guidance-content">
                    <h2 class="guidance-title">${result.guidance.title}</h2>
                    <p class="guidance-message">${result.greeting}</p>
                </div>
                <button class="read-aloud-btn" onclick="Voice.speak(document.getElementById('guidance-banner').innerText)" 
                        aria-label="${I18n.t('voiceSpeak')}" title="${I18n.t('voiceSpeak')}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                </button>
            `;
            Utils.animateIn(banner);
        }

        // Election countdown
        const countdown = document.getElementById('election-countdown');
        if (countdown) {
            const days = Utils.daysUntil(CONFIG.ELECTION_DATE);
            countdown.innerHTML = `
                <div class="countdown-number">${days > 0 ? days : 0}</div>
                <div class="countdown-label">days until<br><strong>${CONFIG.ELECTION_NAME}</strong></div>
            `;
            Utils.animateIn(countdown, 100);
        }

        // Next Best Action widget
        renderNextAction(result);

        // Render sections
        JourneyTracker.render(result.journeySteps, 'journey-container');
        Checklist.render(result.checklist, 'checklist-container');
        Timeline.render(result.timelineEvents, 'timeline-container');
        GoogleServices.Maps.render('map-container', userInput.location);
        GoogleServices.Calendar.render('calendar-container');

        // Render Trust layer
        renderTrustLayer();

        // Show section nav
        document.getElementById('section-nav').style.display = 'flex';
    }

    function renderNextAction(result) {
        const container = document.getElementById('next-action-container');
        if (!container) return;

        const activeStep = result.journeySteps.find(s => s.status === 'active');
        if (!activeStep) return;
        const stepIndex = result.journeySteps.indexOf(activeStep) + 1;

        container.innerHTML = `
            <div class="next-action-card">
                <div class="next-action-badge">${I18n.t('nextAction')}</div>
                <div class="next-action-content">
                    <span class="next-action-icon">${stepIndex}</span>
                    <div>
                        <h3 class="next-action-title">${activeStep.title}</h3>
                        <p class="next-action-desc">${activeStep.description}</p>
                    </div>
                </div>
                <button class="next-action-btn" onclick="document.getElementById('step-${activeStep.id}')?.scrollIntoView({behavior:'smooth'})">
                    ${I18n.t('doThisNow')}
                </button>
            </div>
        `;
        Utils.animateIn(container, 200);
    }

    function renderTrustLayer() {
        const container = document.getElementById('trust-container');
        if (!container) return;

        const lastUpdated = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long' });
        container.innerHTML = `
            <div class="trust-card">
                <h3 class="trust-title">${I18n.t('trustTitle')}</h3>
                <div class="trust-items">
                    <div class="trust-item">
                        <span class="trust-label">${I18n.t('trustSource')}:</span>
                        <a href="https://eci.gov.in" target="_blank" rel="noopener">${I18n.t('trustECI')}</a>,
                        <a href="https://nvsp.in" target="_blank" rel="noopener">${I18n.t('trustNVSP')}</a>
                    </div>
                    <div class="trust-item">
                        <span class="trust-label">${I18n.t('trustLastUpdated')}:</span>
                        <span>${lastUpdated}</span>
                    </div>
                </div>
                <p class="trust-disclaimer">${I18n.t('trustDisclaimer')}</p>
            </div>
        `;
    }

    function restoreSession(saved) {
        const { input } = saved;
        const ageInput = document.getElementById('input-age');
        const locationSelect = document.getElementById('input-location');
        const personaSelect = document.getElementById('input-persona');
        const scenarioSelect = document.getElementById('input-scenario');

        if (ageInput) ageInput.value = input.age;
        if (locationSelect) locationSelect.value = input.location;
        if (personaSelect && input.persona) personaSelect.value = input.persona;
        if (scenarioSelect && input.scenario) scenarioSelect.value = input.scenario;

        const statusRadio = document.querySelector(`input[name="registration-status"][value="${input.registrationStatus}"]`);
        if (statusRadio) statusRadio.checked = true;

        setTimeout(() => handleSubmit(), 300);
    }

    function toggleFieldError(errorId, result) {
        const errorEl = document.getElementById(errorId);
        if (!errorEl) return;
        if (!result.valid) {
            errorEl.textContent = result.error;
            errorEl.style.display = 'block';
        } else {
            errorEl.textContent = '';
            errorEl.style.display = 'none';
        }
    }

    function getGuidanceIcon(color) {
        const icons = { success: '✓', warning: '!', info: 'i', error: '×' };
        return icons[color] || 'i';
    }

    function setupAccessibilityButtons() {
        const handlers = {
            'toggle-simple-language': () => {
                Accessibility.toggleSimpleLanguage();
                if (currentResult) Accessibility.applySimpleLanguage(document.getElementById('results-section'));
            },
            'toggle-high-contrast': () => Accessibility.toggleHighContrast(),
            'toggle-dyslexia-font': () => Accessibility.toggleDyslexiaFont(),
            'toggle-large-text': () => Accessibility.toggleLargeText(),
            'toggle-focus-mode': () => Accessibility.toggleFocusMode()
        };
        Object.entries(handlers).forEach(([id, fn]) => {
            const btn = document.getElementById(id);
            if (btn) btn.addEventListener('click', fn);
        });
    }

    function setupLanguageSelector() {
        const selector = document.getElementById('language-selector');
        if (selector) {
            selector.addEventListener('change', (e) => {
                I18n.setLanguage(e.target.value);
                // Re-render if results are showing
                if (currentResult && currentInput) {
                    renderResults(currentResult, currentInput);
                }
            });
        }
    }

    function setupVoiceButtons() {
        // Voice input button for assistant
        const voiceBtn = document.getElementById('voice-input-btn');
        if (voiceBtn && Voice.isSupported()) {
            voiceBtn.style.display = 'flex';
            voiceBtn.addEventListener('click', () => {
                Voice.listen((transcript) => {
                    const input = document.getElementById('assistant-input');
                    if (input) {
                        input.value = transcript;
                        // Trigger send
                        document.getElementById('assistant-send-btn')?.click();
                    }
                });
            });
        }
    }

    function setupNavigation() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').slice(1);
                const target = document.getElementById(targetId);
                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    }

    function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').then(() => {
                console.log('PollVoteX: Service Worker registered — offline support enabled');
            }).catch(err => {
                console.log('PollVoteX: Service Worker registration skipped:', err.message);
            });
        }
    }

    function runTests() {
        const testSection = document.getElementById('test-section');
        if (testSection) {
            testSection.style.display = 'block';
            TestSuite.renderResults('test-container');
            testSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    function resetSession() {
        Utils.Session.clear();
        currentResult = null;
        currentInput = null;
        document.getElementById('results-section').style.display = 'none';
        document.getElementById('section-nav').style.display = 'none';
        document.getElementById('user-input-form').reset();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    return { init, runTests, resetSession };
})();

document.addEventListener('DOMContentLoaded', App.init);
