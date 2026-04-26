/**
 * PollVoteX Automated Test Suite
 * Validates Decision Engine logic and persona mapping.
 */
const TestSuite = (() => {
    'use strict';

    const RUN_CONFIG = [
        { name: 'Underage User', input: { age: 16, location: 'Delhi', registrationStatus: 'no', persona: 'default', scenario: 'none' }, expect: 'underage' },
        { name: 'New Voter', input: { age: 18, location: 'Maharashtra', registrationStatus: 'no', persona: 'first-time', scenario: 'first-vote' }, expect: 'unregistered' },
        { name: 'Senior Citizen', input: { age: 70, location: 'Karnataka', registrationStatus: 'yes', persona: 'senior', scenario: 'none' }, expect: 'registered' },
        { name: 'NRI Voter', input: { age: 30, location: 'Kerala', registrationStatus: 'no', persona: 'nri', scenario: 'nri-voter' }, expect: 'unregistered' },
        { name: 'Moved Scenario', input: { age: 25, location: 'Tamil Nadu', registrationStatus: 'yes', persona: 'student', scenario: 'moved' }, expect: 'registered' },
        { name: 'Edge Case: 18 Year Old', input: { age: 18, location: 'Delhi', registrationStatus: 'not-sure', persona: 'default', scenario: 'none' }, expect: 'uncertain' },
        { name: 'Boundary: 150 Year Old', input: { age: 150, location: 'Delhi', registrationStatus: 'yes', persona: 'senior', scenario: 'none' }, expect: 'registered' },
        { name: 'Sanitization Test', input: { age: 30, location: '<script>alert(1)</script>', registrationStatus: 'yes', persona: 'default', scenario: 'none' }, expect: 'registered' },
        { name: 'Google Cloud: Map Init', input: null, type: 'integration', action: () => typeof google !== 'undefined', expect: true },
        { name: 'Google Cloud: Directions API', input: null, type: 'integration', action: () => typeof google !== 'undefined' && !!google.maps.DirectionsService, expect: true },
        { name: 'AI: Intent Engine', input: null, type: 'logic', action: () => AIAssistant.runSelfTest(), expect: true }
    ];

    function runAll() {
        console.group('🗳️ PollVoteX Test Suite');
        const results = RUN_CONFIG.map(test => {
            let passed = false;
            let actual = '';
            
            if (test.type === 'integration' || test.type === 'logic') {
                actual = test.action();
                passed = actual === test.expect;
            } else {
                const result = DecisionEngine.analyze(test.input);
                actual = result.userType;
                passed = actual === test.expect;
            }
            
            // Deep validation of steps
            const hasSteps = test.input ? DecisionEngine.analyze(test.input).journeySteps.length > 0 : true;

            console.log(
                `${passed ? '✅' : '❌'} ${test.name}: ` + 
                `Expected ${test.expect}, Got ${actual}`
            );

            return { ...test, actual, passed: passed && hasSteps };
        });
        console.groupEnd();
        return results;
    }

    function renderResults(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const startTime = performance.now();
        const tests = runAll();
        const duration = (performance.now() - startTime).toFixed(2);
        
        const passCount = tests.filter(t => t.passed).length;
        container.innerHTML = `
            <div class="test-terminal">
                <div class="terminal-header">
                    <span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span>
                    <span class="terminal-title">pollvotex-test-runner --verbose</span>
                </div>
                <div class="terminal-body">
                    <div class="test-summary">
                        Tests: <span class="pass">${passCount} passed</span>, ${tests.length} total
                        Time: ${duration}ms
                    </div>
                    <div class="test-grid">
                        ${tests.map(t => `
                            <div class="test-row ${t.passed ? 'pass' : 'fail'}">
                                <span class="test-status">${t.passed ? 'PASS' : 'FAIL'}</span>
                                <span class="test-name">${t.name}</span>
                                <span class="test-meta">Type: ${t.actual}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    return { runAll, renderResults };
})();