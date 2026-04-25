/**
 * PollVoteX Test Suite
 * =====================
 * Simulates user scenarios and verifies decision engine outputs.
 */
const TestSuite = (() => {
    'use strict';

    const scenarios = [
        {
            name: 'Underage User (16, Maharashtra, No)',
            input: { age: 16, location: 'Maharashtra', registrationStatus: 'no' },
            expected: { userType: 'underage', stepsCount: 4, hasRegistrationSteps: false }
        },
        {
            name: 'New Voter (20, Karnataka, No)',
            input: { age: 20, location: 'Karnataka', registrationStatus: 'no' },
            expected: { userType: 'unregistered', stepsCount: 7, hasRegistrationSteps: true }
        },
        {
            name: 'Registered Voter (35, Delhi, Yes)',
            input: { age: 35, location: 'Delhi', registrationStatus: 'yes' },
            expected: { userType: 'registered', stepsCount: 5, hasRegistrationSteps: false }
        },
        {
            name: 'Uncertain Status (25, Tamil Nadu, Not Sure)',
            input: { age: 25, location: 'Tamil Nadu', registrationStatus: 'not-sure' },
            expected: { userType: 'uncertain', stepsCount: 4, hasRegistrationSteps: false }
        },
        {
            name: 'Edge Case — Just Turned 18 (18, Kerala, No)',
            input: { age: 18, location: 'Kerala', registrationStatus: 'no' },
            expected: { userType: 'unregistered', stepsCount: 7, hasRegistrationSteps: true }
        },
        {
            name: 'Invalid Age (-5)',
            input: { age: -5, location: 'Delhi', registrationStatus: 'no' },
            isValidationTest: true,
            expected: { validAge: false }
        },
        {
            name: 'Invalid Age (200)',
            input: { age: 200, location: 'Delhi', registrationStatus: 'yes' },
            isValidationTest: true,
            expected: { validAge: false }
        },
        {
            name: 'Sanitization Test — XSS Input',
            input: { age: 25, location: '<script>alert("xss")</script>', registrationStatus: 'yes' },
            isValidationTest: true,
            expected: { validLocation: false }
        }
    ];

    function runAll() {
        const results = scenarios.map(scenario => {
            try {
                if (scenario.isValidationTest) return runValidationTest(scenario);
                return runDecisionTest(scenario);
            } catch (err) {
                return { name: scenario.name, passed: false, error: err.message };
            }
        });
        return results;
    }

    function runDecisionTest(scenario) {
        const result = DecisionEngine.analyze(scenario.input);
        const checks = [];

        checks.push({ label: 'User type', passed: result.userType === scenario.expected.userType, expected: scenario.expected.userType, got: result.userType });
        checks.push({ label: 'Steps count', passed: result.journeySteps.length === scenario.expected.stepsCount, expected: scenario.expected.stepsCount, got: result.journeySteps.length });

        const hasRegSteps = result.journeySteps.some(s => s.id === 'form-fill' || s.id === 'submit');
        checks.push({ label: 'Has registration steps', passed: hasRegSteps === scenario.expected.hasRegistrationSteps, expected: scenario.expected.hasRegistrationSteps, got: hasRegSteps });
        checks.push({ label: 'Has checklist', passed: result.checklist.length > 0, expected: true, got: result.checklist.length > 0 });
        checks.push({ label: 'Has timeline', passed: result.timelineEvents.length > 0, expected: true, got: result.timelineEvents.length > 0 });
        checks.push({ label: 'Has guidance', passed: !!result.guidance, expected: true, got: !!result.guidance });

        const allPassed = checks.every(c => c.passed);
        return { name: scenario.name, passed: allPassed, checks };
    }

    function runValidationTest(scenario) {
        const checks = [];
        if (scenario.expected.validAge !== undefined) {
            const ageResult = Utils.validateAge(scenario.input.age);
            checks.push({ label: 'Age validation', passed: ageResult.valid === scenario.expected.validAge, expected: scenario.expected.validAge, got: ageResult.valid });
        }
        if (scenario.expected.validLocation !== undefined) {
            const locResult = Utils.validateLocation(scenario.input.location);
            checks.push({ label: 'Location validation', passed: locResult.valid === scenario.expected.validLocation, expected: scenario.expected.validLocation, got: locResult.valid });
        }
        const allPassed = checks.every(c => c.passed);
        return { name: scenario.name, passed: allPassed, checks };
    }

    function renderResults(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';

        const results = runAll();
        const passed = results.filter(r => r.passed).length;
        const total = results.length;

        const header = Utils.createElement('div', { className: 'test-header' });
        header.innerHTML = `
            <h3>Test Results</h3>
            <div class="test-summary ${passed === total ? 'all-passed' : 'some-failed'}">
                ${passed}/${total} tests passed
            </div>
        `;
        container.appendChild(header);

        results.forEach((result, idx) => {
            const row = Utils.createElement('div', { className: `test-row ${result.passed ? 'test-pass' : 'test-fail'}` });
            row.innerHTML = `
                <span class="test-status">${result.passed ? '✅' : '❌'}</span>
                <span class="test-name">${result.name}</span>
                <button class="test-detail-toggle" aria-label="Toggle test details" onclick="this.parentElement.querySelector('.test-details').classList.toggle('hidden')">Details</button>
                <div class="test-details hidden">
                    ${result.checks ? result.checks.map(c => `
                        <div class="test-check ${c.passed ? '' : 'check-fail'}">
                            ${c.passed ? '✓' : '✗'} ${c.label}: expected <code>${c.expected}</code>, got <code>${c.got}</code>
                        </div>
                    `).join('') : ''}
                    ${result.error ? `<div class="test-error">Error: ${result.error}</div>` : ''}
                </div>
            `;
            container.appendChild(row);
            Utils.animateIn(row, idx * 80);
        });
    }

    return { runAll, renderResults };
})();
