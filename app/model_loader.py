import logging
from pathlib import Path

import joblib
import numpy as np

from app.config import CLASSES

logger = logging.getLogger(__name__)

PROJECT_ROOT = Path(__file__).resolve().parent.parent


def _softmax(x):
    e = np.exp(x - np.max(x))
    return e / e.sum()


class ModelLoader:
    _instance = None
    _models = None
    _vectorizer = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._load()
        return cls._instance

    def _load(self) -> None:
        base_path = PROJECT_ROOT / "models" / "baseline"
        self._models = {
            "svm": joblib.load(base_path / "svm_model.pkl"),
            "lr": joblib.load(base_path / "lr_model.pkl"),
        }
        self._vectorizer = joblib.load(base_path / "vectorizer.pkl")

    def predict(self, text: str, model_name: str = "svm") -> dict:
        model = self._models[model_name]
        vec = self._vectorizer.transform([text])

        if hasattr(model, "predict_proba"):
            probs = model.predict_proba(vec)[0]
        else:
            scores = model.decision_function(vec)[0]
            probs = _softmax(scores)

        class_idx = int(probs.argmax())
        sentiment = CLASSES[class_idx]
        return {
            "sentiment": sentiment,
            "confidence": round(float(probs[class_idx]), 4),
            "probabilities": {c: round(float(p), 4) for c, p in zip(CLASSES, probs)},
        }
