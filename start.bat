@echo off
title SentimentSense
cd /d "%~dp0"

if not exist ".venv\Scripts\activate" (
    echo Creating Python virtual environment...
    uv venv
)

call .venv\Scripts\activate

if not exist "models\baseline\model.pkl" (
    echo Training models...
    python scripts/collect_data.py
    python scripts/clean_data.py
    python scripts/eda.py
    python scripts/train.py
    python scripts/evaluate.py
)

echo Installing frontend dependencies...
cd client
if not exist "node_modules" (
    npm install
)
cd ..

echo.
echo === Starting servers ===
echo Backend  : http://localhost:8000
echo Frontend : http://localhost:5173
echo.

start "SentimentSense Backend" cmd /c "call .venv\Scripts\activate && uvicorn app.main:app --reload"
start "SentimentSense Frontend" cmd /c "cd client && npm run dev"

echo Both servers started. Close this window to stop.
pause
