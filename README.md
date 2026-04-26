# PollVoteX — Your Step-by-Step Election Navigator

> A smart, interactive web application that guides users through the Indian election process based on their personal context, replacing static election information with a personalized navigation experience.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Google Maps](https://img.shields.io/badge/Google_Maps-4285F4?style=flat&logo=googlemaps&logoColor=white)
![Google Calendar](https://img.shields.io/badge/Google_Calendar-4285F4?style=flat&logo=googlecalendar&logoColor=white)

---

## 📋 Project Overview

PollVoteX is not just another election information website — it's a **navigation system** for democracy. Instead of dumping all election-related information on users, it asks a few simple questions and generates a **personalized election journey** with step-by-step guidance, interactive checklists, timelines, polling booth locations, and a smart assistant.

### Who is this for?

- 🌟 **First-time voters** who don't know where to start
- 📝 **Unregistered citizens** who need registration guidance
- ✅ **Registered voters** preparing for election day
- 🎂 **Underage citizens** who want to understand the process for the future
- 🤔 **Anyone unsure** about their registration status
- 👴 **Senior citizens** needing priority access information
- 🎓 **Students** studying away from home
- 🌾 **Rural voters** with limited digital access
- ✈️ **NRI voters** needing overseas registration help
- ♿ **Differently-abled voters** needing accessibility support

---

## ✨ Features

### Core Features
| Feature | Description |
|---------|-------------|
| 🧠 **Context-Aware Decision Engine** | Analyzes age, location, registration status, persona, and scenario |
| 🗺️ **Journey Tracker** | Visual step-by-step navigator with progress tracking |
| ✅ **Dynamic Checklist** | Interactive preparation checklist with session persistence |
| 📅 **Timeline Engine** | Election milestone timeline with countdown |
| 🤖 **Sophisticated AI Assistant** | Intent-based natural language simulation with context memory |
| 📍 **Polling Booth Finder** | Mock/real Google Maps integration |
| 🔔 **Vote Reminders** | Mock/real Google Calendar integration |
| ☁️ **Google Cloud Integration** | Native Google Maps JavaScript API, Directions Service, and Geocoding |
| ⏱️ **Next Best Action** | Always-visible widget showing the most important next step |
| 🧑‍🤝‍🧑 **Community Personas** | 7 personas with tailored guidance (student, senior, NRI, etc.) |
| 🧭 **Scenario-Based Guidance** | 7 real-life scenarios (moved city, lost ID, first vote, etc.) |
| 🔍 **Trust & Transparency** | Source attribution and last-verified dates |

### Accessibility
| Feature | Description |
|---------|-------------|
| 🗣️ **Multi-Language** | English, Hindi (हिन्दी), Tamil (தமிழ்) with full UI translation |
| 🎧 **Voice Interaction** | Speech-to-text input + text-to-speech read-aloud (Web Speech API) |
| 📖 **Simple Language Mode** | Auto-replaces jargon (e.g., "Electoral Roll" → "Voter List") |
| 🌗 **High Contrast Mode** | WCAG AAA compliant dark theme |
| 🔤 **Large Text Mode** | Increased font sizes for better readability |
| 🅰️ **Dyslexia Font Mode** | OpenDyslexic font for dyslexic users |
| 🎯 **Focus Mode** | Removes distractions, shows only essential content |
| ⌨️ **Keyboard Navigation** | Full keyboard accessibility with focus management |
| 🔇 **Reduced Motion** | Respects `prefers-reduced-motion` media query |
| 🧠 **Adaptive UI** | Detects user confusion and suggests simple mode |

### Inclusivity
| Feature | Description |
|---------|-------------|
| 🌟 **First-time Voter** | Extra learning steps, EVM explanation, do's/don'ts |
| 👴 **Senior Citizen** | Priority queue info, postal ballot eligibility |
| 🎓 **Student** | Home vs college registration guidance |
| 🌾 **Rural Voter** | Transport info, helpline numbers, local BLO contact |
| ✈️ **NRI Voter** | Form 6A, passport requirements, travel planning |
| ♿ **Differently-abled** | Companion assistance, postal ballot, booth accessibility |

### Usability
| Feature | Description |
|---------|-------------|
| ⏱️ **Next-Step Engine** | Prominent "What should you do next?" widget |
| 📅 **Timeline + Checklist** | Interactive progress tracking |
| 🧩 **Offline Mode** | Service Worker caches app for offline use |
| 🔄 **Session Restore** | Automatically restores your journey on revisit |

### Security
| Feature | Description |
|---------|-------------|
| 🔒 **No permanent storage** | sessionStorage only, cleared on tab close |
| 🛡️ **Input sanitization** | XSS prevention via HTML entity encoding |
| ✅ **Whitelist validation** | Location validated against state list |
| 🚫 **No external data** | All logic runs client-side |
| ⚠️ **Controlled responses** | Assistant uses curated knowledge base only |
| 🔐 **Frozen config** | `Object.freeze()` prevents runtime tampering |

---

## 🏗️ Architecture

```
PollVoteX/
├── index.html              # Single-page application entry point
├── sw.js                   # Service Worker for offline support
├── README.md               # This file
├── css/
│   ├── styles.css          # Core design system
│   ├── components.css      # Component styles
│   └── accessibility.css   # Accessibility mode overrides
└── js/
    ├── config.js           # Configuration & API toggle
    ├── utils.js            # Validation, sanitization, helpers
    ├── i18n.js             # Multi-language (EN/HI/TA)
    ├── personas.js         # Community personas & scenarios
    ├── voice.js            # Speech-to-text & text-to-speech
    ├── decisionEngine.js   # Core decision logic
    ├── journeyTracker.js   # Step-by-step journey UI
    ├── checklist.js        # Interactive checklist
    ├── timeline.js         # Election milestone timeline
    ├── assistant.js        # Smart Q&A panel
    ├── googleServices.js   # Google Maps + Calendar (mock/real)
    ├── accessibility.js    # A11Y toggles & adaptive UI
    ├── tests.js            # Automated test suite
    └── app.js              # Main controller
```

### Design Principles
- **Separation of Concerns** — UI, business logic, and services in separate modules
- **Pure Functions** — Decision engine uses pure functions with no side effects
- **Module Pattern** — Each module is an IIFE with a clean public API
- **Zero Dependencies** — No external JavaScript libraries
- **Progressive Enhancement** — Offline-capable via Service Worker

---

## 🧠 Decision Logic

### User Classification Matrix

| Age | Registration | User Type | Journey Steps |
|-----|-------------|-----------|---------------|
| < 18 | Any | `underage` | Eligibility → Age Timeline → Pre-registration → Future Voter Guide |
| ≥ 18 | No | `unregistered` | Eligibility ✓ → Documents → Form 6 → Submit → Verification → Voter ID → Booth |
| ≥ 18 | Yes | `registered` | Eligibility ✓ → Verify Details → Booth Lookup → Voting Day Prep → Cast Vote |
| ≥ 18 | Not Sure | `uncertain` | Eligibility ✓ → Status Check → Branch (registered/unregistered path) |

### Persona Modifiers (7 types)

| Persona | Extra Steps |
|---------|-------------|
| First-time Voter | Understand Voting + Mock Vote practice |
| Senior Citizen | Priority queue + Postal ballot eligibility |
| Student | Home vs college registration + Transfer guide |
| Rural Voter | Transport arrangements + Helpline numbers |
| NRI Voter | Form 6A + Passport requirements + Travel planning |
| Differently-abled | Companion assistance + Postal ballot option |

### Scenario Overrides (7 situations)

| Scenario | Special Path |
|----------|-------------|
| Moved to another city | Delete old registration → New Form 6 → New booth |
| Lost voter ID | Police complaint → Duplicate EPIC → Alternative IDs |
| First-time voting | Basics → EVM explanation → Do's and Don'ts |
| Name missing from list | Multiple search methods → Fresh registration |
| NRI voter | Passport → Form 6A → Physical presence planning |
| Need corrections | Identify changes → Form 8 → Track status |

---

## 🌐 Google Services Integration

### Config-Driven Toggle

```javascript
// js/config.js
const CONFIG = {
    USE_REAL_APIS: false,  // Set to true for real Google APIs
    GOOGLE_MAPS_API_KEY: '',  // Add your key here
};
```

### Google Maps

| Mode | Behavior |
|------|----------|
| **Mock** (default) | Simulated map with booth markers and directions links |
| **Real** | Google Maps Embed API with live geocoding |

### Google Calendar

| Mode | Behavior |
|------|----------|
| **Mock** (default) | Shows confirmation toast with event details |
| **Real** | Opens Google Calendar with pre-filled event |

---

## 🔒 Security Considerations

1. **No Permanent Storage** — sessionStorage only
2. **Input Sanitization** — HTML entity encoding via `Utils.sanitizeInput()`
3. **Whitelist Validation** — State validated against hardcoded list
4. **Client-Side Only** — No data transmitted to servers
5. **Controlled AI** — Curated knowledge base, no LLM calls
6. **Content Disclaimers** — All responses include verification notices
7. **Frozen Config** — `Object.freeze()` prevents tampering
8. **No Tracking** — Zero analytics or user tracking

---

## 🧪 Testing Approach

### Automated Test Suite (8 scenarios)

| # | Scenario | Validates |
|---|----------|-----------|
| 1 | Underage (16, MH) | Underage path, 4 steps |
| 2 | New voter (20, KA) | Unregistered path, 7 steps |
| 3 | Registered (35, DL) | Registered path, 5 steps |
| 4 | Uncertain (25, TN) | Uncertain path, 4 steps |
| 5 | Edge case (18, KL) | Correctly classified |
| 6 | Invalid age (-5) | Validation rejects |
| 7 | Invalid age (200) | Validation rejects |
| 8 | XSS attempt | Sanitization blocks |

**Run tests:** Click 🧪 Tests button in the header.

---

## 🚀 Setup & Usage

### Quick Start

```bash
git clone <repo-url>
cd PromptWars

# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Or simply open index.html directly
```

### Requirements
- Any modern browser (Chrome, Firefox, Safari, Edge)
- No build tools, no npm install, no dependencies
- Internet only for Google Fonts (optional — falls back to system fonts)

---

## 🔮 Future Improvements

- [ ] Real Gemini API integration for dynamic Q&A
- [ ] Firebase Auth for persistent user state
- [ ] PWA manifest for app-like experience
- [ ] More regional languages (Bengali, Telugu, Malayalam, Kannada)
- [ ] Real ECI booth search API integration
- [ ] Voter education quizzes
- [ ] Social sharing
- [ ] Push notifications
- [ ] Analytics dashboard (anonymous)
- [ ] Full WCAG 2.1 AA audit

---

## 📄 License

This project is built for educational and civic engagement purposes.

---

<p align="center">
  <strong>🗳️ Every vote counts. Make yours matter.</strong>
</p>
