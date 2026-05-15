<h1 align="center">
🐕 Jjing Manager
</h1>

<p align="center">
  <img src="https://github.com/user-attachments/assets/ed957996-9b38-4afa-bf1b-5e43ff4fc8b4" width="49%">
  <img src="https://github.com/user-attachments/assets/e7f9cbc2-b1d3-45eb-b670-8b7099b0e4ab" width="49%">
</p>

<p align="center">
Node.js + discord.js + googleapis
</p>

---

## 📌 소개
Jjing Manager는 Discord bots 와 Google sheets 를 CLI 으로  
제어할 수 있는 멀티 서비스 관리 프로젝트입니다.  

환경 변수와 Config 설정을 통해 여러 서비스를 관리할 수 있으며  
다국어(i18n)도 지원합니다.  

---

## ✨ 기능
### 🎮 Discord 시스템
- 슬래시 명령어
- 메시지 명령어
- 버튼 이벤트
- 셀렉트 메뉴
- 모달 처리
- 자동완성 지원
- 다중 인스턴스 관리
### 📊 Google 시스템
- Google Sheets API 연동
- 서비스 계정 기반 인증
- 다중 계정 지원
### 🛠 시스템 구조
- CLI 명령어 제어
- 명령어 자동 로드
- 핸들러 구조 분리
- config 설정 관리
- 로그 저장 기능
- 시간 관련 유틸
- Base64 변환 유틸

---

## 🛠 개발 환경
- Node.js (ESM)
- discord.js
- googleapis

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
- -1 로드 없이 진행
- 0 전체 불러오기
- 1 [1] 번 불러오기
```env
DISCORD_START=0
GOOGLE_START=0
```
### 언어
- en 영어
- ko 한국어
```env
LANGUAGE=ko
```
### 토큰
- config 설정 → `token`
```env
JJING_TOKEN=YOUR_TOKEN
```
### 클라이언트 ID
- config 설정 → `clientId`
```env
JJING_CLIENT_ID=YOUR_CLIENT_ID
```
### 길드 ID
- config 설정 → `guildId`
```env
JJING_GUILD_ID=YOUR_GUILD_ID
```
### 구글 시트 ID
- /spreadsheets/d/YOUR_ID/edit#gid=0
- config 설정 → `sheetId`
```env
GOOGLE_FUND_ID=YOUR_ID
```
### 구글 서비스 키
- config 설정 → `key`
```env
GOOGLE_FUND_KEY=YOUR_KEY
```
### 구글 서비스 이메일
- config 설정 → `email`
```env
GOOGLE_FUND_EMAIL=YOUR_EMAIL
```

---

## ⚙️ 설정
- config.json
### 🤖 디스코드
🔹 `1` 번호  
🔹 `name` 봇 이름
🔹 `path` 폴더 경로  
🔹 `delay` 시간
🔹 `count` 횟수  
🔹 `token` `.env` 봇 토큰  
  🔸 `"token"`: `"JJING_TOKEN"`  
  
🔹 `status` 봇 상태  
  🟢 `online` 온라인
  🟡 `idle` 자리 비움  
  🔴 `dnd` 방해 금지
  ⚫ `invisible` 오프라인  
  
🔹 `clientId` [클라이언트 ID](https://discord.com/developers/applications)  
  🔸 `"clientId"`: `"JJING_CLIENT_ID"`  

🔹 `guildId` [길드 ID](https://support-dev.discord.com/hc/ko/articles/360028717192)  
  🔸 `"guildId"`: `"JJING_GUILD_ID"`  

### 📊 구글
🔹 `name` 시트 이름  
🔹 `sheetId` [구글 시트 ID](https://docs.google.com/spreadsheets/create)  
  🔸 `"sheetId"`: `"GOOGLE_FUND_ID"`  

🔹 `key` [서비스 계정 키](https://docs.cloud.google.com/iam/docs/service-accounts-create)  
  🔸 `"key"`: `"GOOGLE_FUND_KEY"`  

🔹 `email` [서비스 계정 이메일](https://docs.cloud.google.com/iam/docs/service-account-types)  
  🔸 `"email"`: `"GOOGLE_FUND_EMAIL"`  

---

## ⌨️ CLI 명령어
- `start` 시작
- `restart` 재시작
- `stop` 중지
- `status` 상태
- `refresh` 새로고침
- `clear` 정리
- `reboot` 재실행
- `exit` 종료

---

### 사용 예시
```bash
start
```
서비스 선택 메뉴를 표시합니다.

```bash
start 1
```
1번 서비스 전체를 시작합니다.

```bash
start 1 1
```
1번 서비스의 1번 항목만 시작합니다.

```bash
start 0
```
전체 서비스를 시작합니다.