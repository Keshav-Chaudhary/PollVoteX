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
            alert('Speech recognition is not supported in this browser. Please use Chrome.');
            return;
        }
        recognition.lang = getLang();
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            isListening = false;
            if (callback) callback(transcript);
        };
        recognition.onerror = (event) => {
            isListening = false;
            console.warn('Speech recognition error:', event.error);
        };
        recognition.onend = () => {
            isListening = false;
            updateMicButton(false);
        };
        isListening = true;
        updateMicButton(true);
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
