export const MESSAGES = {

    ENV: {
        SUCCESS: '📄 .env 로드 성공',
        FAIL: '📄 .env 로드 실패',
    },

    STATUS: {
        ATTEMPT: '⏰ 상태를 확인합니다.',
    },

    LOGIN: {
        ATTEMPT: '⏰ 로그인을 시도합니다.',
        
        RESTART: '⏰ 재시작을 시도합니다.',

        RUNNING: '❗ 이미 실행 중입니다.',
        SUCCESS: '🎮 Discord 로그인 완료',
        FAIL: '🎮 Discord 로그인 실패',

        ENOTFOUND: '❌ 인터넷이 오프라인 상태입니다.',
        TOKEN_UNDEFINED: '❌ Token 이 설정되지 않았습니다.',
        TOKEN_INVALID: '❌ 유효하지 않은 Token 입니다.',
        DISALLOWED_INTENTS: '❌ Gateway Intents 권한이 없습니다.',

        RETRY_COUNT: (n, r, m) => `⏰ ${n}초 후 재시도 (${r}/${m})`,
        RETRY_LIMIT: '❌ 재시도 횟수가 초과했습니다.',
    },

    LOGOUT: {
        ATTEMPT: '⏰ 로그아웃을 시도합니다.',
        
        STOPPED: '❗ 이미 종료된 상태입니다.',
        SUCCESS: '🎮 Discord 로그아웃 완료',
        FAIL: '🎮 Discord 로그아웃 실패',
    },
    
    STATUS: {
        ONLINE: '🟢 온라인',
        IDLE: '🟡 자리 비움',
        DND: '🔴 방해 금지',
        INVISIBLE: '⚫ 오프라인',
        UNKNOWN: '❓ 알 수 없음'
    },

    GUILD: {
        SUCCESS: '🏠 Guild 등록 완료',
        FAIL: '🏠 Guild 등록 실패',

        GUILD_UNDEFINED: '❌ Guild ID 가 설정되지 않았습니다.',
        GUILD_INVALID: '❌ 유효하지 않은 Guild ID 입니다.',
    },

    COMMAND: {
        ATTEMPT: '⏰ Commands 등록 시도',
        
        SUCCESS: '🌏 Commands 등록 완료',
        FAIL: '🌏 Commands 등록 실패',

        CLIENT_UNDEFINED: '❌ Client ID 가 설정되지 않았습니다.',
        CLIENT_INVALID: '❌ 유효하지 않은 Client ID 입니다.',

        MISSING_ACCESS: '❌ 액세스할 수 있는 권한이 없습니다.',
    },

    ERROR: {
        BODY_INVALID: '❌ 잘못된 요청 형식입니다.',
    },

    LOAD: {
        SUCCESS: '로드 완료',
        FAIL: '로드 실패',

        NOT_FOUND: '폴더를 찾을 수 없습니다!',
    },

    REFRESH: {
        ATTEMPT: '⏰ 새로고침을 시도합니다.',

        SUCCESS: '🔃 새로고침 완료',
        FAIL: '🔃 새로고침 실패',

        NOT_RUNNING: '❗ 서버가 실행 중이 아닙니다.',
    },

    SYSTEM: {
        UNKNOWN: '은(는) 존재하지 않는 명령어입니다.',

        QUIT: '😢 프로그램을 종료합니다.',
    },
}