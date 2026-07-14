import sys
import json
import logging
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pandas as pd
import matplotlib.pyplot as plt
from scipy.sparse import hstack as sparse_hstack
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, ConfusionMatrixDisplay, classification_report
)
import joblib

from app.preprocess import extract_features

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

PROJECT_ROOT = Path(__file__).resolve().parent.parent
PROCESSED_DIR = PROJECT_ROOT / "data" / "processed"
MODELS_DIR = PROJECT_ROOT / "models"
REPORTS_DIR = PROJECT_ROOT / "reports"
CLASSES = ["negative", "neutral", "positive"]


def main():
    test_path = PROCESSED_DIR / "test.csv"
    if not test_path.exists():
        logger.error("Test set not found")
        return

    test_df = pd.read_csv(test_path)
    X_test_raw = test_df["cleaned_text"].tolist()
    y_test = test_df["label"]

    model_dir = MODELS_DIR / "baseline"
    if not (model_dir / "model.pkl").exists():
        logger.error("Model not found. Run train.py first.")
        return

    model = joblib.load(model_dir / "model.pkl")
    vectorizer = joblib.load(model_dir / "vectorizer.pkl")
    scaler = joblib.load(model_dir / "scaler.pkl")

    tfidf = vectorizer.transform(X_test_raw)
    feat_list = [extract_features(t) for t in X_test_raw]
    import numpy as np
    feats = np.array(feat_list)
    feats_scaled = scaler.transform(feats)
    X_test_vec = sparse_hstack([tfidf, feats_scaled])

    y_pred = model.predict(X_test_vec)

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average="macro")
    rec = recall_score(y_test, y_pred, average="macro")
    f1 = f1_score(y_test, y_pred, average="macro")

    cm = confusion_matrix(y_test, y_pred, labels=CLASSES)
    fig, ax = plt.subplots(figsize=(8, 6))
    ConfusionMatrixDisplay(cm, display_labels=CLASSES).plot(ax=ax)
    ax.set_title("Confusion Matrix — Best Model", fontsize=14, fontweight="bold")
    fig.tight_layout()
    fig.savefig(REPORTS_DIR / "figures" / "confusion_matrix.png", dpi=150)
    plt.close(fig)

    report = {
        "accuracy": acc,
        "macro_avg": {"precision": prec, "recall": rec, "f1": f1},
        "per_class": classification_report(y_test, y_pred, output_dict=True),
    }
    with open(REPORTS_DIR / "evaluation_report.json", "w") as f:
        json.dump(report, f, indent=2)

    logger.info("Evaluation saved to reports/")
    logger.info("Accuracy: %.4f | Macro F1: %.4f | Prec: %.4f | Rec: %.4f", acc, f1, prec, rec)


if __name__ == "__main__":
    main()
