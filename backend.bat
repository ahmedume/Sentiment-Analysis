@echo off
title Sentiment Analysis Backend
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

echo.
echo Starting backend at http://localhost:8000
echo.
uvicorn app.main:app --reload
pause
