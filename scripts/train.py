import sys
import logging
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import numpy as np
import pandas as pd
from scipy.sparse import hstack as sparse_hstack
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.model_selection import train_test_split, GridSearchCV, StratifiedKFold
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.preprocessing import StandardScaler
from app.preprocess import extract_features
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


def build_feature_matrix(texts, vectorizer=None, scaler=None, fit=False):
    if fit:
        vectorizer = TfidfVectorizer(
            max_features=15000,
            ngram_range=(1, 3),
            sublinear_tf=True,
            min_df=2,
            max_df=0.95,
        )
        tfidf = vectorizer.fit_transform(texts)
    else:
        tfidf = vectorizer.transform(texts)

    feat_list = []
    for t in texts:
        feat_list.append(extract_features(t))
    feats = np.array(feat_list)

    if fit:
        scaler = StandardScaler()
        feats_scaled = scaler.fit_transform(feats)
    else:
        feats_scaled = scaler.transform(feats)

    combined = sparse_hstack([tfidf, feats_scaled])
    return combined, vectorizer, scaler


def train_with_gridsearch(X_train_vec, y_train, X_val_vec, y_val):
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)

    logger.info("Tuning Logistic Regression...")
    lr_grid = {
        'C': [0.1, 1.0, 10.0],
        'solver': ['lbfgs'],
        'class_weight': ['balanced'],
        'max_iter': [2000],
    }
    lr_gs = GridSearchCV(
        LogisticRegression(random_state=RANDOM_STATE),
        lr_grid,
        cv=cv,
        scoring='f1_macro',
        n_jobs=-1,
        verbose=0,
    )
    lr_gs.fit(X_train_vec, y_train)
    lr = lr_gs.best_estimator_
    lr_val_f1 = f1_score(y_val, lr.predict(X_val_vec), average='macro')
    logger.info("LR best params: %s | val F1: %.4f", lr_gs.best_params_, lr_val_f1)

    logger.info("Tuning Linear SVM...")
    svm_grid = {
        'C': [0.1, 1.0, 10.0],
        'loss': ['squared_hinge'],
        'class_weight': ['balanced'],
        'max_iter': [5000],
    }
    svm_gs = GridSearchCV(
        LinearSVC(random_state=RANDOM_STATE, dual='auto'),
        svm_grid,
        cv=cv,
        scoring='f1_macro',
        n_jobs=-1,
        verbose=0,
    )
    svm_gs.fit(X_train_vec, y_train)
    svm = svm_gs.best_estimator_
    svm_val_f1 = f1_score(y_val, svm.predict(X_val_vec), average='macro')
    logger.info("SVM best params: %s | val F1: %.4f", svm_gs.best_params_, svm_val_f1)

    model_dir = MODELS_DIR / "baseline"
    model_dir.mkdir(parents=True, exist_ok=True)
    best = lr if lr_val_f1 >= svm_val_f1 else svm
    joblib.dump(best, model_dir / "model.pkl")
    joblib.dump(lr, model_dir / "lr_model.pkl")
    joblib.dump(svm, model_dir / "svm_model.pkl")
    logger.info("Best model (%s) saved", 'LR' if lr_val_f1 >= svm_val_f1 else 'SVM')
    return lr, svm


def compare_and_save(model_name, y_test, y_pred):
    return {
        'model': model_name,
        'accuracy': accuracy_score(y_test, y_pred),
        'precision': precision_score(y_test, y_pred, average='macro'),
        'recall': recall_score(y_test, y_pred, average='macro'),
        'f1': f1_score(y_test, y_pred, average='macro'),
    }


def main():
    dataset_path = PROCESSED_DIR / "cleaned_dataset.csv"
    if not dataset_path.exists():
        logger.error("Cleaned dataset not found at %s", dataset_path)
        return

    df = pd.read_csv(dataset_path)
    X = df['cleaned_text'].tolist()
    y = df['label']

    X_train_raw, X_val_raw, X_test_raw, y_train, y_val, y_test = split_data(X, y)

    logger.info("Building feature matrix with TF-IDF (15K, 1-3gram) + engineered features...")
    X_train_vec, vectorizer, scaler = build_feature_matrix(
        X_train_raw, fit=True
    )
    X_val_vec, _, _ = build_feature_matrix(X_val_raw, vectorizer, scaler)
    X_test_vec, _, _ = build_feature_matrix(X_test_raw, vectorizer, scaler)

    logger.info("Train shape: %s | Val shape: %s", X_train_vec.shape, X_val_vec.shape)

    lr, svm = train_with_gridsearch(X_train_vec, y_train, X_val_vec, y_val)

    lr_test_pred = lr.predict(X_test_vec)
    svm_test_pred = svm.predict(X_test_vec)

    results = [
        compare_and_save('Logistic Regression', y_test, lr_test_pred),
        compare_and_save('Linear SVM', y_test, svm_test_pred),
    ]

    results_df = pd.DataFrame(results).sort_values('f1', ascending=False)
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    results_df.to_csv(REPORTS_DIR / 'model_comparison.csv', index=False)
    best_name = results_df.iloc[0]['model']
    with open(REPORTS_DIR / 'best_model.txt', 'w') as f:
        f.write(best_name)

    best_model = lr if best_name == 'Logistic Regression' else svm
    model_dir = MODELS_DIR / 'baseline'
    model_dir.mkdir(parents=True, exist_ok=True)
    joblib.dump(best_model, model_dir / 'model.pkl')
    joblib.dump(vectorizer, model_dir / 'vectorizer.pkl')
    joblib.dump(scaler, model_dir / 'scaler.pkl')
    logger.info('Best model (%s) re-saved with vectorizer + scaler', best_name)
    logger.info('\n%s', results_df.to_string(index=False))


if __name__ == '__main__':
    main()
