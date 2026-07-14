import logging
from pathlib import Path

import numpy as np
from scipy.sparse import hstack as sparse_hstack
import joblib

from app.config import CLASSES
from app.preprocess import clean_text, extract_features

logger = logging.getLogger(__name__)

PROJECT_ROOT = Path(__file__).resolve().parent.parent


def _softmax(x):
    e = np.exp(x - np.max(x))
    return e / e.sum()


class ModelLoader:
    _instance = None
    _models = None
    _vectorizer = None
    _scaler = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._load()
        return cls._instance

    def _load(self) -> None:
        base_path = PROJECT_ROOT / 'models' / 'baseline'
        self._models = {
            'svm': joblib.load(base_path / 'svm_model.pkl'),
            'lr': joblib.load(base_path / 'lr_model.pkl'),
        }
        self._vectorizer = joblib.load(base_path / 'vectorizer.pkl')
        scaler_path = base_path / 'scaler.pkl'
        self._scaler = joblib.load(scaler_path) if scaler_path.exists() else None

    def _build_features(self, text: str):
        tfidf = self._vectorizer.transform([text])
        feats = extract_features(text).reshape(1, -1)
        if self._scaler is not None:
            feats = self._scaler.transform(feats)
        return sparse_hstack([tfidf, feats])

    def predict(self, text: str, model_name: str = 'svm') -> dict:
        model = self._models[model_name]
        X = self._build_features(text)

        if hasattr(model, 'predict_proba'):
            probs = model.predict_proba(X)[0]
        else:
            scores = model.decision_function(X)[0]
            probs = _softmax(scores)

        class_idx = int(probs.argmax())
        sentiment = CLASSES[class_idx]
        return {
            'sentiment': sentiment,
            'confidence': round(float(probs[class_idx]), 4),
            'probabilities': {c: round(float(p), 4) for c, p in zip(CLASSES, probs)},
        }
