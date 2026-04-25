/**
 * PollVoteX Smart Assistant
 * ==========================
 * Chat-style Q&A panel with curated election knowledge base.
 * Controlled responses only — no hallucination.
 */
const Assistant = (() => {
    'use strict';

    const KNOWLEDGE_BASE = [
        {
            keywords: ['document', 'id proof', 'papers', 'what to bring', 'identity', 'photo id', 'aadhaar'],
            question: 'What documents do I need?',
            answer: `<strong>For Registration (Form 6):</strong><br>
                • Proof of Age — Birth certificate, school leaving certificate, or passport<br>
                • Proof of Address — Aadhaar card, utility bill, bank passbook, or rent agreement<br>
                • 2 recent passport-size photographs<br><br>
                <strong>For Voting Day:</strong><br>
                • Voter ID (EPIC) card — primary ID<br>
                • Alternative IDs: Aadhaar, Passport, Driving License, PAN card, or any govt-issued photo ID<br><br>
                <em>Tip: Carry your EPIC card for the smoothest experience at the booth.</em>`
        },
        {
            keywords: ['register', 'registration', 'how to register', 'sign up', 'form 6', 'new voter', 'apply'],
            question: 'How do I register to vote?',
            answer: `<strong>Online Method:</strong><br>
                1. Visit <a href="https://nvsp.in" target="_blank" rel="noopener">nvsp.in</a><br>
                2. Click "New Voter Registration"<br>
                3. Fill Form 6 with your details<br>
                4. Upload documents and photo<br>
                5. Submit and note your reference number<br><br>
                <strong>Offline Method:</strong><br>
                1. Visit your local Electoral Registration Office (ERO)<br>
                2. Collect and fill Form 6<br>
                3. Attach documents and photos<br>
                4. Submit to the ERO<br><br>
                <strong>Via App:</strong> Download the "Voter Helpline" app from Play Store/App Store.<br><br>
                <em>Processing typically takes 15-30 days.</em>`
        },
        {
            keywords: ['eligible', 'eligibility', 'age', 'who can vote', 'minimum age', 'qualify'],
            question: 'Am I eligible to vote?',
            answer: `<strong>Eligibility Requirements:</strong><br>
                • Must be an Indian citizen<br>
                • Must be 18 years or older on the qualifying date (January 1st of the year of electoral roll revision)<br>
                • Must not be disqualified under any law<br>
                • Must be a resident of the constituency where you want to vote<br><br>
                <em>Note: NRI citizens can also register as overseas voters using Form 6A.</em>`
        },
        {
            keywords: ['booth', 'polling station', 'where to vote', 'location', 'find booth', 'polling place'],
            question: 'How do I find my polling booth?',
            answer: `<strong>Methods to find your booth:</strong><br>
                1. Visit <a href="https://nvsp.in" target="_blank" rel="noopener">nvsp.in</a> → "Know Your Polling Station"<br>
                2. SMS: Send EPIC<space>your_EPIC_number to 1950<br>
                3. Call: 1950 (Voter Helpline)<br>
                4. Use the "Voter Helpline" mobile app<br>
                5. Use the Booth Finder section below on this page<br><br>
                <em>Your booth is assigned based on your registered address.</em>`
        },
        {
            keywords: ['voting day', 'how to vote', 'evm', 'process', 'procedure', 'steps to vote', 'what happens'],
            question: 'What happens on voting day?',
            answer: `<strong>Voting Day Process:</strong><br>
                1. Go to your assigned polling booth during polling hours (typically 7 AM – 6 PM)<br>
                2. Stand in the queue — separate queues may be available for senior citizens and differently-abled<br>
                3. Show your Voter ID to the polling officer<br>
                4. Your name is verified on the electoral roll<br>
                5. Indelible ink is applied on your left index finger<br>
                6. You enter the voting compartment<br>
                7. Press the button next to your chosen candidate on the EVM<br>
                8. The VVPAT slip confirms your vote<br>
                9. Exit the booth<br><br>
                <strong>Do's:</strong> Carry valid ID, check booth timings, vote independently<br>
                <strong>Don'ts:</strong> No phones inside booth, no campaigning near booth, don't share who you voted for inside the booth area`
        },
        {
            keywords: ['check status', 'am i registered', 'verify', 'electoral roll', 'voter list', 'search name'],
            question: 'How do I check my registration status?',
            answer: `<strong>Check your status:</strong><br>
                1. Visit <a href="https://nvsp.in" target="_blank" rel="noopener">nvsp.in</a> → "Search in Electoral Roll"<br>
                2. Search by: Name + details OR EPIC number<br>
                3. If found — note your Part Number and Serial Number<br>
                4. If not found — you need to register using Form 6<br><br>
                <strong>Other methods:</strong><br>
                • Call 1950 (Voter Helpline)<br>
                • SMS: EPIC<space>EPIC_number to 1950<br>
                • Voter Helpline App<br><br>
                <em>Always verify before election day to avoid issues.</em>`
        },
        {
            keywords: ['rule', 'rules', 'law', 'code of conduct', 'violation', 'complaint'],
            question: 'What are the voting rules?',
            answer: `<strong>Key Election Rules:</strong><br>
                • Voting is voluntary (not compulsory) in India<br>
                • You can only vote at your assigned polling booth<br>
                • One person, one vote — impersonation is a criminal offense<br>
                • Model Code of Conduct applies to candidates and parties<br>
                • No campaigning 48 hours before polling<br>
                • No liquor sale during polling period<br><br>
                <strong>Your Rights:</strong><br>
                • Right to a secret ballot<br>
                • Right to assistance if differently-abled<br>
                • Right to NOTA (None of the Above) option<br>
                • Right to file complaint with Election Commission<br><br>
                <em>Report violations: Call 1950 or use cVIGIL app.</em>`
        },
        {
            keywords: ['correction', 'update', 'change address', 'change name', 'modify', 'edit details', 'form 8'],
            question: 'How do I update my voter details?',
            answer: `<strong>To update voter details:</strong><br>
                • <strong>Form 8:</strong> For correction of entries (name, age, photo, address within same constituency)<br>
                • <strong>Form 8A:</strong> For transposition (address change within same constituency)<br>
                • <strong>Form 6:</strong> For new registration in a different constituency<br><br>
                Submit online at nvsp.in or at your local ERO office.<br><br>
                <em>Always update well before election dates.</em>`
        }
    ];

    const SUGGESTED_QUESTIONS = [
        'What documents do I need?',
        'How do I register to vote?',
        'Am I eligible to vote?',
        'How do I find my polling booth?',
        'What happens on voting day?',
        'How do I check my registration status?'
    ];

    let chatHistory = [];

    function render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';

        const panel = Utils.createElement('div', { className: 'assistant-panel' });

        // Header
        const header = Utils.createElement('div', { className: 'assistant-header' });
        header.innerHTML = `
            <div class="assistant-avatar">🤖</div>
            <div>
                <h3 class="assistant-title">Smart Assistant</h3>
                <p class="assistant-subtitle">Ask me about elections, voting, and registration</p>
            </div>
        `;
        panel.appendChild(header);

        // Chat area
        const chatArea = Utils.createElement('div', { className: 'chat-area', id: 'chat-area' });
        // Welcome message
        addBotMessage(chatArea, 'Hello! I\'m your election guide. Ask me anything about voting, registration, documents, or polling booths. You can also click the suggested questions below.', false);
        panel.appendChild(chatArea);

        // Suggestions
        const suggestions = Utils.createElement('div', { className: 'suggestions', id: 'suggestions' });
        SUGGESTED_QUESTIONS.forEach(q => {
            const btn = Utils.createElement('button', {
                className: 'suggestion-btn',
                'aria-label': `Ask: ${q}`
            });
            btn.textContent = q;
            btn.addEventListener('click', () => handleQuestion(q, chatArea));
            suggestions.appendChild(btn);
        });
        panel.appendChild(suggestions);

        // Input area
        const inputArea = Utils.createElement('div', { className: 'assistant-input-area' });
        const input = Utils.createElement('input', {
            type: 'text',
            className: 'assistant-input',
            id: 'assistant-input',
            placeholder: 'Type your question...',
            'aria-label': 'Type your question'
        });
        const sendBtn = Utils.createElement('button', {
            className: 'send-btn',
            id: 'assistant-send-btn',
            'aria-label': 'Send question'
        });
        sendBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>';
        sendBtn.addEventListener('click', () => {
            const question = input.value.trim();
            if (question) { handleQuestion(question, chatArea); input.value = ''; }
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const question = input.value.trim();
                if (question) { handleQuestion(question, chatArea); input.value = ''; }
            }
        });
        inputArea.appendChild(input);
        inputArea.appendChild(sendBtn);
        panel.appendChild(inputArea);

        // Disclaimer
        const disclaimer = Utils.createElement('div', { className: 'assistant-disclaimer' });
        disclaimer.textContent = '⚠️ This assistant provides guidance only. Please verify all information with the Election Commission of India (eci.gov.in) or call 1950.';
        panel.appendChild(disclaimer);

        container.appendChild(panel);
    }

    function handleQuestion(question, chatArea) {
        addUserMessage(chatArea, question);
        const answer = findAnswer(question);
        // Simulate typing delay
        const typing = addTypingIndicator(chatArea);
        setTimeout(() => {
            chatArea.removeChild(typing);
            addBotMessage(chatArea, answer, true);
            chatArea.scrollTop = chatArea.scrollHeight;
        }, 600 + Math.random() * 400);
    }

    function findAnswer(question) {
        const q = question.toLowerCase();
        let bestMatch = null;
        let bestScore = 0;

        KNOWLEDGE_BASE.forEach(entry => {
            let score = 0;
            entry.keywords.forEach(kw => {
                if (q.includes(kw)) score += 2;
            });
            // Partial word match
            const words = q.split(/\s+/);
            words.forEach(word => {
                entry.keywords.forEach(kw => {
                    if (kw.includes(word) && word.length > 2) score += 1;
                });
            });
            if (score > bestScore) { bestScore = score; bestMatch = entry; }
        });

        if (bestMatch && bestScore >= 2) {
            return bestMatch.answer;
        }
        return `I'm not sure about that specific question. Here are some things I can help with:<br><br>
            • Required documents for voting and registration<br>
            • How to register as a new voter<br>
            • Eligibility requirements<br>
            • Finding your polling booth<br>
            • Voting day process and rules<br>
            • Checking registration status<br><br>
            <em>For specific queries, please contact the Election Commission helpline: 1950</em>`;
    }

    function addUserMessage(chatArea, text) {
        const msg = Utils.createElement('div', { className: 'chat-message user-message' });
        msg.textContent = Utils.sanitizeInput(text);
        chatArea.appendChild(msg);
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    function addBotMessage(chatArea, html, animate = true) {
        const msg = Utils.createElement('div', { className: 'chat-message bot-message' });
        msg.innerHTML = html;
        chatArea.appendChild(msg);
        if (animate) Utils.animateIn(msg);
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    function addTypingIndicator(chatArea) {
        const typing = Utils.createElement('div', { className: 'chat-message bot-message typing-indicator' });
        typing.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
        chatArea.appendChild(typing);
        chatArea.scrollTop = chatArea.scrollHeight;
        return typing;
    }

    return { render };
})();
