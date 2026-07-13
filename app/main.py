import logging
import time
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import HOST, PORT, MAX_TEXT_LENGTH
from app.schemas import PredictRequest, PredictResponse, HealthResponse
from app.model_loader import ModelLoader
from app.preprocess import clean_text

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(title="SentimentSense", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

STATIC_DIR = Path(__file__).resolve().parent / "static"
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

model_loader = ModelLoader()


@app.get("/")
async def root():
    from fastapi.responses import FileResponse
    return FileResponse(STATIC_DIR / "index.html")


@app.get("/health", response_model=HealthResponse)
async def health():
    return {
        "success": True,
        "data": {
            "status": "ok",
            "model_loaded": model_loader._models is not None,
        }
    }


def _predict(text: str, model_name: str) -> dict:
    cleaned = clean_text(text)
    if not cleaned:
        return {
            "sentiment": "neutral",
            "confidence": 0.3333,
            "probabilities": {"negative": 0.3333, "neutral": 0.3333, "positive": 0.3333},
            "model": model_name,
            "processing_time_ms": 0,
            "fallback": True,
        }
    start = time.time()
    try:
        result = model_loader.predict(cleaned, model_name)
    except Exception as e:
        logger.error("Prediction failed: %s", e)
        raise HTTPException(status_code=503, detail={
            "code": "MODEL_UNAVAILABLE",
            "message": f"model '{model_name}' is not available"
        })
    elapsed = int((time.time() - start) * 1000)
    return {**result, "model": model_name, "processing_time_ms": elapsed}


@app.post("/predict", response_model=PredictResponse)
async def predict(request: PredictRequest):
    text = request.text.strip()
    if not text:
        raise HTTPException(status_code=422, detail={
            "code": "VALIDATION_ERROR", "message": "text is required"
        })

    truncated = False
    if len(text) > MAX_TEXT_LENGTH:
        text = text[:MAX_TEXT_LENGTH]
        truncated = True

    if request.model == "both":
        results = [_predict(text, "svm"), _predict(text, "lr")]
        return {
            "success": True,
            "data": {
                "text": request.text,
                "truncated": truncated,
                "results": results,
                "comparison": True,
            }
        }

    result = _predict(text, request.model)
    return {
        "success": True,
        "data": {
            "text": request.text,
            "sentiment": result["sentiment"],
            "confidence": result["confidence"],
            "probabilities": result["probabilities"],
            "model": result["model"],
            "processing_time_ms": result["processing_time_ms"],
            "truncated": truncated,
        }
    }
