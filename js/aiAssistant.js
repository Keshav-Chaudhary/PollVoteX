/**
 * PollVoteX Advanced AI Assistant
 * ===============================
 * A sophisticated keyword-intent engine that simulates an LLM.
 * Features: Contextual awareness, weighted scoring, and multi-turn simulation.
 */
const AIAssistant = (() => {
    'use strict';

    // State management for "Conversation Memory"
    const state = {
        lastIntent: null,
        userContext: null,
        interactionCount: 0
    };

    // Intent Map with Weighted Keywords
    const INTENTS = {
        REGISTRATION: {
            keywords: ['register', 'apply', 'form 6', 'new voter', 'enroll'],
            response: (ctx) => `It looks like you want to register. Since you're in <strong>${ctx.location || 'India'}</strong>, you should fill out <strong>Form 6</strong> on the NVSP portal. Would you like me to explain the document requirements?`,
            followUps: ['What documents?', 'How long does it take?', 'Track application']
        },
        DOCUMENTS: {
            keywords: ['document', 'proof', 'papers', 'aadhaar', 'passport'],
            response: () => `For most election processes, you'll need: <br>1. <strong>Age Proof</strong> (Birth Cert/Passport)<br>2. <strong>Address Proof</strong> (Utility bill/Aadhaar). <br>Do you have these ready digitally?`,
            followUps: ['Aadhaar enough?', 'Photo specs', 'Offline submission']
        },
        BOOTH: {
            keywords: ['booth', 'where to vote', 'location', 'station', 'map'],
            response: (ctx) => `Finding your booth in <strong>${ctx.location}</strong> is easy. You can use the 📍 <strong>Booth Finder</strong> section below or SMS your EPIC number to 1950.`,
            followUps: ['Nearest booth', 'Booth timings', 'Voter slip']
        },
        COMPLAINT: {
            keywords: ['wrong', 'missing', 'error', 'correction', 'form 8', 'complaint', 'lost id', 'lost my id', 'id card lost'],
            response: () => `If your details are incorrect, <strong>Form 8</strong> is your best friend. It handles corrections for name, age, and address. Should I show you the steps for Form 8?`,
            followUps: ['Form 8 steps', 'Name missing', 'Contact BLO']
        }
    };

    /**
     * Simulated NLP: Scores the input against known intents.
     * Uses phrase matching (higher weight) before token matching.
     *
     * @param {string} input - Raw user input string.
     * @returns {string|null} Best matching intent key, or null if no match.
     */
    function analyzeIntents(input) {
        const normalised = input.toLowerCase();
        const tokens = normalised.split(/\W+/);
        let bestIntent = null;
        let highWeight = 0;

        Object.entries(INTENTS).forEach(([key, data]) => {
            let weight = 0;
            data.keywords.forEach(kw => {
                // Phrase match scores higher than token match
                if (normalised.includes(kw)) weight += 3;
                tokens.forEach(t => { if (t === kw) weight += 1; });
            });

            if (weight > highWeight) {
                highWeight = weight;
                bestIntent = key;
            }
        });

        return highWeight > 0 ? bestIntent : null;
    }

    /**
     * Main Processing Loop — resolves a user message to a response object.
     *
     * @param {string} userInput - The user's message.
     * @param {Object} currentSession - Current app session/context.
     * @returns {Promise<{text: string, chips: string[]}>}
     */
    async function getResponse(userInput, currentSession) {
        state.interactionCount++;
        state.userContext = currentSession;

        const intentKey = analyzeIntents(userInput);
        state.lastIntent = intentKey;

        if (!intentKey) {
            return {
                text: "I'm not quite sure I follow. I can help with registration, documents, finding booths, or correcting errors. Which one sounds like what you need?",
                chips: ['Registration', 'Documents', 'Booth Finder']
            };
        }

        const intent = INTENTS[intentKey];
        return {
            text: intent.response(currentSession),
            chips: intent.followUps
        };
    }

    /**
     * Renders a chat message bubble into the chat area.
     *
     * @param {HTMLElement} container - The chat messages container.
     * @param {string} text - Message HTML/text content.
     * @param {'bot'|'user'} type - Message sender type.
     */
    function renderMessage(container, text, type = 'bot') {
        const msg = Utils.createElement('div', {
            className: `chat-message ${type}-message ai-enhanced`
        });
        msg.innerHTML = text;
        container.appendChild(msg);
        Utils.animateIn(msg);
        container.scrollTop = container.scrollHeight;
    }

    /**
     * Renders suggestion chip buttons below the chat area.
     *
     * @param {HTMLElement} container - Element to insert chips after.
     * @param {string[]} chips - Array of chip label strings.
     * @param {Function} onSelect - Callback when a chip is clicked.
     */
    function renderChips(container, chips, onSelect) {
        const existing = document.querySelector('.ai-chips-container');
        if (existing) existing.remove();

        const chipContainer = Utils.createElement('div', { className: 'ai-chips-container' });
        chips.forEach(text => {
            const chip = Utils.createElement('button', { className: 'ai-chip' });
            chip.textContent = text;
            chip.onclick = () => onSelect(text);
            chipContainer.appendChild(chip);
        });
        container.after(chipContainer);
    }

    return {
        /**
         * Handles a user message: shows typing indicator, resolves intent,
         * renders bot reply and suggestion chips.
         *
         * @param {string} input - User message text.
         * @param {Object} ctx - Current session context.
         * @param {HTMLElement} chatArea - Chat messages container element.
         */
        ask: async (input, ctx, chatArea) => {
            const typing = Utils.createElement('div', { className: 'ai-typing' });
            typing.innerHTML = '<span></span><span></span><span></span>';
            chatArea.appendChild(typing);
            chatArea.scrollTop = chatArea.scrollHeight;

            await new Promise(r => setTimeout(r, 1200));
            typing.remove();

            const result = await getResponse(input, ctx);
            renderMessage(chatArea, result.text, 'bot');

            if (result.chips) {
                renderChips(chatArea, result.chips, (choice) => {
                    renderMessage(chatArea, choice, 'user');
                    AIAssistant.ask(choice, ctx, chatArea);
                });
            }
        },

        /**
         * Runs a self-test of the intent engine against known inputs.
         * Used by the automated test suite.
         *
         * @returns {boolean} True if all intent checks pass.
         */
        runSelfTest: () => {
            const cases = [
                { input: 'how do I register as a new voter', expected: 'REGISTRATION' },
                { input: 'where is my booth location',       expected: 'BOOTH' },
                { input: 'there is an error in my form 8',  expected: 'COMPLAINT' },
                { input: 'I need aadhaar and proof papers',  expected: 'DOCUMENTS' },
                { input: 'I want to enroll and apply',       expected: 'REGISTRATION' }
            ];

            const results = cases.map(({ input, expected }) => {
                const got = analyzeIntents(input);
                const pass = got === expected;
                if (!pass) console.warn(`AI Self-Test FAIL: "${input}" → got "${got}", expected "${expected}"`);
                return pass;
            });

            const passed = results.every(Boolean);
            console.log('🤖 AI Assistant Self-Test:', passed ? 'PASSED ✅' : 'FAILED ❌');
            return passed;
        }
    };
})();