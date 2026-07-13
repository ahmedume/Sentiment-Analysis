import logging
from pathlib import Path

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import joblib

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

PROJECT_ROOT = Path(__file__).resolve().parent.parent
PROCESSED_DIR = PROJECT_ROOT / "data" / "processed"
MODELS_DIR = PROJECT_ROOT / "models"
REPORTS_DIR = PROJECT_ROOT / "reports"
RANDOM_STATE = 42


def split_data(X, y):
    X_temp, X_test, y_temp, y_test = train_test_split(
        X, y, test_size=0.15, random_state=RANDOM_STATE, stratify=y
    )
    val_ratio = 0.15 / 0.85
    X_train, X_val, y_train, y_val = train_test_split(
        X_temp, y_temp, test_size=val_ratio, random_state=RANDOM_STATE, stratify=y_temp
    )
    for name, Xs, ys in [("train", X_train, y_train), ("val", X_val, y_val), ("test", X_test, y_test)]:
        pd.DataFrame({"cleaned_text": Xs, "label": ys}).to_csv(
            PROCESSED_DIR / f"{name}.csv", index=False
        )
    return X_train, X_val, X_test, y_train, y_val, y_test


def train_and_evaluate(X_train, y_train, X_val, y_val):
    vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 2))
    X_train_vec = vectorizer.fit_transform(X_train)
    X_val_vec = vectorizer.transform(X_val)

    lr = LogisticRegression(max_iter=1000, random_state=42)
    lr.fit(X_train_vec, y_train)
    lr_val_f1 = f1_score(y_val, lr.predict(X_val_vec), average="macro")
    logger.info("Logistic Regression val F1: %.4f", lr_val_f1)

    svm = LinearSVC(random_state=42, dual="auto", max_iter=2000)
    svm.fit(X_train_vec, y_train)
    svm_val_f1 = f1_score(y_val, svm.predict(X_val_vec), average="macro")
    logger.info("Linear SVM val F1: %.4f", svm_val_f1)

    model_dir = MODELS_DIR / "baseline"
    model_dir.mkdir(parents=True, exist_ok=True)
    best = lr if lr_val_f1 >= svm_val_f1 else svm
    joblib.dump(best, model_dir / "model.pkl")
    joblib.dump(lr, model_dir / "lr_model.pkl")
    joblib.dump(svm, model_dir / "svm_model.pkl")
    joblib.dump(vectorizer, model_dir / "vectorizer.pkl")
    logger.info("Models saved to models/baseline/")
    return lr, svm, vectorizer


def compare_and_save(model_name, y_test, y_pred):
    return {
        "model": model_name,
        "accuracy": accuracy_score(y_test, y_pred),
        "precision": precision_score(y_test, y_pred, average="macro"),
        "recall": recall_score(y_test, y_pred, average="macro"),
        "f1": f1_score(y_test, y_pred, average="macro"),
    }


def main():
    dataset_path = PROCESSED_DIR / "cleaned_dataset.csv"
    if not dataset_path.exists():
        logger.error("Cleaned dataset not found at %s", dataset_path)
        return

    df = pd.read_csv(dataset_path)
    X = df["cleaned_text"]
    y = df["label"]

    X_train, X_val, X_test, y_train, y_val, y_test = split_data(X, y)

    lr, svm, vectorizer = train_and_evaluate(X_train, y_train, X_val, y_val)

    X_test_vec = vectorizer.transform(X_test)
    results = [
        compare_and_save("Logistic Regression", y_test, lr.predict(X_test_vec)),
        compare_and_save("Linear SVM", y_test, svm.predict(X_test_vec)),
    ]

    results_df = pd.DataFrame(results).sort_values("f1", ascending=False)
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    results_df.to_csv(REPORTS_DIR / "model_comparison.csv", index=False)
    best_name = results_df.iloc[0]["model"]
    with open(REPORTS_DIR / "best_model.txt", "w") as f:
        f.write(best_name)

    best_model = lr if best_name == "Logistic Regression" else svm
    model_dir = MODELS_DIR / "baseline"
    model_dir.mkdir(parents=True, exist_ok=True)
    joblib.dump(best_model, model_dir / "model.pkl")
    joblib.dump(vectorizer, model_dir / "vectorizer.pkl")
    logger.info("Best model (%s) re-saved to models/baseline/", best_name)
    logger.info("Comparison saved to reports/model_comparison.csv")
    logger.info("Best model: %s", best_name)
    logger.info("\n%s", results_df.to_string(index=False))


if __name__ == "__main__":
    main()
