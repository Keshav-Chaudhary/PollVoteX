/**
 * PollVoteX Inference Engine
 * ===========================
 * AI-powered inference engine that generates personalized election journeys.
 * Uses a Decision Pipeline to transform user context into actionable steps.
 */
const DecisionEngine = (() => {
    'use strict';

    /**
     * @typedef {Object} UserInput
     * @property {number} age
     * @property {string} location
     * @property {string} registrationStatus
     * @property {string} [persona]
     * @property {string} [scenario]
     */

    /**
     * Analyzes user input to generate a personalized journey.
     * @param {UserInput} userInput 
     * @returns {Object} The complete journey payload.
     */
    function analyze(userInput) {
        if (!userInput || typeof userInput !== 'object') {
            throw new Error('Invalid engine input: context object required.');
        }

        const { age, location, registrationStatus, persona, scenario } = userInput;
        const userType = determineUserType(age, registrationStatus);

        let journeySteps = generateJourneySteps(userType, age, location);
        let checklist = generateChecklist(userType, location);

        // Persona & Scenario Integration
        if (typeof Personas !== 'undefined') {
            const personaSteps = Personas.getPersonaSteps(persona || 'default', location);
            const scenarioSteps = Personas.getScenarioSteps(scenario || 'none');
            journeySteps = journeySteps.concat(personaSteps, scenarioSteps);

            const personaChecklist = Personas.getPersonaChecklist(persona || 'default');
            const scenarioChecklist = Personas.getScenarioChecklist(scenario || 'none');
            checklist = checklist.concat(personaChecklist, scenarioChecklist);
        }

        // Normalize steps: the first non-completed step should be 'active'
        let foundActive = false;
        journeySteps.forEach(step => {
            if (step.status === 'completed') return;
            if (!foundActive) {
                step.status = 'active';
                foundActive = true;
            } else {
                step.status = 'pending';
            }
        });
        
        const result = {
            userType,
            greeting: generateGreeting(userType, age, location),
            journeySteps,
            checklist,
            timelineEvents: generateTimeline(userType, location),
            guidance: generateGuidance(userType, age),
            explanation: explainDecision(userInput, { userType })
        };

        return Object.freeze(result);
    }

    function determineUserType(age, status) {
        if (age < CONFIG.MIN_VOTING_AGE) return 'underage';
        if (status === 'yes') return 'registered';
        if (status === 'no') return 'unregistered';
        return 'uncertain';
    }

    /**
     * Decision Pipeline — Explainability Layer
     * Generates a human-readable explanation of WHY the journey was produced,
     * making the Inference Engine transparent and trustworthy.
     */
    function explainDecision(userInput, result) {
        const { age, registrationStatus, persona, scenario } = userInput;

        // Classification reason
        let classification = '';
        if (age < CONFIG.MIN_VOTING_AGE) {
            classification = `Age ${age} < ${CONFIG.MIN_VOTING_AGE} → underage`;
        } else if (registrationStatus === 'yes') {
            classification = `Age ${age} ≥ ${CONFIG.MIN_VOTING_AGE} + registered → ready voter`;
        } else if (registrationStatus === 'no') {
            classification = `Age ${age} ≥ ${CONFIG.MIN_VOTING_AGE} + unregistered → registration required`;
        } else {
            classification = `Age ${age} ≥ ${CONFIG.MIN_VOTING_AGE} + status unknown → verification needed`;
        }

        // Persona impact
        const personaImpacts = {
            'default': 'Regular voter → standard guidance applied',
            'first-time': 'First-time voter → added educational steps',
            'senior': 'Senior citizen → added priority & postal ballot info',
            'student': 'Student → added campus-specific guidance',
            'rural': 'Rural voter → added access & transport guidance',
            'nri': 'NRI / Overseas voter → added Form 6A & travel guidance',
            'differently-abled': 'Differently-abled voter → added assistance & accessibility guidance'
        };
        const personaImpact = personaImpacts[persona] || personaImpacts['default'];

        // Scenario impact
        const scenarioImpacts = {
            'none': 'No special situation → standard path',
            'moved': 'Moved → address update required',
            'lost-id': 'Lost Voter ID → duplicate EPIC process added',
            'first-vote': 'First vote → EVM learning & etiquette steps added',
            'name-missing': 'Name missing → search & re-registration steps added',
            'nri-voter': 'NRI voter → passport & Form 6A steps added',
            'correction': 'Correction needed → Form 8 & tracking steps added'
        };
        const scenarioImpact = scenarioImpacts[scenario] || scenarioImpacts['none'];

        return {
            classification,
            persona: personaImpact,
            scenario: scenarioImpact
        };
    }

    function generateGreeting(type, age, location) {
        const greetings = {
            underage: `You're ${age} years old — not yet eligible to vote, but your time is coming! Here's what you need to know about preparing for your future as a voter in ${location}.`,
            unregistered: `Welcome! You're eligible to vote in ${location}, but you need to register first. Let's get you started with a step-by-step registration guide.`,
            registered: `Great news! You're a registered voter in ${location}. Let's make sure you're fully prepared for Election Day.`,
            uncertain: `No worries! Let's first verify your voter registration status in ${location}, then guide you through the next steps.`
        };
        return greetings[type];
    }

    function generateJourneySteps(type, age, location) {
        const steps = {
            underage: [
                { id: 'eligibility', title: 'Eligibility Check', description: `You are ${age} years old. The minimum voting age is ${CONFIG.MIN_VOTING_AGE}.`, icon: '🔍', status: 'completed', detail: `You will be eligible to vote when you turn ${CONFIG.MIN_VOTING_AGE}.` },
                { id: 'age-calc', title: 'Your Voting Timeline', description: `You'll turn ${CONFIG.MIN_VOTING_AGE} approximately on ${Utils.formatDate(Utils.turnsEighteenDate(age))}`, icon: '📅', status: 'active', detail: 'Mark this date! You can start the registration process around this time.' },
                { id: 'pre-register', title: 'Pre-Registration Info', description: 'Learn what documents you\'ll need and how registration works', icon: '📋', status: 'pending', detail: 'Start collecting required documents like proof of age, address proof, and passport-size photos.' },
                { id: 'future-voter', title: 'Future Voter Guide', description: 'Understand your rights and responsibilities as a future voter', icon: '🌟', status: 'pending', detail: 'Learn about the democratic process, political parties, and how to make informed voting decisions.' }
            ],
            unregistered: [
                { id: 'eligibility', title: 'Eligibility Confirmed', description: `Age ${age} — you are eligible to vote!`, icon: '✅', status: 'completed', detail: 'You meet the minimum age requirement.' },
                { id: 'documents', title: 'Gather Documents', description: 'Collect required documents for registration', icon: '📄', status: 'active', detail: 'You need: Proof of Age (birth certificate/school certificate), Proof of Address (Aadhaar/utility bill), and 2 passport-size photos.' },
                { id: 'form-fill', title: 'Fill Registration Form', description: 'Complete Form 6 online or offline', icon: '📝', status: 'pending', detail: 'Visit nvsp.in or your local Electoral Registration Office to fill Form 6.' },
                { id: 'submit', title: 'Submit Application', description: 'Submit your registration application', icon: '📤', status: 'pending', detail: 'Submit online through NVSP portal or in person at the ERO office.' },
                { id: 'verification', title: 'Verification Process', description: 'Wait for Booth Level Officer verification', icon: '🔎', status: 'pending', detail: 'A BLO will visit your address for verification. Keep your documents ready.' },
                { id: 'voter-id', title: 'Receive Voter ID (EPIC)', description: 'Get your Voter ID card', icon: '🪪', status: 'pending', detail: 'After approval, you will receive your EPIC (Electors Photo Identity Card).' },
                { id: 'booth-lookup', title: 'Find Polling Booth', description: `Locate your polling booth in ${location}`, icon: '📍', status: 'pending', detail: 'Use the booth finder below to locate your assigned polling station.' }
            ],
            registered: [
                { id: 'eligibility', title: 'Eligibility Confirmed', description: `Age ${age} — registered voter`, icon: '✅', status: 'completed', detail: 'You are a registered voter.' },
                { id: 'verify-details', title: 'Verify Your Details', description: 'Confirm your name, address, and booth on the voter list', icon: '🔍', status: 'active', detail: 'Visit nvsp.in or call 1950 to verify your name on the electoral roll.' },
                { id: 'booth-lookup', title: 'Locate Polling Booth', description: `Find your assigned polling booth in ${location}`, icon: '📍', status: 'pending', detail: 'Use the booth finder below to see your polling station location.' },
                { id: 'voting-prep', title: 'Voting Day Preparation', description: 'Know what to bring and what to expect', icon: '🗳️', status: 'pending', detail: 'Carry your Voter ID (EPIC) or any approved photo ID. Polling hours: 7 AM – 6 PM.' },
                { id: 'cast-vote', title: 'Cast Your Vote', description: 'Exercise your democratic right!', icon: '🎯', status: 'pending', detail: 'Go to your assigned booth, verify identity, get inked, and cast your vote using the EVM.' }
            ],
            uncertain: [
                { id: 'eligibility', title: 'Eligibility Confirmed', description: `Age ${age} — eligible to vote`, icon: '✅', status: 'completed', detail: 'You meet the age requirement.' },
                { id: 'check-status', title: 'Check Registration Status', description: 'Verify if you\'re on the electoral roll', icon: '🔍', status: 'active', detail: 'Visit nvsp.in → "Search in Electoral Roll" or call 1950. You need your name, father\'s name, and area details.' },
                { id: 'status-result', title: 'Status Result', description: 'Based on your search result, follow the appropriate path', icon: '🔀', status: 'pending', detail: 'If found: proceed to verify details and booth lookup. If not found: proceed to registration.' },
                { id: 'next-steps', title: 'Next Steps', description: 'Personalized actions based on your status', icon: '➡️', status: 'pending', detail: 'After checking, you\'ll either prepare for voting day or start registration.' }
            ]
        };
        return steps[type] || [];
    }

    function generateChecklist(type, location) {
        const base = {
            underage: [
                { id: 'cl-1', category: 'Preparation', text: 'Know the minimum voting age (18 years)', checked: false },
                { id: 'cl-2', category: 'Preparation', text: 'Calculate when you\'ll turn 18', checked: false },
                { id: 'cl-3', category: 'Documents', text: 'Keep birth certificate safe', checked: false },
                { id: 'cl-4', category: 'Documents', text: 'Get passport-size photographs ready', checked: false },
                { id: 'cl-5', category: 'Learning', text: 'Understand the democratic process', checked: false },
                { id: 'cl-6', category: 'Learning', text: 'Learn about voter registration steps', checked: false }
            ],
            unregistered: [
                { id: 'cl-1', category: 'Documents', text: 'Proof of Age (Birth Certificate / School Certificate)', checked: false },
                { id: 'cl-2', category: 'Documents', text: 'Proof of Address (Aadhaar Card / Utility Bill / Rent Agreement)', checked: false },
                { id: 'cl-3', category: 'Documents', text: '2 recent passport-size photographs', checked: false },
                { id: 'cl-4', category: 'Documents', text: 'Aadhaar number (for linking)', checked: false },
                { id: 'cl-5', category: 'Registration', text: 'Visit nvsp.in or download Voter Helpline App', checked: false },
                { id: 'cl-6', category: 'Registration', text: 'Fill Form 6 completely', checked: false },
                { id: 'cl-7', category: 'Registration', text: 'Submit application with documents', checked: false },
                { id: 'cl-8', category: 'Registration', text: 'Note application reference number', checked: false },
                { id: 'cl-9', category: 'Verification', text: 'Keep documents ready for BLO visit', checked: false },
                { id: 'cl-10', category: 'Verification', text: 'Check application status online', checked: false }
            ],
            registered: [
                { id: 'cl-1', category: 'Verification', text: 'Verify name on electoral roll at nvsp.in', checked: false },
                { id: 'cl-2', category: 'Verification', text: 'Confirm polling booth assignment', checked: false },
                { id: 'cl-3', category: 'Verification', text: 'Check address details are correct', checked: false },
                { id: 'cl-4', category: 'Voting Day', text: 'Keep Voter ID (EPIC) card ready', checked: false },
                { id: 'cl-5', category: 'Voting Day', text: 'Know your polling booth location', checked: false },
                { id: 'cl-6', category: 'Voting Day', text: 'Check polling time (usually 7 AM - 6 PM)', checked: false },
                { id: 'cl-7', category: 'Voting Day', text: 'Carry approved photo ID', checked: false },
                { id: 'cl-8', category: 'Voting Day', text: 'Set voting day reminder', checked: false }
            ],
            uncertain: [
                { id: 'cl-1', category: 'Verification', text: 'Visit nvsp.in for electoral roll search', checked: false },
                { id: 'cl-2', category: 'Verification', text: 'Search by name or EPIC number', checked: false },
                { id: 'cl-3', category: 'Verification', text: 'Try Voter Helpline number: 1950', checked: false },
                { id: 'cl-4', category: 'Verification', text: 'Download Voter Helpline App', checked: false },
                { id: 'cl-5', category: 'Documents', text: 'Keep any old voter ID if available', checked: false },
                { id: 'cl-6', category: 'Next Steps', text: 'Based on result, proceed to register or prepare', checked: false }
            ]
        };
        return base[type] || [];
    }

    function generateTimeline(type, location) {
        const electionDate = CONFIG.ELECTION_DATE;
        const regDeadline = CONFIG.REGISTRATION_DEADLINE;
        const voterList = CONFIG.VOTER_LIST_PUBLICATION;
        const resultDate = CONFIG.RESULT_DATE;
        const daysToElection = Utils.daysUntil(electionDate);

        const common = [
            { date: regDeadline, title: 'Registration Deadline', description: 'Last date to apply for voter registration', icon: '📝', highlight: type === 'unregistered' },
            { date: voterList, title: 'Final Voter List Published', description: 'Check your name on the final electoral roll', icon: '📋', highlight: type === 'uncertain' },
            { date: electionDate, title: 'Election Day', description: `${CONFIG.ELECTION_NAME} — Cast your vote!`, icon: '🗳️', highlight: true },
            { date: resultDate, title: 'Results Declared', description: 'Election results announced', icon: '📊', highlight: false }
        ];

        return common.map(evt => ({ ...evt, isPast: new Date(evt.date) < new Date(), daysAway: Utils.daysUntil(evt.date) }));
    }

    function generateGuidance(type, age) {
        const guidance = {
            underage: { title: 'Future Voter', message: `You have ${CONFIG.MIN_VOTING_AGE - age} year(s) until you can vote. Use this time to learn about the democratic process and prepare your documents.`, color: 'info' },
            unregistered: { title: 'New Voter Registration', message: 'You are eligible but not yet registered. Follow the step-by-step guide below to register and get your Voter ID.', color: 'warning' },
            registered: { title: 'Ready to Vote', message: 'You are registered! Verify your details, locate your booth, and prepare for Election Day.', color: 'success' },
            uncertain: { title: 'Let\'s Find Out', message: 'We\'ll help you check your registration status. Once confirmed, we\'ll guide you through the next steps.', color: 'info' }
        };
        return guidance[type];
    }

    return { analyze, determineUserType, explainDecision };
})();
