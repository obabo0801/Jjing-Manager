@echo off
chcp 65001 > nul
title Jjing-Manager 🐕
cd /d "%~dp0"

if not exist "node_modules" (
    npm install
    call "%~f0"
)

cls
npm start --silent
pause