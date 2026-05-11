export const MESSAGES = {

    ENV: {
        SUCCESS: '📄 .env loaded successfully',
        FAIL: '📄 Failed to load .env',
    },

    CLI: {
        GOOGLE: 'Google Sheets 📊',
        DISCORD: 'Discord Bots 🎮',

        BOTS: '[0] All',
        COMMAND: 'Commands 📝\n',

        COMMANDS: {
            START: 'start',
            RESTART: 'restart',
            STOP: 'stop',
            STATUS: 'status',
            REFRESH: 'refresh',
            EXIT: 'exit',
            CLEAR: 'clear'
        },

        NAME:   'NAME     ',
        GLOBAL: 'GLOBAL   ',
        GUILD:  'GUILD    ',
        PING:   'PING     ',
        UPTIME: 'UPTIME   ',
    },

    LOGIN: {
        ATTEMPT: '⏰ Attempting login.',
        
        RESTART: '⏰ Attempting restart.',

        RUNNING: '❗ Already running.',
        SUCCESS: '🎮 Discord login successful',
        FAIL: '🎮 Discord login failed',

        ENOTFOUND: '❌ No internet connection.',
        TOKEN_UNDEFINED: '❌ Token is not defined.',
        TOKEN_INVALID: '❌ Invalid token.',
        DISALLOWED_INTENTS: '❌ Missing Gateway Intents permission.',

        RETRY_COUNT: (n, r, m) => `⏰ Retrying in ${n}s (${r}/${m})`,
        RETRY_LIMIT: '❌ Retry limit exceeded.',
    },

    LOGOUT: {
        ATTEMPT: '⏰ Attempting logout.',
        
        STOPPED: '❗ Already stopped.',
        SUCCESS: '🎮 Discord logout successful',
        FAIL: '🎮 Discord logout failed',
    },
    
    STATUS: {
        ATTEMPT: '⏰ Checking status.',

        CONNECTED: '🟢 Connected',
        DISCONNECTED: '🔴 Not connected',

        ONLINE: '🟢 Online',
        IDLE: '🟡 Idle',
        DND: '🔴 Do Not Disturb',
        INVISIBLE: '⚫ Offline',
        UNKNOWN: '❓ Unknown',
    },

    GUILD: {
        SUCCESS: '🏠 Guild registered successfully',
        FAIL: '🏠 Guild registration failed',

        UNDEFINED: '❌ Guild ID is not defined.',
        INVALID: '❌ Invalid Guild ID.',
    },

    COMMAND: {
        ATTEMPT: '⏰ Attempting command registration',
        
        SUCCESS: '🌏 Commands registered successfully',
        FAIL: '🌏 Command registration failed',

        CLIENT_UNDEFINED: '❌ Client ID is not defined.',
        CLIENT_INVALID: '❌ Invalid Client ID.',

        MISSING_ACCESS: '❌ Missing access permissions.',
    },

    AUTH: {
        SUCCESS: '🔐 Google authentication successful',
        FAIL: '🔐 Google authentication failed',

        INVALID: '❌ Unable to load authentication data',
    },

    SHEET: {
        RUNNING: '❗ Already running.',
        STOPPED: '❗ Already stopped.',

        IN_SUCCESS: '📊 Sheets connected successfully',
        IN_FAIL: '📊 Failed to connect Sheets',
        OUT_SUCCESS: '📊 Sheets disconnected successfully',
        OUT_FAIL: '📊 Failed to disconnect Sheets',

        ERROR400: '❌ Bad request. (400)',
        ERROR401: '❌ Authentication failed. (401)',
        ERROR403: '❌ Access denied. (403)',
        ERROR404: '❌ Requested resource not found. (404)',
        ERROR500: '❌ Internal server error occurred. (500)',
    },

    ERROR: {
        BODY_INVALID: '❌ Invalid request format.',
    },

    LOAD: {
        SUCCESS: 'Loaded successfully',
        FAIL: 'Load failed',

        NOT_FOUND: 'Folder not found!',
    },

    REFRESH: {
        ATTEMPT: '⏰ Attempting refresh.',

        SUCCESS: '🔃 Refresh completed',
        FAIL: '🔃 Refresh failed',

        NOT_RUNNING: '❗ Server is not running.',
    },

    SYSTEM: {
        UNKNOWN: 'is not a valid command.',

        QUIT: '😢 Shutdown program.',
    },
}