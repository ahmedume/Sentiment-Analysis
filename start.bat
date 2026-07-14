@echo off
title SentimentSense
cd /d "%~dp0"

if not exist ".venv\Scripts\activate" (
    echo Creating virtual environment...
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

echo Starting server at http://localhost:8000
uvicorn app.main:app --reload
pause
