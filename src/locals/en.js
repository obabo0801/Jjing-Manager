export const MESSAGES = {
    ENV: {
        SUCCESS: '📄 .env loaded',
        FAIL: '📄 .env failed',
    },

    CLI: {
        GOOGLE: 'Google Sheets 📊',
        DISCORD: 'Discord 🎮',

        BOTS: '[0] All',
        COMMAND: 'Commands 📝\n',

        COMMANDS: {
            START: 'start',
            RESTART: 'restart',
            STOP: 'stop',
            STATUS: 'status',
            REFRESH: 'refresh',
            EXIT: 'exit',
            CLEAR: 'clear',
        },

        NAME: 'NAME     ',
        GLOBAL: 'GLOBAL   ',
        GUILD: 'GUILD    ',
        PING: 'PING     ',
        UPTIME: 'UPTIME   ',
    },

    LOGIN: {
        ATTEMPT: '⏰ Logging in...',
        RESTART: '⏰ Restarting...',

        RUNNING: '❗ Already running',
        SUCCESS: '🎮 Discord login success',
        FAIL: '🎮 Discord login failed',

        ENOTFOUND: '❌ No internet connection',
        TOKEN_UNDEFINED: '❌ Token not set',
        TOKEN_INVALID: '❌ Invalid token',
        DISALLOWED_INTENTS: '❌ Missing intents permission',

        RETRY_COUNT: (n, r, m) => `⏰ Retry in ${n}s (${r}/${m})`,
        RETRY_LIMIT: '❌ Retry limit reached',
    },

    LOGOUT: {
        ATTEMPT: '⏰ Logging out...',

        STOPPED: '❗ Already stopped',
        SUCCESS: '🎮 Discord logout success',
        FAIL: '🎮 Discord logout failed',
    },

    STATUS: {
        ATTEMPT: '⏰ Checking status...',

        CONNECTED: '🟢 Connected',
        DISCONNECTED: '🔴 Disconnected',

        ONLINE: '🟢 Online',
        IDLE: '🟡 Idle',
        DND: '🔴 Do Not Disturb',
        INVISIBLE: '⚫ Offline',
        UNKNOWN: '❓ Unknown',
    },

    GUILD: {
        SUCCESS: '🏠 Guild registered',
        FAIL: '🏠 Guild registration failed',

        UNDEFINED: '❌ Guild ID not set',
        INVALID: '❌ Invalid Guild ID',
    },

    COMMAND: {
        ATTEMPT: '⏰ Registering commands...',

        SUCCESS: '🌏 Commands registered',
        FAIL: '🌏 Command registration failed',

        CLIENT_UNDEFINED: '❌ Client ID not set',
        CLIENT_INVALID: '❌ Invalid Client ID',

        MISSING_ACCESS: '❌ Missing access permission',
    },

    AUTH: {
        SUCCESS: '🔐 Google auth success',
        FAIL: '🔐 Google auth failed',

        INVALID: '❌ Invalid credentials',
    },

    SHEET: {
        RUNNING: '❗ Already running',
        STOPPED: '❗ Already stopped',

        IN_SUCCESS: '📊 Sheet connected',
        IN_FAIL: '📊 Sheet connection failed',
        OUT_SUCCESS: '📊 Sheet disconnected',
        OUT_FAIL: '📊 Sheet disconnect failed',

        ERROR400: '❌ Bad request (400)',
        ERROR401: '❌ Unauthorized (401)',
        ERROR403: '❌ Forbidden (403)',
        ERROR404: '❌ Data not found (404)',
        ERROR500: '❌ Server error (500)',
    },

    ERROR: {
        BODY_INVALID: '❌ Invalid request body',
    },

    LOAD: {
        ATTEMPT: 'Loading...',

        SUCCESS: 'Load success',
        FAIL: 'Load failed',

        NOT_FOUND: 'Folder not found',
    },

    REFRESH: {
        ATTEMPT: '⏰ Refreshing...',

        SUCCESS: '🔃 Refresh success',
        FAIL: '🔃 Refresh failed',

        NOT_RUNNING: '❗ Server not running',
    },

    SYSTEM: {
        UNKNOWN: 'is not a valid command',

        QUIT: '😢 Exiting program...',
    },
};