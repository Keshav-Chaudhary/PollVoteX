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
            keywords: ['document', 'id', 'proof', 'papers', 'aadhaar', 'passport'],
            response: () => `For most election processes, you'll need: <br>1. <strong>Age Proof</strong> (Birth Cert/Passport)<br>2. <strong>Address Proof</strong> (Utility bill/Aadhaar). <br>Do you have these ready digitally?`,
            followUps: ['Aadhaar enough?', 'Photo specs', 'Offline submission']
        },
        BOOTH: {
            keywords: ['booth', 'where to vote', 'location', 'station', 'map'],
            response: (ctx) => `Finding your booth in <strong>${ctx.location}</strong> is easy. You can use the 📍 <strong>Booth Finder</strong> section below or SMS your EPIC number to 1950.`,
            followUps: ['Nearest booth', 'Booth timings', 'Voter slip']
        },
        COMPLAINT: {
            keywords: ['wrong', 'missing', 'error', 'correction', 'form 8', 'complaint'],
            response: () => `If your details are incorrect, <strong>Form 8</strong> is your best friend. It handles corrections for name, age, and address. Should I show you the steps for Form 8?`,
            followUps: ['Form 8 steps', 'Name missing', 'Contact BLO']
        }
    };

    /**
     * Simulated NLP: Scores the input against known intents
     */
    function analyzeIntents(input) {
        const tokens = input.toLowerCase().split(/\W+/);
        let bestIntent = null;
        let highWeight = 0;

        Object.entries(INTENTS).forEach(([key, data]) => {
            let weight = 0;
            data.keywords.forEach(kw => {
                if (input.toLowerCase().includes(kw)) weight += 2;
                tokens.forEach(t => { if(t === kw) weight += 1; });
            });

            if (weight > highWeight) {
                highWeight = weight;
                bestIntent = key;
            }
        });

        return highWeight > 0 ? bestIntent : null;
    }

    /**
     * Main Processing Loop
     */
    async function getResponse(userInput, currentSession) {
        state.interactionCount++;
        state.userContext = currentSession; // Hook into the main app state

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
     * UI Renderer for the AI Chat
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

    /**
     * Public API
     */
    return {
        ask: async (input, ctx, chatArea) => {
            // Show Thinking State
            const typing = Utils.createElement('div', { className: 'ai-typing' });
            typing.innerHTML = '<span></span><span></span><span></span>';
            chatArea.appendChild(typing);
            chatArea.scrollTop = chatArea.scrollHeight;

            // Simulated delay for "Processing"
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
        
        // Testing integration
        runSelfTest: () => {
            const results = [
                analyzeIntents('how to register') === 'REGISTRATION',
                analyzeIntents('where is my booth') === 'BOOTH',
                analyzeIntents('i lost my id') === 'COMPLAINT'
            ];
            console.log('🤖 AI Assistant Self-Test:', results.every(v => v) ? 'PASSED' : 'FAILED');
            return results.every(v => v);
        }
    };
})();