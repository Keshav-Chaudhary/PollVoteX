/**
 * PollVoteX Utilities
 * ====================
 * Input validation, sanitization, and helper functions.
 */
const Utils = (() => {
    'use strict';
    
    /** @namespace */
    const logger = {
        info: (msg) => console.log(`%c[PVX-INFO] ${msg}`, 'color: #1A73E8'),
        error: (msg, err) => console.error(`%c[PVX-ERROR] ${msg}`, 'color: #D93025', err),
        warn: (msg) => console.warn(`%c[PVX-WARN] ${msg}`, 'color: #F9AB00')
    };

    /**
     * Sanitizes input to prevent XSS.
     * @param {string} str - The raw input string.
     * @returns {string} - The safe, encoded string.
     */
    function sanitizeInput(str) {
        if (typeof str !== 'string') return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g, '&#x2F;')
            .trim().slice(0, CONFIG.MAX_INPUT_LENGTH);
    }

    /**
     * Validates age within legal and biological boundaries.
     * @param {string|number} input - Age input.
     * @returns {object} Validation result object.
     */
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

    /**
     * Enhanced DOM element creator.
     * @param {string} tag - HTML tag.
     * @param {Object} attrs - Attributes and event listeners.
     * @param {Array<Node|string>} children - Child elements or text.
     * @returns {HTMLElement}
     */
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

    function showToast(message, duration = 4000) {
        let toast = document.getElementById('pvx-toast');
        if (!toast) {
            toast = createElement('div', { className: 'toast', id: 'pvx-toast' });
            document.body.appendChild(toast);
        }

        // Add message and close button
        toast.innerHTML = `<span>${message}</span><button class="toast-close" aria-label="Close">&times;</button>`;
        
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.onclick = () => {
            toast.classList.remove('toast-show');
            if (toast.timer) clearTimeout(toast.timer);
        };

        toast.classList.add('toast-show');
        if (toast.timer) clearTimeout(toast.timer);
        toast.timer = setTimeout(() => toast.classList.remove('toast-show'), duration);
    }

    return { sanitizeInput, validateAge, validateLocation, validateRegistration, formatDate, daysUntil, turnsEighteenDate, debounce, generateId, Session, animateIn, createElement, showToast, logger };
})();
