import os
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent

APP_ENV = os.getenv("APP_ENV", "development")
MODEL_TYPE = os.getenv("MODEL_TYPE", "distilbert")
MODEL_PATH = os.getenv("MODEL_PATH", str(PROJECT_ROOT / "models" / "distilbert"))
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))
MAX_TEXT_LENGTH = int(os.getenv("MAX_TEXT_LENGTH", "1000"))
CLASSES = ["negative", "neutral", "positive"]
