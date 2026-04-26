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
        // Apply High Contrast (Dark) theme by default if no preference is saved
        const savedA11y = Utils.Session.load('pollvotex_a11y');
        if (!savedA11y || savedA11y.highContrast === undefined) {
            document.body.classList.add('high-contrast');
        }

        I18n.init();
        Accessibility.init();
        Voice.init();
        setupForm();
        setupAccessibilityButtons();
        setupNavigation();
        setupLanguageSelector();
        setupVoiceButtons();
        registerServiceWorker();
        setupPrivacyLinks();
        Assistant.render('assistant-container');
        initClock();

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
                const key = Personas.getPersonaLabelKey(p.id);
                opt.setAttribute('data-i18n', key);
                opt.textContent = I18n.t(key);
                personaSelect.appendChild(opt);
            });
        }

        // Populate scenario dropdown
        if (scenarioSelect) {
            Personas.SCENARIO_LIST.forEach(s => {
                const opt = document.createElement('option');
                opt.value = s.id;
                const key = Personas.getScenarioLabelKey(s.id);
                opt.setAttribute('data-i18n', key);
                opt.textContent = I18n.t(key);
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

        // Run Inference Engine (Decision Pipeline)
        currentResult = DecisionEngine.analyze(currentInput);

        // Generate explainability layer
        currentResult.explanation = DecisionEngine.explainDecision(currentInput, currentResult);

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
            // Use a slight delay to ensure rendering is complete for the scroll
            setTimeout(() => resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
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

        // Explainability layer
        renderExplanation(result);

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

    function renderExplanation(result) {
        const container = document.getElementById('decision-explainability');
        if (!container || !result.explanation) return;

        const exp = result.explanation;
        container.innerHTML = `
            <div class="explainability-card">
                <h3 class="explainability-title">${I18n.t('explainabilityTitle')}</h3>
                <ul class="explainability-list">
                    <li class="explainability-item">
                        <span class="explainability-bullet">🧠</span>
                        <div>
                            <strong>${I18n.t('explainabilityClassification')}:</strong>
                            <span>${exp.classification}</span>
                        </div>
                    </li>
                    <li class="explainability-item">
                        <span class="explainability-bullet">👤</span>
                        <div>
                            <strong>${I18n.t('explainabilityPersona')}:</strong>
                            <span>${exp.persona}</span>
                        </div>
                    </li>
                    <li class="explainability-item">
                        <span class="explainability-bullet">📍</span>
                        <div>
                            <strong>${I18n.t('explainabilityScenario')}:</strong>
                            <span>${exp.scenario}</span>
                        </div>
                    </li>
                </ul>
            </div>
        `;
        Utils.animateIn(container, 150);
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
                // Re-calculate the result to get new translations from the engine
                if (currentInput) {
                    handleSubmit();
                }
            });
        }
    }

    function setupPrivacyLinks() {
        // Hook up any element with the id nav-privacy-btn or class privacy-link
        const btns = document.querySelectorAll('#nav-privacy-btn, .privacy-link');
        btns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                renderPrivacyPage();
            });
        });
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
        const links = document.querySelectorAll('.nav-link');
        const sections = [];

        links.forEach(link => {
            const targetId = link.getAttribute('href').slice(1);
            const target = document.getElementById(targetId);
            if (target) sections.push({ link, target });

            link.addEventListener('click', (e) => {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                
                // Manual override for active class on click
                links.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });

        // Intersection Observer for scroll tracking
        if ('IntersectionObserver' in window) {
            const observerOptions = {
                root: null,
                rootMargin: '-20% 0px -70% 0px', // Trigger when section is near top
                threshold: 0
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const id = entry.target.getAttribute('id');
                        links.forEach(link => {
                            const isActive = link.getAttribute('href') === `#${id}`;
                            link.classList.toggle('active', isActive);
                            if (isActive) link.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                        });
                    }
                });
            }, observerOptions);

            sections.forEach(s => observer.observe(s.target));
        }
    }

    function initClock() {
        const clockBtn = document.getElementById('clock-toggle-btn');
        const clockDisplay = document.getElementById('clock-display');
        if (!clockBtn || !clockDisplay) return;

        function updateClock() {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });
            clockDisplay.textContent = timeString;
        }

        updateClock();
        setInterval(updateClock, 1000);

        clockBtn.addEventListener('click', () => {
            const now = new Date();
            const dateStr = now.toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            const timeStr = now.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });
            Utils.showToast(`📅 ${dateStr} — ${timeStr}`);
        });
    }

    function renderPrivacyPage() {
        const resultsSection = document.getElementById('results-section');
        if (!resultsSection) return;

        // Hide section navigation when viewing privacy to prevent confusion
        const sectionNav = document.getElementById('section-nav');
        if (sectionNav) sectionNav.style.display = 'none';

        resultsSection.style.display = 'block';
        resultsSection.innerHTML = `
            <div class="privacy-container animate-fade-in-up">
                <div class="privacy-header">
                    <h2>${I18n.t('privacyTitle')}</h2>
                    <p class="hero-subtitle">${I18n.t('privacyIntro')}</p>
                </div>
                <div class="privacy-body">
                    ${renderPrivacyItem('📍', 'privacyLocationTitle', 'privacyLocationDesc')}
                    ${renderPrivacyItem('🎙️', 'privacyMicTitle', 'privacyMicDesc')}
                    ${renderPrivacyItem('💾', 'privacyStorageTitle', 'privacyStorageDesc')}
                    ${renderPrivacyItem('🛡️', 'privacyTransparency', 'privacyTransparencyDesc')}
                </div>
                <div style="text-align:center; margin-top:40px;">
                    <button class="btn-secondary" style="width:auto;" onclick="location.reload()">← Back to App</button>
                </div>
            </div>
        `;
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    function renderPrivacyItem(icon, titleKey, descKey) {
        return `
            <div class="privacy-item">
                <div class="privacy-icon-box">${icon}</div>
                <div class="privacy-content">
                    <h3>${I18n.t(titleKey)}</h3>
                    <p>${I18n.t(descKey)}</p>
                </div>
            </div>
        `;
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
        const resultsSection = document.getElementById('results-section');
        if (resultsSection) resultsSection.style.display = 'none';
        const sectionNav = document.getElementById('section-nav');
        if (sectionNav) sectionNav.style.display = 'none';
        const userForm = document.getElementById('user-input-form');
        if (userForm) userForm.reset();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    return { init, runTests, resetSession, renderPrivacyPage };
})();

document.addEventListener('DOMContentLoaded', App.init);
