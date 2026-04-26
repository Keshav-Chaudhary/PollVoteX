/**
 * PollVoteX Internationalization (i18n)
 * =======================================
 * Multi-language support: English, Hindi, Tamil.
 * Adapts content dynamically — not just translation, but context adaptation.
 */
const I18n = (() => {
    'use strict';

    const STORAGE_KEY = 'pollvotex_lang';
    let currentLang = 'en';

    const TRANSLATIONS = {
        en: {
            // Header
            appName: 'PollVoteX',
            tagline: 'Your Step-by-Step Election Navigator',
            simpleLanguage: 'Simple Language',
            highContrast: 'High Contrast',
            tests: 'Tests',
            langLabel: 'Language',
            navPrivacy: 'Privacy & Data',

            // Hero
            heroTitle1: 'Your',
            heroTitleHighlight: 'Step-by-Step',
            heroTitle2: 'Election Navigator',
            heroSubtitle: 'Tell us a few things about yourself, and we\'ll create a personalized election journey — from eligibility to casting your vote.',

            // Form
            letsGetStarted: 'Let\'s Get Started',
            yourAge: 'Your Age',
            enterAge: 'Enter your age',
            yourState: 'Your State / UT',
            selectState: 'Select your state',
            registeredToVote: 'Are you registered to vote?',
            yes: 'Yes',
            no: 'No',
            notSure: 'Not Sure',
            generateJourney: 'Generate My Election Journey',
            selectPersona: 'I am a...',
            selectScenario: 'My situation...',

            // Personas
            personaDefault: 'Regular Voter',
            personaFirstTime: 'First-time Voter',
            personaSenior: 'Senior Citizen',
            personaStudent: 'Student (Away from Home)',
            personaRural: 'Rural Voter',
            personaNRI: 'NRI / Overseas Voter',
            personaDifferentlyAbled: 'Differently-abled Voter',

            // Scenarios
            scenarioNone: 'No special situation',
            scenarioMoved: 'I moved to another city',
            scenarioLostID: 'I lost my Voter ID',
            scenarioFirstTime: 'I\'m voting for the first time',
            scenarioNameMissing: 'My name is missing from voter list',
            scenarioNRI: 'I\'m an overseas Indian',
            scenarioCorrection: 'I need to correct my details',

            // Section titles
            overview: 'Overview',
            explainabilityNav: 'Why?',
            journey: 'Journey',
            checklist: 'Checklist',
            timeline: 'Timeline',
            boothFinder: 'Booth Finder',
            reminders: 'Reminders',
            assistant: 'Assistant',

            // Explainability
            explainabilityTitle: 'Why this journey?',
            explainabilityClassification: 'Classification',
            explainabilityPersona: 'Persona Impact',
            explainabilityScenario: 'Situation Impact',
            yourJourney: 'Your Election Journey',
            journeySubtitle: 'Follow these steps to navigate the election process. Click any step for details.',
            yourChecklist: 'Your Checklist',
            checklistSubtitle: 'Track your preparation progress. Your progress is saved during this session.',
            electionTimeline: 'Election Timeline',
            timelineSubtitle: 'Important dates and milestones for the upcoming election.',
            boothFinderTitle: 'Polling Booth Finder',
            boothFinderSubtitle: 'Find your nearest polling booth location.',
            smartAssistant: 'Smart Assistant',
            assistantSubtitle: 'Have questions about elections? Ask our AI-powered assistant.',
            startOver: 'Start Over',

            // Next Best Action
            nextAction: 'Your Next Best Action',
            doThisNow: 'Do this now →',

            // Trust
            trustTitle: 'Trust & Transparency',
            trustSource: 'Information sourced from',
            trustECI: 'Election Commission of India (eci.gov.in)',
            trustNVSP: 'National Voter Service Portal (nvsp.in)',
            trustLastUpdated: 'Content last verified',
            trustDisclaimer: 'This is an educational tool. Always verify with official sources.',

            // Footer
            footerDisclaimer: 'PollVoteX is an educational tool. Always verify information with official sources.',
            footerPrivacy: 'No personal data is stored permanently. Session data is cleared when you close the tab.',

            // Privacy Page
            privacyTitle: 'Privacy & Security Center',
            privacyIntro: 'PollVoteX is built on the principle of "Privacy by Design." We believe your data belongs to you.',
            privacyLocationTitle: 'Location Services',
            privacyLocationDesc: 'When you use "Locate Me," we access your GPS coordinates to find the nearest polling booth. This data is processed locally in your browser and sent to the OSRM routing engine for distance calculation. We do not store your location history.',
            privacyMicTitle: 'Voice & Microphone',
            privacyMicDesc: 'The microphone is only active when you click the mic button. We use the Web Speech API to convert your speech to text. No audio is ever recorded, saved, or transmitted to external servers.',
            privacyStorageTitle: 'Data & Storage',
            privacyStorageDesc: 'We use local session storage to remember your journey progress. This data never leaves your device and is automatically wiped the moment you close the browser tab.',
            privacyTransparency: '100% Client-Side Processing',
            privacyTransparencyDesc: 'PollVoteX does not have a database. Your personal context (age, state, persona) is used only to generate your local guide.',

            // Validation errors
            errorAge: 'Please enter a valid age between 1 and 150.',
            errorLocation: 'Please select a valid state.',
            errorStatus: 'Please select your registration status.',

            // Voice
            voiceListening: 'Listening...',
            voiceSpeak: 'Read aloud',
            voiceStop: 'Stop reading',
            voiceAsk: 'Ask by voice',

            // Accessibility
            focusMode: 'Focus Mode',
            largeText: 'Large Text',
            dyslexiaFont: 'Dyslexia Font',

            // Offline
            offlineReady: 'App available offline',
            offlineNotice: 'You\'re offline. Some features may be limited.',

            // Adaptive
            needHelp: 'Need help? Switch to simple mode for easier reading.',

            // Dynamic Journey Content (Common)
            greetUnderage: "You're {age} years old — not yet eligible to vote, but your time is coming! Here's what you need to know about preparing for your future as a voter in {location}.",
            greetUnregistered: "Welcome! You're eligible to vote in {location}, but you need to register first. Let's get you started with a step-by-step registration guide.",
            greetRegistered: "Great news! You're a registered voter in {location}. Let's make sure you're fully prepared for Election Day.",
            greetUncertain: "No worries! Let's first verify your voter registration status in {location}, then guide you through the next steps.",
            
            stepEligibility: 'Eligibility Check',
            stepAgeTimeline: 'Your Voting Timeline',
            stepDocuments: 'Gather Documents',
            stepFormFill: 'Fill Registration Form',
            stepSubmit: 'Submit Application',
            stepVerify: 'Verification Process',
            stepVoterId: 'Receive Voter ID (EPIC)',
            stepBoothLookup: 'Find Polling Booth',
            stepVotingPrep: 'Voting Day Preparation',
            stepCastVote: 'Cast Your Vote',
            
            descEligibility: 'You meet the minimum age requirement.',
            descDocuments: 'Collect required documents for registration: Age proof, Address proof, and photos.',
            descFormFill: 'Complete Form 6 online via nvsp.in or at your local ERO office.',
            descBoothLookup: 'Locate your assigned polling station in {location}.',
            descVotingPrep: 'Carry your Voter ID or approved photo ID. Polling: 7 AM - 6 PM.'
        },

        hi: {
            appName: 'PollVoteX',
            tagline: 'आपका चरण-दर-चरण चुनाव मार्गदर्शक',
            simpleLanguage: 'सरल भाषा',
            highContrast: 'हाई कॉन्ट्रास्ट',
            tests: 'परीक्षण',
            langLabel: 'भाषा',

            heroTitle1: 'आपका',
            heroTitleHighlight: 'चरण-दर-चरण',
            heroTitle2: 'चुनाव मार्गदर्शक',
            heroSubtitle: 'अपने बारे में कुछ बातें बताएं, और हम आपके लिए एक व्यक्तिगत चुनाव यात्रा बनाएंगे — पात्रता से लेकर मतदान तक।',

            letsGetStarted: 'शुरू करें',
            yourAge: 'आपकी उम्र',
            enterAge: 'अपनी उम्र दर्ज करें',
            yourState: 'आपका राज्य / केंद्र शासित प्रदेश',
            selectState: 'अपना राज्य चुनें',
            registeredToVote: 'क्या आप मतदाता के रूप में पंजीकृत हैं?',
            yes: 'हाँ',
            no: 'नहीं',
            notSure: 'पता नहीं',
            generateJourney: 'मेरी चुनाव यात्रा बनाएं',
            selectPersona: 'मैं हूँ...',
            selectScenario: 'मेरी स्थिति...',

            personaDefault: 'सामान्य मतदाता',
            personaFirstTime: 'पहली बार मतदाता',
            personaSenior: 'वरिष्ठ नागरिक',
            personaStudent: 'छात्र (घर से दूर)',
            personaRural: 'ग्रामीण मतदाता',
            personaNRI: 'NRI / विदेशी मतदाता',
            personaDifferentlyAbled: 'दिव्यांग मतदाता',

            scenarioNone: 'कोई विशेष स्थिति नहीं',
            scenarioMoved: 'मैं दूसरे शहर में आ गया/गई',
            scenarioLostID: 'मेरा वोटर आईडी खो गया',
            scenarioFirstTime: 'मैं पहली बार वोट कर रहा/रही हूँ',
            scenarioNameMissing: 'वोटर लिस्ट में मेरा नाम नहीं है',
            scenarioNRI: 'मैं विदेश में रहने वाला भारतीय हूँ',
            scenarioCorrection: 'मुझे अपनी जानकारी सुधारनी है',

            overview: 'सारांश',
            explainabilityNav: 'क्यों?',
            journey: 'यात्रा',
            checklist: 'चेकलिस्ट',
            timeline: 'समयरेखा',
            boothFinder: 'बूथ खोजें',
            reminders: 'रिमाइंडर',
            assistant: 'सहायक',

            // Explainability
            explainabilityTitle: 'यह यात्रा क्यों?',
            explainabilityClassification: 'वर्गीकरण',
            explainabilityPersona: 'पर्सोना प्रभाव',
            explainabilityScenario: 'स्थिति प्रभाव',

            yourJourney: 'आपकी चुनाव यात्रा',
            journeySubtitle: 'चुनाव प्रक्रिया को समझने के लिए इन चरणों का पालन करें। विवरण के लिए किसी भी चरण पर क्लिक करें।',
            yourChecklist: 'आपकी चेकलिस्ट',
            checklistSubtitle: 'अपनी तैयारी की प्रगति पर नज़र रखें।',
            electionTimeline: 'चुनाव समयरेखा',
            timelineSubtitle: 'आगामी चुनाव के लिए महत्वपूर्ण तिथियाँ।',
            boothFinderTitle: 'मतदान केंद्र खोजें',
            boothFinderSubtitle: 'अपने निकटतम मतदान केंद्र का पता लगाएं।',
            smartAssistant: 'स्मार्ट सहायक',
            assistantSubtitle: 'चुनाव के बारे में कोई सवाल? हमारे सहायक से पूछें।',
            startOver: 'फिर से शुरू करें',

            nextAction: 'आपका अगला कदम',
            doThisNow: 'अभी करें →',

            trustTitle: 'विश्वास और पारदर्शिता',
            trustSource: 'जानकारी का स्रोत',
            trustECI: 'भारत निर्वाचन आयोग (eci.gov.in)',
            trustNVSP: 'राष्ट्रीय मतदाता सेवा पोर्टल (nvsp.in)',
            trustLastUpdated: 'सामग्री अंतिम बार सत्यापित',
            trustDisclaimer: 'यह एक शैक्षिक उपकरण है। हमेशा आधिकारिक स्रोतों से सत्यापित करें।',

            footerDisclaimer: 'PollVoteX एक शैक्षिक उपकरण है। हमेशा आधिकारिक स्रोतों से जानकारी सत्यापित करें।',
            footerPrivacy: 'कोई व्यक्तिगत डेटा स्थायी रूप से संग्रहीत नहीं किया जाता।',

            errorAge: 'कृपया 1 से 150 के बीच एक वैध उम्र दर्ज करें।',
            errorLocation: 'कृपया एक वैध राज्य चुनें।',
            errorStatus: 'कृपया अपनी पंजीकरण स्थिति चुनें।',

            voiceListening: 'सुन रहे हैं...',
            voiceSpeak: 'ज़ोर से पढ़ें',
            voiceStop: 'पढ़ना बंद करें',
            voiceAsk: 'आवाज़ से पूछें',

            focusMode: 'फोकस मोड',
            largeText: 'बड़ा टेक्स्ट',
            dyslexiaFont: 'डिस्लेक्सिया फ़ॉन्ट',

            offlineReady: 'ऐप ऑफलाइन उपलब्ध है',
            offlineNotice: 'आप ऑफलाइन हैं। कुछ सुविधाएँ सीमित हो सकती हैं।',
            needHelp: 'मदद चाहिए? आसान पढ़ने के लिए सरल मोड में बदलें।',

            // Dynamic Journey Content (Common)
            greetUnderage: "आप {age} साल के हैं — अभी वोट देने के योग्य नहीं हैं, लेकिन आपका समय आ रहा है! {location} में भविष्य के मतदाता के रूप में तैयारी के लिए आपको यह जानना आवश्यक है।",
            greetUnregistered: "स्वागत है! आप {location} में वोट देने के योग्य हैं, लेकिन आपको पहले पंजीकरण करना होगा।",
            greetRegistered: "बड़ी खबर! आप {location} में एक पंजीकृत मतदाता हैं। आइए सुनिश्चित करें कि आप चुनाव दिवस के लिए पूरी तरह तैयार हैं।",
            greetUncertain: "कोई बात नहीं! आइए पहले {location} में आपकी मतदाता पंजीकरण स्थिति सत्यापित करें।",

            stepEligibility: 'पात्रता जांच',
            stepAgeTimeline: 'आपकी मतदान समयरेखा',
            stepDocuments: 'दस्तावेज जमा करें',
            stepFormFill: 'पंजीकरण फॉर्म भरें',
            stepSubmit: 'आवेदन जमा करें',
            stepVerify: 'सत्यापन प्रक्रिया',
            stepVoterId: 'वोटर आईडी (EPIC) प्राप्त करें',
            stepBoothLookup: 'मतदान केंद्र खोजें',
            stepVotingPrep: 'चुनाव दिवस की तैयारी',
            stepCastVote: 'अपना वोट डालें',

            descEligibility: 'आप न्यूनतम आयु आवश्यकता को पूरा करते हैं।',
            descDocuments: 'पंजीकरण के लिए आवश्यक दस्तावेज एकत्र करें: आयु प्रमाण, पता प्रमाण और फोटो।',
            descFormFill: 'nvsp.in के माध्यम से या अपने स्थानीय ERO कार्यालय में फॉर्म 6 भरें।',
            descBoothLookup: '{location} में अपना आवंटित मतदान केंद्र खोजें।',
            descVotingPrep: 'अपना वोटर आईडी या स्वीकृत फोटो आईडी साथ रखें। मतदान: सुबह 7 - शाम 6 बजे।'
        },

        ta: {
            appName: 'PollVoteX',
            tagline: 'உங்கள் படிப்படியான தேர்தல் வழிகாட்டி',
            simpleLanguage: 'எளிய மொழி',
            highContrast: 'உயர் மாறுபாடு',
            tests: 'சோதனைகள்',
            langLabel: 'மொழி',

            heroTitle1: 'உங்கள்',
            heroTitleHighlight: 'படிப்படியான',
            heroTitle2: 'தேர்தல் வழிகாட்டி',
            heroSubtitle: 'உங்களைப் பற்றி சில விஷயங்களைச் சொல்லுங்கள், தகுதி முதல் வாக்களிப்பு வரை — தனிப்பயனாக்கப்பட்ட தேர்தல் பயணத்தை உருவாக்குவோம்.',

            letsGetStarted: 'தொடங்குவோம்',
            yourAge: 'உங்கள் வயது',
            enterAge: 'உங்கள் வயதை உள்ளிடவும்',
            yourState: 'உங்கள் மாநிலம்',
            selectState: 'உங்கள் மாநிலத்தைத் தேர்ந்தெடுக்கவும்',
            registeredToVote: 'நீங்கள் வாக்காளராகப் பதிவு செய்துள்ளீர்களா?',
            yes: 'ஆம்',
            no: 'இல்லை',
            notSure: 'தெரியவில்லை',
            generateJourney: 'எனது தேர்தல் பயணத்தை உருவாக்கு',
            selectPersona: 'நான் ஒரு...',
            selectScenario: 'எனது நிலைமை...',

            personaDefault: 'வழக்கமான வாக்காளர்',
            personaFirstTime: 'முதல் முறை வாக்காளர்',
            personaSenior: 'மூத்த குடிமகன்',
            personaStudent: 'மாணவர் (வீட்டிலிருந்து தொலைவில்)',
            personaRural: 'கிராமப்புற வாக்காளர்',
            personaNRI: 'NRI / வெளிநாட்டு வாக்காளர்',
            personaDifferentlyAbled: 'மாற்றுத்திறனாளி வாக்காளர்',

            scenarioNone: 'சிறப்பு நிலைமை இல்லை',
            scenarioMoved: 'நான் வேறு நகரத்திற்கு மாறிவிட்டேன்',
            scenarioLostID: 'எனது வாக்காளர் அடையாள அட்டை தொலைந்துவிட்டது',
            scenarioFirstTime: 'நான் முதல் முறையாக வாக்களிக்கிறேன்',
            scenarioNameMissing: 'வாக்காளர் பட்டியலில் என் பெயர் இல்லை',
            scenarioNRI: 'நான் வெளிநாட்டில் வசிக்கும் இந்தியர்',
            scenarioCorrection: 'எனது விவரங்களை திருத்த வேண்டும்',

            overview: 'கண்ணோட்டம்',
            explainabilityNav: 'ஏன்?',
            journey: 'பயணம்',
            checklist: 'பட்டியல்',
            timeline: 'காலவரிசை',
            boothFinder: 'சாவடி தேடல்',
            reminders: 'நினைவூட்டல்கள்',
            assistant: 'உதவியாளர்',

            // Explainability
            explainabilityTitle: 'இந்த பயணம் ஏன்?',
            explainabilityClassification: 'வகைப்பாடு',
            explainabilityPersona: 'பாத்திரம் தாக்கம்',
            explainabilityScenario: 'சூழல் தாக்கம்',

            yourJourney: 'உங்கள் தேர்தல் பயணம்',
            journeySubtitle: 'தேர்தல் செயல்முறையை வழிநடத்த இந்த படிகளைப் பின்பற்றுங்கள்.',
            yourChecklist: 'உங்கள் பட்டியல்',
            checklistSubtitle: 'உங்கள் தயாரிப்பு முன்னேற்றத்தைக் கண்காணிக்கவும்.',
            electionTimeline: 'தேர்தல் காலவரிசை',
            timelineSubtitle: 'வரவிருக்கும் தேர்தலுக்கான முக்கிய தேதிகள்.',
            boothFinderTitle: 'வாக்குச்சாவடி தேடல்',
            boothFinderSubtitle: 'உங்களுக்கு அருகிலுள்ள வாக்குச்சாவடியைக் கண்டறியுங்கள்.',
            smartAssistant: 'புத்திசாலி உதவியாளர்',
            assistantSubtitle: 'தேர்தல் பற்றி கேள்விகள்? எங்கள் உதவியாளரிடம் கேளுங்கள்.',
            startOver: 'மீண்டும் தொடங்கு',

            nextAction: 'உங்கள் அடுத்த நடவடிக்கை',
            doThisNow: 'இப்போது செய்யுங்கள் →',

            trustTitle: 'நம்பகத்தன்மை',
            trustSource: 'தகவல் ஆதாரம்',
            trustECI: 'இந்திய தேர்தல் ஆணையம் (eci.gov.in)',
            trustNVSP: 'தேசிய வாக்காளர் சேவை (nvsp.in)',
            trustLastUpdated: 'கடைசியாக சரிபார்க்கப்பட்டது',
            trustDisclaimer: 'இது ஒரு கல்வி கருவி. எப்போதும் அதிகாரப்பூர்வ ஆதாரங்களிடம் சரிபார்க்கவும்.',

            footerDisclaimer: 'PollVoteX ஒரு கல்வி கருவி. எப்போதும் அதிகாரப்பூர்வ ஆதாரங்களிடம் சரிபார்க்கவும்.',
            footerPrivacy: 'தனிப்பட்ட தரவு நிரந்தரமாக சேமிக்கப்படாது.',

            errorAge: 'தயவுசெய்து 1 முதல் 150 வரை சரியான வயதை உள்ளிடவும்.',
            errorLocation: 'தயவுசெய்து சரியான மாநிலத்தைத் தேர்ந்தெடுக்கவும்.',
            errorStatus: 'தயவுசெய்து உங்கள் பதிவு நிலையைத் தேர்ந்தெடுக்கவும்.',

            voiceListening: 'கேட்டுக்கொண்டிருக்கிறது...',
            voiceSpeak: 'சத்தமாக படிக்கவும்',
            voiceStop: 'படிப்பதை நிறுத்து',
            voiceAsk: 'குரலில் கேளுங்கள்',

            focusMode: 'கவனம் பயன்முறை',
            largeText: 'பெரிய எழுத்து',
            dyslexiaFont: 'டிஸ்லெக்சியா எழுத்துரு',

            offlineReady: 'ஆப் ஆஃப்லைனில் கிடைக்கும்',
            offlineNotice: 'நீங்கள் ஆஃப்லைனில் உள்ளீர்கள்.',
            needHelp: 'உதவி வேண்டுமா? எளிதாக படிக்க எளிய பயன்முறைக்கு மாறுங்கள்.',

            // Personas & Scenarios
            personaDefault: 'வழக்கமான வாக்காளர்',
            personaFirstTime: 'முதல் முறை வாக்காளர்',
            personaSenior: 'மூத்த குடிமகன்',
            personaStudent: 'மாணவர் (வீட்டிலிருந்து தொலைவில்)',
            personaRural: 'கிராமப்புற வாக்காளர்',
            personaNRI: 'NRI / வெளிநாட்டு வாக்காளர்',
            personaDifferentlyAbled: 'மாற்றுத்திறனாளி வாக்காளர்',

            scenarioNone: 'சிறப்பு நிலைமை இல்லை',
            scenarioMoved: 'நான் வேறு நகரத்திற்கு மாறிவிட்டேன்',
            scenarioLostID: 'எனது வாக்காளர் அடையாள அட்டை தொலைந்துவிட்டது',
            scenarioFirstTime: 'நான் முதல் முறையாக வாக்களிக்கிறேன்',
            scenarioNameMissing: 'வாக்காளர் பட்டியலில் என் பெயர் இல்லை',
            scenarioNRI: 'நான் வெளிநாட்டில் வசிக்கும் இந்தியர்',
            scenarioCorrection: 'எனது விவரங்களை திருத்த வேண்டும்',

            // Dynamic Journey Content (Common)
            greetUnderage: "{age} வயதான நீங்கள் — இன்னும் வாக்களிக்கத் தகுதியடையவில்லை, ஆனால் உங்கள் நேரம் நெருங்குகிறது! {location} இல் எதிர்கால வாக்காளராகத் தயாராவதற்கு நீங்கள் தெரிந்து கொள்ள வேண்டியவை இதோ.",
            greetUnregistered: "வரவேற்கிறோம்! நீங்கள் {location} இல் வாக்களிக்கத் தகுதியுடையவர், ஆனால் நீங்கள் முதலில் பதிவு செய்ய வேண்டும்.",
            greetRegistered: "சிறந்த செய்தி! நீங்கள் {location} இல் பதிவுசெய்யப்பட்ட வாக்காளர். தேர்தல் தினத்திற்கு நீங்கள் முழுமையாகத் தயாராக இருப்பதை உறுதி செய்வோம்.",
            greetUncertain: "கவலைப்பட வேண்டாம்! முதலில் {location} இல் உங்கள் வாக்காளர் பதிவு நிலையைச் சரிபார்ப்போம்.",

            stepEligibility: 'தகுதிச் சரிபார்ப்பு',
            stepAgeTimeline: 'உங்கள் வாக்களிப்பு காலவரிசை',
            stepDocuments: 'ஆவணங்களைச் சேகரிக்கவும்',
            stepFormFill: 'பதிவுப் படிவத்தை நிரப்பவும்',
            stepSubmit: 'விண்ணப்பத்தைச் சமர்ப்பிக்கவும்',
            stepVerify: 'சரிபார்ப்பு செயல்முறை',
            stepVoterId: 'வாக்காளர் அடையாள அட்டையைப் (EPIC) பெறவும்',
            stepBoothLookup: 'வாக்குச்சாவடியைக் கண்டறியவும்',
            stepVotingPrep: 'வாக்களிப்பு தினத் தயாரிப்பு',
            stepCastVote: 'உங்கள் வாக்கைச் செலுத்தவும்',

            descEligibility: 'நீங்கள் குறைந்தபட்ச வயதுத் தகுதியைப் பூர்த்தி செய்கிறீர்கள்.',
            descDocuments: 'பதிவு செய்வதற்குத் தேவையான ஆவணங்களைச் சேகரிக்கவும்: வயதுச் சான்று, முகவரிச் சான்று மற்றும் புகைப்படங்கள்.',
            descFormFill: 'nvsp.in வழியாக அல்லது உங்கள் உள்ளூர் ERO அலுவலகத்தில் படிவம் 6-ஐ நிரப்பவும்.',
            descBoothLookup: '{location} இல் உங்களுக்காக ஒதுக்கப்பட்ட வாக்குச்சாவடியைக் கண்டறியவும்.',
            descVotingPrep: 'உங்கள் வாக்காளர் அடையாள அட்டை அல்லது அங்கீகரிக்கப்பட்ட புகைப்பட அடையாள அட்டையை எடுத்துச் செல்லுங்கள். வாக்குப்பதிவு: காலை 7 - மாலை 6 மணி.'
        }
    };

    function init() {
        const saved = Utils.Session.load(STORAGE_KEY);
        if (saved) currentLang = saved;
        applyLanguage();
    }

    function setLanguage(lang) {
        if (!TRANSLATIONS[lang]) return;
        currentLang = lang;
        Utils.Session.save(STORAGE_KEY, lang);
        applyLanguage();
    }

    function t(key, params = {}) {
        let text = (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key]) ||
                   TRANSLATIONS.en[key] || key;
        
        Object.keys(params).forEach(p => {
            text = text.replace(`{${p}}`, params[p]);
        });
        return text;
    }

    function applyLanguage() {
        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = t(key);
            if (el.tagName === 'INPUT') {
                el.placeholder = translation;
            } else if (el.tagName === 'OPTION' && el.value === '') {
                el.textContent = translation;
            } else {
                el.textContent = translation;
            }
        });

        // Update elements with data-i18n-html (for innerHTML)
        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            const key = el.getAttribute('data-i18n-html');
            el.innerHTML = t(key);
        });

        // Update lang selector
        const langSelect = document.getElementById('language-selector');
        if (langSelect) langSelect.value = currentLang;

        // Set document lang
        document.documentElement.lang = currentLang === 'hi' ? 'hi' : currentLang === 'ta' ? 'ta' : 'en';
    }

    function getCurrentLang() { return currentLang; }
    function getAvailableLanguages() { return Object.keys(TRANSLATIONS); }

    return { init, setLanguage, t, applyLanguage, getCurrentLang, getAvailableLanguages };
})();
