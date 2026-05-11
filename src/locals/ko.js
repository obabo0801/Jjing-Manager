export const MESSAGES = {

    ENV: {
        SUCCESS: '📄 .env 로드 성공',
        FAIL: '📄 .env 로드 실패',
    },

    CLI: {
        GOOGLE: '구글 시트 📊',
        DISCORD: '디스코드 🎮',

        BOTS: '[0] 전체',
        COMMAND: '명령어 📝\n',

        COMMANDS: {
            START: '시작',
            RESTART: '재시작',
            STOP: '중지',
            STATUS: '상태',
            REFRESH: '새로고침',
            EXIT: '종료',
            CLEAR: '정리'
        },

        NAME:   'NAME     ',
        GLOBAL: 'GLOBAL   ',
        GUILD:  'GUILD    ',
        PING:   'PING     ',
        UPTIME: 'UPTIME   ',
    },

    LOGIN: {
        ATTEMPT: '⏰ 로그인을 시도합니다.',
        RESTART: '⏰ 재시작을 시도합니다.',

        RUNNING: '❗ 이미 실행 중입니다.',
        SUCCESS: '🎮 디스코드 로그인 완료',
        FAIL: '🎮 디스코드 로그인 실패',

        ENOTFOUND: '❌ 인터넷이 연결되지 않았습니다.',
        TOKEN_UNDEFINED: '❌ 토큰이 설정되지 않았습니다.',
        TOKEN_INVALID: '❌ 유효하지 않은 토큰입니다.',
        DISALLOWED_INTENTS: '❌ 이벤트 수신 권한이 없습니다.',

        RETRY_COUNT: (n, r, m) => `⏰ ${n}초 후 재시도 (${r}/${m})`,
        RETRY_LIMIT: '❌ 재시도 횟수를 초과했습니다.',
    },

    LOGOUT: {
        ATTEMPT: '⏰ 로그아웃을 시도합니다.',
        
        STOPPED: '❗ 이미 종료된 상태입니다.',
        SUCCESS: '🎮 디스코드 로그아웃 완료',
        FAIL: '🎮 디스코드 로그아웃 실패',
    },
    
    STATUS: {
        ATTEMPT: '⏰ 상태를 확인합니다.',

        CONNECTED: '🟢 연결됨',
        DISCONNECTED: '🔴 연결되지 않음',

        ONLINE: '🟢 온라인',
        IDLE: '🟡 자리 비움',
        DND: '🔴 방해 금지',
        INVISIBLE: '⚫ 오프라인',
        UNKNOWN: '❓ 알 수 없음',
    },

    GUILD: {
        SUCCESS: '🏠 길드 등록 완료',
        FAIL: '🏠 길드 등록 실패',

        UNDEFINED: '❌ 길드 ID가 설정되지 않았습니다.',
        INVALID: '❌ 유효하지 않은 길드 ID입니다.',
    },

    COMMAND: {
        ATTEMPT: '⏰ 명령어 등록 시도',
        
        SUCCESS: '🌏 명령어 등록 완료',
        FAIL: '🌏 명령어 등록 실패',

        CLIENT_UNDEFINED: '❌ 클라이언트 ID가 설정되지 않았습니다.',
        CLIENT_INVALID: '❌ 유효하지 않은 클라이언트 ID입니다.',

        MISSING_ACCESS: '❌ 접근 권한이 없습니다.',
    },

    AUTH: {
        SUCCESS: '🔐 구글 인증 성공',
        FAIL: '🔐 구글 인증 실패',

        INVALID: '❌ 인증 정보를 불러올 수 없습니다',
    },

    SHEET: {
        RUNNING: '❗ 이미 실행 중입니다.',
        STOPPED: '❗ 이미 종료된 상태입니다.',

        IN_SUCCESS: '📊 시트 연결 완료',
        IN_FAIL: '📊 시트 연결 실패',
        OUT_SUCCESS: '📊 시트 해제 성공',
        OUT_FAIL: '📊 시트 해제 실패',

        ERROR400: '❌ 잘못된 요청입니다. (400)',
        ERROR401: '❌ 인증 실패입니다. (401)',
        ERROR403: '❌ 접근 권한이 없습니다. (403)',
        ERROR404: '❌ 요청한 데이터를 찾을 수 없습니다. (404)',
        ERROR500: '❌ 내부 서버 오류가 발생했습니다. (500)',
    },

    ERROR: {
        BODY_INVALID: '❌ 잘못된 요청 형식입니다.',
    },

    LOAD: {
        ATTEMPT: '로드 시도',

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