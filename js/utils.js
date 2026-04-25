/**
 * PollVoteX Utilities
 * ====================
 * Input validation, sanitization, and helper functions.
 */
const Utils = (() => {
    'use strict';

    function sanitizeInput(str) {
        if (typeof str !== 'string') return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g, '&#x2F;')
            .trim().slice(0, CONFIG.MAX_INPUT_LENGTH);
    }

    function validateAge(input) {
        const age = parseInt(input, 10);
        if (isNaN(age) || age < 1 || age > 150) {
            return { valid: false, value: null, error: 'Please enter a valid age between 1 and 150.' };
        }
        return { valid: true, value: age, error: null };
    }

    function validateLocation(location) {
        const sanitized = sanitizeInput(location);
        const decoded = sanitized.replace(/&amp;/g, '&').replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>').replace(/&quot;/g, '"')
            .replace(/&#x27;/g, "'").replace(/&#x2F;/g, '/');
        if (!decoded || !CONFIG.STATES.includes(decoded)) {
            return { valid: false, value: null, error: 'Please select a valid state.' };
        }
        return { valid: true, value: decoded, error: null };
    }

    function validateRegistration(status) {
        const allowed = ['yes', 'no', 'not-sure'];
        if (!allowed.includes(status)) {
            return { valid: false, value: null, error: 'Please select your registration status.' };
        }
        return { valid: true, value: status, error: null };
    }

    function formatDate(dateStr) {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    function daysUntil(dateStr) {
        const target = new Date(dateStr);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        target.setHours(0, 0, 0, 0);
        return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    }

    function turnsEighteenDate(currentAge) {
        const yearsLeft = CONFIG.MIN_VOTING_AGE - currentAge;
        const date = new Date();
        date.setFullYear(date.getFullYear() + yearsLeft);
        return date;
    }

    function debounce(fn, ms = 300) {
        let timer;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), ms);
        };
    }

    function generateId(prefix = 'pvx') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }

    const Session = {
        save(key, data) {
            try { sessionStorage.setItem(key, JSON.stringify(data)); } catch (e) { console.warn('Session storage unavailable:', e); }
        },
        load(key) {
            try { const d = sessionStorage.getItem(key); return d ? JSON.parse(d) : null; } catch (e) { return null; }
        },
        clear(key) {
            try { key ? sessionStorage.removeItem(key) : sessionStorage.clear(); } catch (e) { /* noop */ }
        }
    };

    function animateIn(element, delay = 0) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        setTimeout(() => {
            element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, delay);
    }

    function createElement(tag, attrs = {}, children = []) {
        const el = document.createElement(tag);
        Object.entries(attrs).forEach(([key, val]) => {
            if (key === 'className') el.className = val;
            else if (key === 'innerHTML') el.innerHTML = val;
            else if (key === 'textContent') el.textContent = val;
            else if (key.startsWith('on')) el.addEventListener(key.slice(2).toLowerCase(), val);
            else el.setAttribute(key, val);
        });
        children.forEach(child => {
            if (typeof child === 'string') el.appendChild(document.createTextNode(child));
            else if (child instanceof Node) el.appendChild(child);
        });
        return el;
    }

    return { sanitizeInput, validateAge, validateLocation, validateRegistration, formatDate, daysUntil, turnsEighteenDate, debounce, generateId, Session, animateIn, createElement };
})();
