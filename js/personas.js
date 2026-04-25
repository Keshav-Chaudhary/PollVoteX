/**
 * PollVoteX Personas & Scenarios
 * ================================
 * Community personas and scenario-based guidance.
 * Adapts journey steps, language complexity, and guidance per persona/scenario.
 */
const Personas = (() => {
    'use strict';

    const PERSONA_LIST = [
        { id: 'default', icon: '🗳️' },
        { id: 'first-time', icon: '🌟' },
        { id: 'senior', icon: '👴' },
        { id: 'student', icon: '🎓' },
        { id: 'rural', icon: '🌾' },
        { id: 'nri', icon: '✈️' },
        { id: 'differently-abled', icon: '♿' }
    ];

    const SCENARIO_LIST = [
        { id: 'none', icon: '—' },
        { id: 'moved', icon: '🏠' },
        { id: 'lost-id', icon: '🔍' },
        { id: 'first-vote', icon: '🌟' },
        { id: 'name-missing', icon: '❓' },
        { id: 'nri-voter', icon: '✈️' },
        { id: 'correction', icon: '✏️' }
    ];

    /**
     * Get additional journey steps based on persona.
     */
    function getPersonaSteps(personaId, location) {
        const extras = {
            'first-time': [
                { id: 'p-understand', title: 'Understand Voting', description: 'Learn what voting means and why it matters', icon: '📚', status: 'active', detail: 'Voting is your right as an Indian citizen. Each vote matters in choosing your representatives in the government. Watch short videos on the ECI website to learn more.' },
                { id: 'p-mock', title: 'Try a Mock Vote', description: 'Practice using an EVM before election day', icon: '🎮', status: 'pending', detail: 'Visit your local election office for a demo, or use the ECI\'s online EVM simulator to understand how the voting machine works.' }
            ],
            'senior': [
                { id: 'p-priority', title: 'Priority Queue Access', description: 'Senior citizens (65+) get priority entry at booths', icon: '⭐', status: 'active', detail: 'As a senior citizen, you have the right to priority entry at your polling booth. You can also request a wheelchair or assistance from polling officers. Postal ballot facility is available for 80+ age group.' },
                { id: 'p-postal', title: 'Check Postal Ballot Eligibility', description: 'Voters above 80 can apply for postal ballot', icon: '📮', status: 'pending', detail: 'If you are 80 years or above, or have a disability of 40%+, you can apply for a postal ballot through Form 12D. Contact your local ERO or call 1950.' }
            ],
            'student': [
                { id: 'p-home-vote', title: 'Register at Home or College Address', description: 'Choose where you want to vote', icon: '🏠', status: 'active', detail: 'You can register at either your home address or your college hostel address. If you register at college, you vote in that constituency. Consider where you\'ll be on election day.' },
                { id: 'p-transfer', title: 'Transfer Registration if Needed', description: 'Shift your registration to your college city', icon: '🔄', status: 'pending', detail: 'To transfer, fill Form 6 for new registration at your college address. Your old registration will be automatically deleted once the new one is approved.' }
            ],
            'rural': [
                { id: 'p-access', title: 'Know Your Booth Access', description: 'Transport and access facilities for rural areas', icon: '🚌', status: 'active', detail: 'The Election Commission arranges free transport in remote areas on election day. Check with your local BLO (Booth Level Officer) or Sarpanch for details. Booths are set up within 2 km of every habitation.' },
                { id: 'p-helpline', title: 'Use Voter Helpline', description: 'Call 1950 for any assistance in your language', icon: '📞', status: 'pending', detail: 'The voter helpline 1950 is available in multiple languages. You can ask about your registration status, booth location, or any voting-related query. The Voter Helpline app also works in Hindi and English.' }
            ],
            'nri': [
                { id: 'p-form6a', title: 'Fill Form 6A (Overseas Voter)', description: 'Special registration form for NRI voters', icon: '📋', status: 'active', detail: 'NRI voters must fill Form 6A instead of Form 6. You need a valid Indian passport. Submit online at nvsp.in or at the Indian Embassy/Consulate in your country.' },
                { id: 'p-presence', title: 'Plan Your Presence', description: 'NRI voters must be present in person to vote', icon: '✈️', status: 'pending', detail: 'Currently, NRI voters must be physically present at their assigned polling booth in India on election day. There is no postal ballot facility for overseas voters yet (as of 2024). Plan your travel accordingly.' }
            ],
            'differently-abled': [
                { id: 'p-assist', title: 'Request Voting Assistance', description: 'You can bring a companion to help you vote', icon: '🤝', status: 'active', detail: 'Differently-abled voters can bring a companion inside the voting booth to assist them. Inform the presiding officer at the booth. Wheelchairs, ramps, and Braille ballot sheets are available at select booths.' },
                { id: 'p-postal-pwd', title: 'Check Postal Ballot Option', description: 'PwD voters with 40%+ disability can use postal ballot', icon: '📮', status: 'pending', detail: 'If you have a disability of 40% or more (certified), you can apply for a postal ballot using Form 12D. Contact your local ERO or call 1950 for the application process.' }
            ]
        };
        return extras[personaId] || [];
    }

    /**
     * Get additional checklist items based on persona.
     */
    function getPersonaChecklist(personaId) {
        const items = {
            'first-time': [
                { id: 'pc-1', category: 'Learning', text: 'Watch a video about how voting works', checked: false },
                { id: 'pc-2', category: 'Learning', text: 'Understand the difference between local, state, and national elections', checked: false },
                { id: 'pc-3', category: 'Preparation', text: 'Visit your polling booth location before election day', checked: false }
            ],
            'senior': [
                { id: 'pc-1', category: 'Comfort', text: 'Arrange transport to polling booth', checked: false },
                { id: 'pc-2', category: 'Comfort', text: 'Carry water and any medications', checked: false },
                { id: 'pc-3', category: 'Eligibility', text: 'Check if eligible for postal ballot (80+)', checked: false }
            ],
            'student': [
                { id: 'pc-1', category: 'Registration', text: 'Decide: register at home or college address', checked: false },
                { id: 'pc-2', category: 'Planning', text: 'Check if election day falls during exams', checked: false },
                { id: 'pc-3', category: 'Planning', text: 'Plan travel home if registered at home address', checked: false }
            ],
            'rural': [
                { id: 'pc-1', category: 'Access', text: 'Find out transport arrangements for election day', checked: false },
                { id: 'pc-2', category: 'Access', text: 'Contact local BLO for booth information', checked: false }
            ],
            'nri': [
                { id: 'pc-1', category: 'Documents', text: 'Keep valid Indian passport ready', checked: false },
                { id: 'pc-2', category: 'Registration', text: 'Fill Form 6A (not Form 6)', checked: false },
                { id: 'pc-3', category: 'Travel', text: 'Book travel to India for election day', checked: false }
            ],
            'differently-abled': [
                { id: 'pc-1', category: 'Assistance', text: 'Identify a companion to assist at booth', checked: false },
                { id: 'pc-2', category: 'Access', text: 'Check if booth has wheelchair/ramp access', checked: false },
                { id: 'pc-3', category: 'Eligibility', text: 'Check postal ballot eligibility (40%+ disability)', checked: false }
            ]
        };
        return items[personaId] || [];
    }

    /**
     * Get scenario-specific journey steps.
     */
    function getScenarioSteps(scenarioId) {
        const scenarios = {
            'moved': [
                { id: 'sc-delete', title: 'Delete Old Registration', description: 'Your old registration will be auto-deleted when new one is approved', icon: '🗑️', status: 'pending', detail: 'When you register at your new address using Form 6, the Election Commission will automatically remove your name from the old constituency\'s voter list. You don\'t need to file a separate deletion request.' },
                { id: 'sc-newreg', title: 'Register at New Address', description: 'Fill Form 6 with your new address proof', icon: '📝', status: 'active', detail: 'Visit nvsp.in → New Voter Registration → Fill Form 6 with your new city address. You\'ll need: new address proof (utility bill, rent agreement, Aadhaar with updated address), passport-size photo, and age proof.' },
                { id: 'sc-verify', title: 'Verify New Registration', description: 'BLO will visit your new address for verification', icon: '🔎', status: 'pending', detail: 'After submitting Form 6, a Booth Level Officer (BLO) will visit your new address. Keep your documents ready. Processing takes 15-30 days.' },
                { id: 'sc-newbooth', title: 'Find New Polling Booth', description: 'Your booth will be different in the new area', icon: '📍', status: 'pending', detail: 'Once your new registration is approved, check your assigned booth on nvsp.in → "Know Your Polling Station".' }
            ],
            'lost-id': [
                { id: 'sc-fir', title: 'File a Police Complaint (Optional)', description: 'File an FIR or NCR for the lost card', icon: '🚔', status: 'active', detail: 'While not mandatory, filing a police complaint (FIR/NCR) for the lost voter ID can help. Some EROs may ask for it. Visit your nearest police station with basic details.' },
                { id: 'sc-apply', title: 'Apply for Duplicate Voter ID', description: 'Submit Form 002 at your ERO or online', icon: '📋', status: 'pending', detail: 'Visit nvsp.in → "Apply for duplicate EPIC" or contact your local ERO. Fill the form with your details. You\'ll need: passport photo, address proof, and the police complaint copy (if filed).' },
                { id: 'sc-alt-id', title: 'Use Alternative ID on Voting Day', description: 'You can vote with other valid photo IDs', icon: '🪪', status: 'pending', detail: 'Even without your voter ID (EPIC), you can vote using any of these IDs: Aadhaar, Passport, Driving License, PAN Card, Service ID (government employees), Student ID with photo, Bank Passbook with photo.' },
                { id: 'sc-collect', title: 'Collect Duplicate EPIC', description: 'Get your replacement voter ID card', icon: '✅', status: 'pending', detail: 'After processing (2-4 weeks), collect your duplicate EPIC from your local ERO office. Some areas also deliver it to your address.' }
            ],
            'first-vote': [
                { id: 'sc-learn', title: 'Learn the Basics', description: 'Understand how Indian elections work', icon: '📚', status: 'active', detail: 'India follows a first-past-the-post system. You vote for a candidate in your constituency. The candidate with the most votes wins the seat. Learn about your local candidates and their platforms.' },
                { id: 'sc-evm', title: 'Understand the EVM', description: 'Know how the Electronic Voting Machine works', icon: '🖥️', status: 'pending', detail: 'The EVM has buttons next to each candidate\'s name and symbol. Press the button next to your chosen candidate. A beep will confirm your vote. The VVPAT (paper slip) will briefly show your selection for verification.' },
                { id: 'sc-dos', title: 'Know the Do\'s and Don\'ts', description: 'Booth rules and voting etiquette', icon: '📋', status: 'pending', detail: 'DO: Carry valid ID, queue patiently, vote independently. DON\'T: Bring phones inside booth, take photos of EVM, discuss your vote inside booth premises, campaign near booth.' }
            ],
            'name-missing': [
                { id: 'sc-search', title: 'Search Thoroughly', description: 'Try multiple search methods on nvsp.in', icon: '🔍', status: 'active', detail: 'Search on nvsp.in using: 1) Your name + father\'s name, 2) Your EPIC number, 3) Different name spellings. Also try the Voter Helpline App and call 1950.' },
                { id: 'sc-register', title: 'Apply for Fresh Registration', description: 'If not found, submit Form 6 for new registration', icon: '📝', status: 'pending', detail: 'If your name is not in any voter list, you need to register fresh using Form 6. Visit nvsp.in or your local ERO office with all required documents.' },
                { id: 'sc-complaint', title: 'File Complaint if Wrongly Deleted', description: 'Contact your local ERO if your name was removed', icon: '⚠️', status: 'pending', detail: 'If you were previously registered but your name was removed without your knowledge, contact your ERO, file a complaint, and re-apply using Form 6. You can also use the cVIGIL app to report.' }
            ],
            'nri-voter': [
                { id: 'sc-passport', title: 'Ensure Valid Indian Passport', description: 'Active passport is mandatory for NRI voter registration', icon: '📕', status: 'active', detail: 'You must have a valid, non-expired Indian passport. The passport number is used for your registration under Form 6A.' },
                { id: 'sc-6a', title: 'Register with Form 6A', description: 'Special form for overseas Indian voters', icon: '📋', status: 'pending', detail: 'Fill Form 6A (not regular Form 6) at nvsp.in. Select "Overseas Voter" option. Your constituency will be based on your Indian passport address.' },
                { id: 'sc-travel', title: 'Plan India Visit for Voting', description: 'Physical presence required at polling booth', icon: '✈️', status: 'pending', detail: 'Currently, NRI voters must be physically present at their assigned booth in India. Plan your travel well in advance. There is ongoing discussion about remote/postal voting for NRIs.' }
            ],
            'correction': [
                { id: 'sc-identify', title: 'Identify What Needs Correction', description: 'Name, address, photo, or age correction', icon: '🔍', status: 'active', detail: 'Common corrections: wrong name spelling, outdated photo, incorrect age, address change within same constituency. Each uses a different process.' },
                { id: 'sc-form8', title: 'Fill Form 8 for Corrections', description: 'Online or at your ERO office', icon: '📝', status: 'pending', detail: 'Visit nvsp.in → "Correction of entries in Electoral Roll" → Fill Form 8. Attach supporting documents (Aadhaar for name, utility bill for address, recent photo for photo update).' },
                { id: 'sc-track', title: 'Track Correction Status', description: 'Check if your changes have been updated', icon: '📊', status: 'pending', detail: 'After submitting Form 8, you\'ll get a reference number. Track status on nvsp.in → "Track Application Status". Changes usually take 15-30 days.' }
            ]
        };
        return scenarios[scenarioId] || [];
    }

    /**
     * Get scenario-specific checklist items.
     */
    function getScenarioChecklist(scenarioId) {
        const items = {
            'moved': [
                { id: 'sc-cl-1', category: 'Address Change', text: 'Get new address proof (utility bill / rent agreement)', checked: false },
                { id: 'sc-cl-2', category: 'Address Change', text: 'Update Aadhaar with new address', checked: false },
                { id: 'sc-cl-3', category: 'Registration', text: 'Submit Form 6 at new address', checked: false }
            ],
            'lost-id': [
                { id: 'sc-cl-1', category: 'Recovery', text: 'File police complaint for lost voter ID', checked: false },
                { id: 'sc-cl-2', category: 'Recovery', text: 'Apply for duplicate EPIC (Form 002)', checked: false },
                { id: 'sc-cl-3', category: 'Backup', text: 'Keep alternative photo ID ready for voting day', checked: false }
            ],
            'name-missing': [
                { id: 'sc-cl-1', category: 'Search', text: 'Search nvsp.in with different name spellings', checked: false },
                { id: 'sc-cl-2', category: 'Search', text: 'Call 1950 voter helpline', checked: false },
                { id: 'sc-cl-3', category: 'Action', text: 'Submit Form 6 for fresh registration if needed', checked: false }
            ],
            'correction': [
                { id: 'sc-cl-1', category: 'Correction', text: 'Identify fields that need correction', checked: false },
                { id: 'sc-cl-2', category: 'Correction', text: 'Gather supporting documents', checked: false },
                { id: 'sc-cl-3', category: 'Correction', text: 'Submit Form 8 online or at ERO', checked: false }
            ]
        };
        return items[scenarioId] || [];
    }

    /**
     * Get persona display label key.
     */
    function getPersonaLabelKey(id) {
        const map = {
            'default': 'personaDefault', 'first-time': 'personaFirstTime',
            'senior': 'personaSenior', 'student': 'personaStudent',
            'rural': 'personaRural', 'nri': 'personaNRI',
            'differently-abled': 'personaDifferentlyAbled'
        };
        return map[id] || 'personaDefault';
    }

    function getScenarioLabelKey(id) {
        const map = {
            'none': 'scenarioNone', 'moved': 'scenarioMoved',
            'lost-id': 'scenarioLostID', 'first-vote': 'scenarioFirstTime',
            'name-missing': 'scenarioNameMissing', 'nri-voter': 'scenarioNRI',
            'correction': 'scenarioCorrection'
        };
        return map[id] || 'scenarioNone';
    }

    return {
        PERSONA_LIST, SCENARIO_LIST,
        getPersonaSteps, getPersonaChecklist,
        getScenarioSteps, getScenarioChecklist,
        getPersonaLabelKey, getScenarioLabelKey
    };
})();
