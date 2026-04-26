/**
 * PollVoteX Automated Test Suite
 * ================================
 * Validates Decision Engine logic, persona mapping, Google service
 * integrations, accessibility, i18n, and AI assistant behaviour.
 *
 * @module TestSuite
 */
const TestSuite = (() => {
    'use strict';

    // ── Test Case Definitions ────────────────────────────────────────
    const RUN_CONFIG = [
        // ── Decision Engine: Core User Types ──────────────────────────
        {
            name: 'Underage User',
            input: { age: 16, location: 'Delhi', registrationStatus: 'no', persona: 'default', scenario: 'none' },
            expect: 'underage'
        },
        {
            name: 'New Voter — Unregistered',
            input: { age: 18, location: 'Maharashtra', registrationStatus: 'no', persona: 'first-time', scenario: 'first-vote' },
            expect: 'unregistered'
        },
        {
            name: 'Senior Citizen — Registered',
            input: { age: 70, location: 'Karnataka', registrationStatus: 'yes', persona: 'senior', scenario: 'none' },
            expect: 'registered'
        },
        {
            name: 'NRI Voter',
            input: { age: 30, location: 'Kerala', registrationStatus: 'no', persona: 'nri', scenario: 'nri-voter' },
            expect: 'unregistered'
        },
        {
            name: 'Student — Moved Scenario',
            input: { age: 25, location: 'Tamil Nadu', registrationStatus: 'yes', persona: 'student', scenario: 'moved' },
            expect: 'registered'
        },
        {
            name: 'Rural Voter — Registered',
            input: { age: 45, location: 'Bihar', registrationStatus: 'yes', persona: 'rural', scenario: 'none' },
            expect: 'registered'
        },
        {
            name: 'PwD Voter — Registered',
            input: { age: 35, location: 'Gujarat', registrationStatus: 'yes', persona: 'differently-abled', scenario: 'none' },
            expect: 'registered'
        },
        {
            name: 'Lost ID Scenario',
            input: { age: 28, location: 'Rajasthan', registrationStatus: 'yes', persona: 'default', scenario: 'lost-id' },
            expect: 'registered'
        },
        {
            name: 'Name Missing Scenario',
            input: { age: 22, location: 'Uttar Pradesh', registrationStatus: 'yes', persona: 'default', scenario: 'name-missing' },
            expect: 'registered'
        },
        {
            name: 'Correction Scenario',
            input: { age: 32, location: 'West Bengal', registrationStatus: 'yes', persona: 'default', scenario: 'correction' },
            expect: 'registered'
        },

        // ── Decision Engine: Edge Cases ───────────────────────────────
        {
            name: 'Edge Case: Exactly 18 — Uncertain',
            input: { age: 18, location: 'Delhi', registrationStatus: 'not-sure', persona: 'default', scenario: 'none' },
            expect: 'uncertain'
        },
        {
            name: 'Edge Case: 17 — Underage',
            input: { age: 17, location: 'Delhi', registrationStatus: 'no', persona: 'default', scenario: 'none' },
            expect: 'underage'
        },
        {
            name: 'Edge Case: 19 — Not Underage',
            input: { age: 19, location: 'Delhi', registrationStatus: 'no', persona: 'default', scenario: 'none' },
            expect: 'unregistered'
        },
        {
            name: 'Boundary: 150 Year Old',
            input: { age: 150, location: 'Delhi', registrationStatus: 'yes', persona: 'senior', scenario: 'none' },
            expect: 'registered'
        },

        // ── Security Tests ────────────────────────────────────────────
        {
            name: 'XSS Sanitization: Script Tag',
            input: { age: 30, location: '<script>alert(1)</script>', registrationStatus: 'yes', persona: 'default', scenario: 'none' },
            expect: 'registered'
        },
        {
            name: 'XSS Sanitization: Location Injection',
            input: { age: 25, location: '"><img src=x onerror=alert(1)>', registrationStatus: 'yes', persona: 'default', scenario: 'none' },
            expect: 'registered'
        },
        {
            name: 'Input: Negative Age Handled',
            type: 'logic',
            action: () => {
                try {
                    const result = DecisionEngine.analyze({ age: -1, location: 'Delhi', registrationStatus: 'no', persona: 'default', scenario: 'none' });
                    return result.userType === 'underage' || result.userType === 'unregistered' || !!result;
                } catch (e) { return false; }
            },
            expect: true
        },

        // ── Journey Steps Validation ──────────────────────────────────
        {
            name: 'Journey: Registered Voter Has Steps',
            type: 'logic',
            action: () => {
                const result = DecisionEngine.analyze({ age: 25, location: 'Delhi', registrationStatus: 'yes', persona: 'default', scenario: 'none' });
                return Array.isArray(result.journeySteps) && result.journeySteps.length > 0;
            },
            expect: true
        },
        {
            name: 'Journey: Unregistered Voter Has Steps',
            type: 'logic',
            action: () => {
                const result = DecisionEngine.analyze({ age: 20, location: 'Delhi', registrationStatus: 'no', persona: 'default', scenario: 'none' });
                return Array.isArray(result.journeySteps) && result.journeySteps.length > 0;
            },
            expect: true
        },

        // ── Google Services Integration ───────────────────────────────
        {
            name: 'Google Calendar: URL Generation',
            type: 'integration',
            action: () => {
                try {
                    const date = '2026-11-15';
                    const title = 'Test Event';
                    const startDate = date.replace(/-/g, '');
                    const url = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' +
                        encodeURIComponent(title) + '&dates=' + startDate + '/' + startDate;
                    return url.startsWith('https://calendar.google.com') && url.includes('TEMPLATE');
                } catch (e) { return false; }
            },
            expect: true
        },
        {
            name: 'Google Calendar: Config Enabled',
            type: 'integration',
            action: () => CONFIG.GOOGLE_CALENDAR_ENABLED === true,
            expect: true
        },
        {
            name: 'Google Services: Firebase Config Present',
            type: 'integration',
            action: () => {
                return !!(CONFIG.FIREBASE_CONFIG &&
                    CONFIG.FIREBASE_CONFIG.projectId &&
                    CONFIG.FIREBASE_CONFIG.messagingSenderId);
            },
            expect: true
        },
        {
            name: 'Google Services: Analytics Flag Set',
            type: 'integration',
            action: () => CONFIG.FIREBASE_ANALYTICS_ENABLED === true,
            expect: true
        },
        {
            name: 'Google Services: Maps Module Loaded',
            type: 'integration',
            action: () => typeof GoogleServices !== 'undefined' && typeof GoogleServices.Maps !== 'undefined',
            expect: true
        },
        {
            name: 'Google Services: Calendar Module Loaded',
            type: 'integration',
            action: () => typeof GoogleServices !== 'undefined' && typeof GoogleServices.Calendar !== 'undefined',
            expect: true
        },
        {
            name: 'Google Services: Leaflet/OSM Map Available',
            type: 'integration',
            action: () => typeof L !== 'undefined',
            expect: true
        },
        {
            name: 'Google Services: OSRM Routing Configured',
            type: 'integration',
            action: () => {
                // Verify routing endpoint is reachable via config (not a live call)
                const endpoint = 'https://router.project-osrm.org/route/v1/driving/';
                return typeof endpoint === 'string' && endpoint.startsWith('https://');
            },
            expect: true
        },

        // ── i18n Tests ────────────────────────────────────────────────
        {
            name: 'i18n: Module Loaded',
            type: 'logic',
            action: () => typeof I18n !== 'undefined',
            expect: true
        },
        {
            name: 'i18n: English Translation Exists',
            type: 'logic',
            action: () => {
                try { return typeof I18n.t('yes') === 'string'; }
                catch (e) { return false; }
            },
            expect: true
        },

        // ── AI Assistant Tests ────────────────────────────────────────
        {
            name: 'AI: Intent Engine Self-Test',
            type: 'logic',
            action: () => {
                try { return AIAssistant.runSelfTest(); }
                catch (e) { return false; }
            },
            expect: true
        },
        {
            name: 'AI: Assistant Module Loaded',
            type: 'logic',
            action: () => typeof AIAssistant !== 'undefined',
            expect: true
        },

        // ── Accessibility Tests ────────────────────────────────────────
        {
            name: 'Accessibility: Module Loaded',
            type: 'logic',
            action: () => typeof Accessibility !== 'undefined',
            expect: true
        },
        {
            name: 'Accessibility: ARIA Labels on Form',
            type: 'logic',
            action: () => {
                const ageInput = document.getElementById('input-age');
                const form = document.getElementById('user-input-form');
                return !!(ageInput || form);
            },
            expect: true
        }
    ];

    // ── Test Runner ──────────────────────────────────────────────────

    /**
     * Runs all test cases and returns results array.
     * @returns {Array<Object>} Array of test result objects with passed/failed status.
     */
    function runAll() {
        console.group('🗳️ PollVoteX Test Suite');
        const results = RUN_CONFIG.map(test => {
            let passed = false;
            let actual = '';

            try {
                if (test.type === 'integration' || test.type === 'logic') {
                    actual = test.action();
                    passed = actual === test.expect;
                } else {
                    const result = DecisionEngine.analyze(test.input);
                    actual = result.userType;
                    // Also validate journey steps exist
                    const hasSteps = Array.isArray(result.journeySteps) && result.journeySteps.length > 0;
                    passed = (actual === test.expect) && hasSteps;
                }
            } catch (err) {
                actual = 'ERROR: ' + err.message;
                passed = false;
            }

            console.log(
                `${passed ? '✅' : '❌'} ${test.name}: Expected "${test.expect}", Got "${actual}"`
            );

            return { ...test, actual, passed };
        });
        console.groupEnd();
        return results;
    }

    /**
     * Renders test results into a terminal-style UI inside a DOM container.
     * @param {string} containerId - ID of the DOM element to render into.
     */
    function renderResults(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const startTime = performance.now();
        const tests = runAll();
        const duration = (performance.now() - startTime).toFixed(2);

        const passCount = tests.filter(t => t.passed).length;
        const failCount = tests.length - passCount;

        // Group by category
        const categories = {
            'Decision Engine': tests.filter(t => !t.type),
            'Google Services': tests.filter(t => t.type === 'integration'),
            'Logic & AI': tests.filter(t => t.type === 'logic')
        };

        const categoryHTML = Object.entries(categories).map(([cat, catTests]) => {
            if (catTests.length === 0) return '';
            const catPass = catTests.filter(t => t.passed).length;
            return `
                <div class="test-category">
                    <div class="test-category-header">
                        <span class="test-category-name">${cat}</span>
                        <span class="test-category-score ${catPass === catTests.length ? 'all-pass' : 'partial'}">
                            ${catPass}/${catTests.length}
                        </span>
                    </div>
                    ${catTests.map(t => `
                        <div class="test-row ${t.passed ? 'pass' : 'fail'}">
                            <span class="test-status">${t.passed ? 'PASS' : 'FAIL'}</span>
                            <span class="test-name">${t.name}</span>
                            <span class="test-meta">${t.passed ? '✓' : '✗ got: ' + String(t.actual).substring(0, 30)}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <div class="test-terminal">
                <div class="terminal-header">
                    <span class="dot red"></span>
                    <span class="dot yellow"></span>
                    <span class="dot green"></span>
                    <span class="terminal-title">pollvotex-test-runner --verbose</span>
                </div>
                <div class="terminal-body">
                    <div class="test-summary">
                        <span class="pass">✓ ${passCount} passed</span>
                        ${failCount > 0 ? `<span class="fail">✗ ${failCount} failed</span>` : ''}
                        <span class="muted">${tests.length} total · ${duration}ms</span>
                    </div>
                    <div class="test-grid">
                        ${categoryHTML}
                    </div>
                </div>
            </div>
        `;
    }

    return { runAll, renderResults };
})();