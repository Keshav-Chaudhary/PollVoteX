/**
 * PollVoteX Configuration
 * ========================
 * Toggle between mock and real Google API integrations.
 * To use real APIs, set USE_REAL_APIS to true and provide your API keys.
 */

const CONFIG = {
    // ── API Mode Toggle ──────────────────────────────────────────────
    // Set to true to use real Google APIs. Set to false for mock/demo mode.
    USE_REAL_APIS: true,

    // ── Google Maps ──────────────────────────────────────────────────
    // Required when USE_REAL_APIS is true.
    // Get your key: https://console.cloud.google.com/apis/credentials
    GOOGLE_MAPS_API_KEY: '',

    // ── Google Calendar ──────────────────────────────────────────────
    // No API key needed — uses Google Calendar URL scheme.
    // This flag just controls whether we open real Google Calendar or show mock UI.
    GOOGLE_CALENDAR_ENABLED: true,

    // ── Election Defaults ────────────────────────────────────────────
    ELECTION_DATE: '2026-11-15',
    ELECTION_NAME: 'General Election 2026',
    REGISTRATION_DEADLINE: '2026-09-30',
    VOTER_LIST_PUBLICATION: '2026-10-15',
    RESULT_DATE: '2026-11-20',

    // ── App Settings ─────────────────────────────────────────────────
    MIN_VOTING_AGE: 18,
    SESSION_KEY: 'pollvotex_session',
    MAX_INPUT_LENGTH: 100,

    // ── Map Settings ─────────────────────────────────────────────────
    MAP_DEFAULT_CENTER: [20.5937, 78.9629], // India center
    MAP_DEFAULT_ZOOM: 5,
    MAP_BOOTH_ZOOM: 12,

    // ── Indian States (Whitelist for validation) ─────────────────────
    STATES: [
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
        'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
        'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
        'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha',
        'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
        'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
        'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry',
        'Chandigarh', 'Andaman & Nicobar Islands', 'Dadra & Nagar Haveli and Daman & Diu',
        'Lakshadweep'
    ],

    // ── Mock Polling Booth Data ──────────────────────────────────────
    MOCK_BOOTHS: {
        'Delhi': [
            { name: 'Government Senior Secondary School, Saket', address: 'Saket, New Delhi - 110017', lat: 28.5244, lng: 77.2067 },
            { name: 'MCD Primary School, Lajpat Nagar', address: 'Lajpat Nagar II, New Delhi - 110024', lat: 28.5700, lng: 77.2400 },
            { name: 'Community Hall, Dwarka Sector 6', address: 'Dwarka Sec 6, New Delhi - 110075', lat: 28.5921, lng: 77.0460 }
        ],
        'Maharashtra': [
            { name: 'BMC School, Andheri West', address: 'Andheri West, Mumbai - 400058', lat: 19.1364, lng: 72.8296 },
            { name: 'Zilla Parishad School, Pune Station', address: 'Pune Station, Pune - 411001', lat: 18.5285, lng: 73.8742 },
            { name: 'Government School, Nagpur', address: 'Sitabuldi, Nagpur - 440012', lat: 21.1458, lng: 79.0882 }
        ],
        'Karnataka': [
            { name: 'BBMP School, Jayanagar', address: 'Jayanagar 4th Block, Bangalore - 560011', lat: 12.9279, lng: 77.5831 },
            { name: 'Government School, Mysuru', address: 'Mysuru - 570001', lat: 12.2958, lng: 76.6394 },
            { name: 'Community Centre, Hubli', address: 'Hubli - 580020', lat: 15.3647, lng: 75.1240 }
        ],
        'Tamil Nadu': [
            { name: 'Corporation School, T. Nagar', address: 'T. Nagar, Chennai - 600017', lat: 13.0418, lng: 80.2341 },
            { name: 'Government School, Coimbatore', address: 'RS Puram, Coimbatore - 641002', lat: 11.0168, lng: 76.9558 }
        ],
        'Kerala': [
            { name: 'Government School, Ernakulam', address: 'MG Road, Kochi - 682011', lat: 9.9816, lng: 76.2999 },
            { name: 'Community Hall, Thiruvananthapuram', address: 'Palayam, TVM - 695033', lat: 8.5074, lng: 76.9730 }
        ],
        '_default': [
            { name: 'District Government School', address: 'Main Road, District HQ', lat: 20.5937, lng: 78.9629 },
            { name: 'Block Community Hall', address: 'Block Office Road', lat: 20.6000, lng: 79.0000 }
        ]
    }
};

// Freeze config to prevent accidental mutation
Object.freeze(CONFIG);
Object.freeze(CONFIG.STATES);
Object.freeze(CONFIG.MOCK_BOOTHS);
