# PollVoteX — Project Report

## 1. Project Overview

**PollVoteX** is an interactive, accessibility-first web application that guides Indian citizens through the election process. It generates personalized voter journeys based on user context (age, location, registration status, persona, and scenario).

| Attribute | Detail |
|-----------|--------|
| **Type** | Single-page web application (SPA) |
| **Tech Stack** | Vanilla HTML5, CSS3, JavaScript (ES6+) |
| **Target Users** | Indian voters, first-time voters, NRIs, senior citizens, students, PwD |
| **Data Sources** | Election Commission of India (ECI), NVSP Portal |
| **Offline Support** | Service Worker (PWA-ready) |

---

## 2. Architecture & File Structure

```
PromptWars/
├── index.html              # Main application shell
├── sw.js                   # Service Worker for offline support
├── css/
│   ├── styles.css          # Design tokens, layout, hero, forms, animations
│   ├── components.css      # Component-specific styles (journey, checklist, chat, map, tests)
│   └── accessibility.css   # Reduced motion, dark mode, high contrast, dyslexia font
├── js/
│   ├── config.js           # App configuration, constants, mock data
│   ├── utils.js            # Validation, sanitization, helpers, session storage
│   ├── i18n.js             # Internationalization (EN, HI, TA)
│   ├── personas.js         # Persona & scenario definitions with extra steps/checklists
│   ├── voice.js            # Text-to-speech and speech-to-text integration
│   ├── decisionEngine.js   # Core logic: analyzes input, generates personalized output
│   ├── journeyTracker.js   # Duolingo-style stepper UI component
│   ├── checklist.js        # Interactive checklist with progress tracking
│   ├── timeline.js         # Election timeline with date calculations
│   ├── assistant.js        # AI-powered chat assistant (Intercom-style)
│   ├── aiAssistant.js      # Advanced Intent-based AI logic (Simulated LLM)
│   ├── googleCloudIntegration.js # Google Maps SDK, Places Autocomplete, Geocoding, and Directions |
│   ├── googleServices.js   # Google Maps & Calendar integration (mock/real toggle)
│   ├── accessibility.js    # Accessibility toggles (simple language, high contrast, etc.)
│   ├── tests.js            # Automated test suite (Vercel-style UI)
│   └── app.js              # Main orchestrator: initialization, form handling, rendering
└── PROJECT_REPORT.md       # This document
```

---

## 3. Core Features

### 3.1 Personalized Journey Generation
- **Decision Engine** analyzes user input and categorizes into 4 types: `underage`, `unregistered`, `registered`, `uncertain`
- Generates tailored greeting, journey steps, checklist, timeline, and guidance

### 3.2 Persona & Scenario System
- **7 Personas**: default, first-time, senior, student, rural, NRI, differently-abled
- **6 Scenarios**: moved, lost-id, first-vote, name-missing, NRI-voter, correction
- Each adds contextual steps and checklist items

### 3.3 Interactive Components
| Component | Style Inspiration | Key Features |
|-----------|-------------------|--------------|
| Journey Tracker | Duolingo | Animated progress bar, expandable step cards, status badges |
| Checklist | Notion | Custom animated checkboxes, category grouping, circular progress |
| Timeline | Linear | Glowing nodes, past/future states, day countdown badges |
| Assistant | Intercom | Dynamic context-aware Q&A, typing indicator, suggestion chips |
| Map | Google Maps | Mock map with pins, booth cards, directions links |
| Test Suite | Vercel | Dark terminal UI, pass/fail indicators, detailed logs |

### 3.4 Accessibility Features
- Simple Language mode (plain words)
- High Contrast / Dark Mode toggle
- OpenDyslexic font support
- Large Text mode
- Focus Mode (hides non-essential UI)
- `prefers-reduced-motion` support
- Full keyboard navigation
- ARIA labels and screen-reader support

### 3.5 Internationalization
- Multi-language support: English (EN), Hindi (HI), Tamil (TA)
- Language selector in header
- Dynamic re-rendering on language change

---

## 4. Bugs Identified & Fixed

### Bug 1: JavaScript Syntax Error (CRITICAL)
- **File**: `js/app.js`
- **Issue**: `document.getElementById('results-section')?.style.display = 'none';`
- **Problem**: Optional chaining (`?.`) on left-hand side of assignment is invalid JS syntax
- **Impact**: Entire `app.js` failed to parse; `App.init()` never ran; app completely broken
- **Fix**: Replaced with null-checked variable assignments

### Bug 2: Stray Closing Brace
- **File**: `js/decisionEngine.js`
- **Issue**: Stray `}` in `generateTimeline()` function body
- **Impact**: JS syntax error preventing module load
- **Fix**: Removed the stray brace

### Bug 3: Undefined CSS Variable
- **File**: `index.html`
- **Issue**: SVG hero wave used `fill="var(--surface-2)"` which doesn't exist
- **Impact**: Hero wave rendered transparent/invisible
- **Fix**: Changed to `fill="var(--surface)"`

### Bug 4: CSS/JS Class Mismatch
- **File**: `js/accessibility.js`
- **Issue**: Escape key handler added `.collapsed` class, but CSS only uses `.expanded`
- **Impact**: Pressing Escape did not collapse expanded step details
- **Fix**: Changed to `d.classList.remove('expanded')`

### Bug 5: Duplicate CSS Rules
- **File**: `css/components.css`
- **Issue**: Duplicate standalone `.chat-messages` and `.assistant-send` blocks
- **Impact**: Code bloat, potential specificity conflicts
- **Fix**: Removed duplicate blocks (combined selectors already covered both class names)

---

## 5. Current Status

| Check | Status |
|-------|--------|
| All JS files parse without syntax errors | ✅ |
| Dropdowns populate (State, Persona, Scenario) | ✅ |
| Theme toggle functional | ✅ |
| Language translation functional | ✅ |
| Form submission & journey generation | ✅ |
| Hero wave renders correctly | ✅ |
| Step accordion close on Escape | ✅ |
| No duplicate CSS rules | ✅ |
| Service Worker registration | ✅ |
| Offline support | ✅ |

---

## 6. Configuration

Key settings in `js/config.js`:

| Setting | Value | Description |
|---------|-------|-------------|
| `USE_REAL_APIS` | `false` | Toggle between mock and real Google APIs |
| `ELECTION_DATE` | `2026-11-15` | Upcoming election date |
| `REGISTRATION_DEADLINE` | `2026-09-30` | Last date to register |
| `MIN_VOTING_AGE` | `18` | Minimum voting age in India |
| `GOOGLE_CALENDAR_ENABLED` | `true` | Enable calendar reminder links |

---

## 7. How to Run

1. Open `index.html` in any modern browser
2. No build step required — pure static files
3. For development, serve via any static server (e.g., `npx serve` or VS Code Live Server)
4. To use real Google Maps: set `USE_REAL_APIS: true` and add your API key in `config.js`

---

## 8. Future Enhancements

- [ ] Add more Indian languages (Bengali, Telugu, Marathi, Gujarati)
- [ ] Integrate real ECI API for live voter registration status
- [ ] Add push notifications for election reminders
- [ ] Implement progressive web app (PWA) install prompt
- [ ] Add social sharing for personalized journey summaries
- [ ] Expand test coverage with unit tests for decision engine

---

*Report generated after bug-fix sprint. All critical issues resolved.*
