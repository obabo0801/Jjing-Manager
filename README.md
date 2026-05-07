<h1 align="center">
🐕 Jjing Bot
</h1>

<p align="center">
  <img src="https://github.com/user-attachments/assets/a468835d-e404-449c-b5a0-e4687eb2d266" height="500">
  <img src="https://github.com/user-attachments/assets/829ead06-ac09-411c-9ab4-5221361f81de" height="500">
</p>

<p align="center">
확장 가능한 디스코드 봇
<br>
Node.js + discord.js
</p>

---

## 📌 소개
Jjing Bot은 슬래시 명령어, 버튼, 모달 같은  
Discord 인터랙션 기능들을 조금 더 편하게  
관리하려고 만든 개인 프로젝트입니다.

혼자 쓰면서 필요한 기능 계속 추가하는 형태라  
구조도 계속 수정하면서 사용 중입니다.

---

## ✨ 기능
### 🎮 Discord
- 슬래시 명령어
- 버튼 이벤트
- 셀렉트 메뉴
- 모달 처리
- 자동완성 지원
### 🛠 시스템
- 명령어 자동 로드
- 핸들러 구조 분리
- config 설정 관리
- 로그 저장 기능
- 시간 관련 유틸
- Base64 변환 유틸

---

## 🛠 개발 환경
- Node.js
- discord.js
- ES Module

---

## 🚀 설치
```bash
npm install
```

---

## 🪟 실행
```bash
npm start
```

또는

```bash
start.bat
```

---

## 🔐 .env
- ⚠️ **절대 공개 금지**
### 시작
- -1 CLI 만 실행
- 0 전체 불러오기
- 1 [1] 번 불러오기
```env
START=0
```
### 토큰
- config 설정 → `token`
```env
JJING_TOKEN=YOUR_TOKEN
```

---

## ⚙️ 설정
- config.json
🔹 `1` 번호  
### 기본 정보
🔹 `name` 봇 이름
🔹 `path` 폴더 경로
### 재시도 설정
🔹 `delay` 시간
🔹 `count` 횟수
### 디스코드 설정
🔹 `token` `.env` 에 토큰 상수  
  🔸 `"token"`: `"JJING_BOT"`
  
🔹 `status` 봇 상태  
  🔸 `online` 온라인
  🔸 `idle` 자리 비움  
  🔸 `dnd` 방해 금지
  🔸 `invisible` 오프라인  
  
🔹 `clientId` [클라이언트 ID](https://discord.com/developers/applications)  
🔹 `guildId` [길드 ID](https://support-dev.discord.com/hc/ko/articles/360028717192)  

---