@echo off
title Sentiment Analysis Frontend
cd /d "%~dp0client"

if not exist "node_modules" (
    echo Installing frontend dependencies...
    npm install
)

echo.
echo Starting frontend at http://localhost:5173
echo.
npm run dev
pause
