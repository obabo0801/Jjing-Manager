<h1 align="center">
🐕 Jjing Manager
</h1>

<p align="center">
  <img src="https://github.com/user-attachments/assets/d729fe26-8766-4d46-8d41-93abb457e0eb" width="49%">
  <img src="https://github.com/user-attachments/assets/ac2f4d93-8fd0-46ed-84e5-92b4aa68d79d" width="49%">
</p>

<p align="center">
확장 가능한 디스코드 봇
<br>
Node.js + discord.js + googleapis
</p>

---

## 📌 소개
Jjing Manager는 Discord Bot 기능을 중심으로  
CLI 기반 제어 시스템과 Google Sheets 연동까지  
포함한 멀티 서비스 관리 프로젝트입니다.  

환경 변수 설정으로 다국어(i18n)도 지원합니다.  

---

## ✨ 기능
### 🎮 Discord 시스템
- 슬래시 명령어
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
- -1 CLI 바로 실행
- 0 전체 불러오기
- 1 [1] 번 불러오기
```env
START=0
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
  🔸 `"token"`: `"JJING_BOT"`  
  
🔹 `status` 봇 상태  
  🟢 `online` 온라인
  🟡 `idle` 자리 비움  
  🔴 `dnd` 방해 금지
  ⚫ `invisible` 오프라인  
  
🔹 `clientId` [클라이언트 ID](https://discord.com/developers/applications)  
🔹 `guildId` [길드 ID](https://support-dev.discord.com/hc/ko/articles/360028717192)  

### 📊 구글
🔹 `name` 시트 이름  
🔹 `sheetId` [구글 시트 ID](https://docs.google.com/spreadsheets/create)  
  🔸 `"sheetId"`: `"GOOGLE_FUND_ID"`  

🔹 `key` [서비스 계정 키](https://docs.cloud.google.com/iam/docs/service-accounts-create)  
  🔸 `"key"`: `"GOOGLE_FUND_KEY"`  

🔹 `email` [서비스 계정 이메일](https://docs.cloud.google.com/iam/docs/service-account-types)  
  🔸 `"email"`: `"GOOGLE_FUND_EMAIL"`  

---