/**
 * PollVoteX Voice Interaction
 * =============================
 * Speech-to-text (voice input) and Text-to-speech (read aloud).
 * Uses Web Speech API — no external dependencies.
 * Inclusive for low-literacy users.
 */
const Voice = (() => {
    'use strict';

    let synthesis = null;
    let recognition = null;
    let isReading = false;
    let isListening = false;

    function init() {
        synthesis = window.speechSynthesis || null;
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition = new SpeechRecognition();
            recognition.lang = getLang();
            recognition.continuous = false;
            recognition.interimResults = false;
        }
    }

    function getLang() {
        const lang = I18n.getCurrentLang();
        if (lang === 'hi') return 'hi-IN';
        if (lang === 'ta') return 'ta-IN';
        return 'en-IN';
    }

    /** Text-to-Speech: Read text aloud */
    function speak(text, onEnd) {
        if (!synthesis) return;
        stop();
        const utterance = new SpeechSynthesisUtterance(stripHTML(text));
        utterance.lang = getLang();
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.onend = () => {
            isReading = false;
            if (onEnd) onEnd();
        };
        isReading = true;
        synthesis.speak(utterance);
    }

    /** Stop speaking */
    function stop() {
        if (synthesis) {
            synthesis.cancel();
            isReading = false;
        }
    }

    /** Read a section aloud by collecting its text content */
    function readSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return;
        const text = section.innerText;
        speak(text);
    }

    /** Speech-to-Text: Start listening */
    function listen(callback) {
        if (!recognition) {
            Utils.showToast('Speech recognition is not supported in this browser.');
            return;
        }
        
        recognition.lang = getLang();

        recognition.onstart = () => {
            isListening = true;
            updateMicButton(true);
            if (navigator.vibrate) navigator.vibrate(50); // Haptic feedback
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            if (callback) callback(transcript);
        };

        recognition.onerror = (event) => {
            let msg = 'Voice recognition error.';
            const btn = document.getElementById('voice-input-btn');
            
            switch (event.error) {
                case 'not-allowed':
                    msg = 'Microphone access denied. Please check your browser site permissions.';
                    if (btn) btn.classList.add('btn-error-shake');
                    break;
                case 'no-speech':
                    msg = 'No speech detected. Please try again.';
                    break;
                case 'network':
                    msg = 'Network connection error. Voice requires internet.';
                    break;
                case 'service-not-allowed':
                    msg = 'Voice service is not allowed by the browser.';
                    break;
            }
            
            Utils.showToast(msg);
            updateMicButton(false);
            setTimeout(() => { if (btn) btn.classList.remove('btn-error-shake'); }, 500);
        };

        recognition.onend = () => {
            isListening = false;
            updateMicButton(false);
        };

        recognition.start();
    }

    function updateMicButton(active) {
        const btn = document.getElementById('voice-input-btn');
        if (btn) {
            btn.classList.toggle('listening', active);
            btn.setAttribute('aria-label', active ? I18n.t('voiceListening') : I18n.t('voiceAsk'));
        }
    }


    function stripHTML(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }

    function isSupported() {
        return !!(window.speechSynthesis || window.SpeechRecognition || window.webkitSpeechRecognition);
    }

    function getIsReading() { return isReading; }
    function getIsListening() { return isListening; }

    return { init, speak, stop, readSection, listen, isSupported, getIsReading, getIsListening };
})();
