# SentimentSense

End-to-end sentiment analysis system — from data collection to a prediction API with an interactive comparison frontend.

Classifies text into **Positive**, **Negative**, or **Neutral** sentiment. Trains both **Linear SVM** (best, 76.0% F1) and **Logistic Regression** (75.1% F1) and lets you compare them side by side in the browser.

---

## Dataset

| Detail | Value |
|--------|-------|
| Source | Twitter sentiment dataset (public) |
| Raw samples | 75,682 |
| After cleaning | 57,659 (23.8% removed — duplicates, URLs, HTML, special chars) |
| Classes | Positive, Negative, Neutral |
| Split | 70% train / 15% val / 15% test |

Labels validated and cleaned via `scripts/clean_data.py`. Full source documentation in [`DATA_SOURCES.md`](DATA_SOURCES.md).

---

## Pipeline Overview

```
collect_data.py  →  clean_data.py  →  eda.py  →  train.py  →  evaluate.py
                                                                    ↓
                                                         FastAPI app + frontend
```

### 1. Data Collection — `scripts/collect_data.py`
Loads Twitter CSVs from `data/raw/`, combines them, and maps labels (`Irrelevant` → `Neutral`).

### 2. Data Cleaning — `scripts/clean_data.py`
- Removes duplicates, missing values
- Strips HTML, URLs
- **Converts emojis to text descriptions** (`😀` → `grinning face`) via `emoji.demojize()`
- Removes special characters (keeps `.`, `!`, `?`, `'`)
- Lowercases

Outputs `data/processed/cleaned_dataset.csv` (57,659 rows) and train/val/test splits.

### 3. EDA — `scripts/eda.py`
Generates class distribution, top-words bar charts, and word clouds per sentiment (7 PNGs in `reports/figures/`).

### 4. Training — `scripts/train.py`
TF-IDF vectorization (5,000 unigram+bigram features), trains two models:

| Model | Accuracy | Precision | Recall | F1-Score |
|-------|----------|-----------|--------|----------|
| **Linear SVM** | **76.4%** | **0.761** | **0.760** | **0.760** |
| Logistic Regression | 75.5% | 0.753 | 0.750 | 0.751 |

Both models saved individually (`models/baseline/lr_model.pkl`, `svm_model.pkl`) plus the best as `model.pkl`.

### 5. Evaluation — `scripts/evaluate.py`
Per-class metrics on the 8,649-sample test set:

| Class | Precision | Recall | F1-Score | Support |
|-------|-----------|--------|----------|---------|
| Negative | 0.792 | 0.818 | 0.805 | 3,188 |
| Neutral | 0.726 | 0.689 | 0.707 | 2,581 |
| Positive | 0.766 | 0.773 | 0.770 | 2,880 |
| **Macro avg** | **0.761** | **0.760** | **0.760** | **8,649** |

Outputs confusion matrix, evaluation report JSON, comparison CSV, sample predictions.

---

## API

### `GET /`
Serves the interactive comparison frontend at `http://localhost:8000`.

### `GET /health`
```bash
curl http://localhost:8000/health
```
```json
{"success":true,"data":{"status":"ok","model_loaded":true}}
```

### `POST /predict`
Predict sentiment. Accepts a `model` field:
- `"svm"` — Linear SVM (default)
- `"lr"` — Logistic Regression
- `"both"` — returns both side by side

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"text": "I absolutely love this!", "model": "both"}'
```
```json
{
  "success": true,
  "data": {
    "text": "I absolutely love this!",
    "comparison": true,
    "results": [
      {"model": "svm", "sentiment": "positive", "confidence": 0.92, ...},
      {"model": "lr", "sentiment": "positive", "confidence": 0.97, ...}
    ]
  }
}
```

Single-model response:
```json
{
  "success": true,
  "data": {
    "text": "This is terrible",
    "sentiment": "negative",
    "confidence": 0.6054,
    "probabilities": {"negative": 0.6054, "neutral": 0.2443, "positive": 0.1503},
    "model": "svm",
    "processing_time_ms": 1,
    "truncated": false
  }
}
```

### Input Handling

| Input | Status | Behaviour |
|-------|--------|-----------|
| Empty text | `422` | `VALIDATION_ERROR` |
| Emoji-only (`😀`) | `200` | Demojized → "grinning face", neutral fallback |
| Emoji + text | `200` | Emojis converted to words, full prediction |
| Text > 1000 chars | `200` | Truncated, `truncated: true` |
| Model unavailable | `503` | `MODEL_UNAVAILABLE` |

### Model Loading

`ModelLoader` (singleton, auto-loads on startup) supports both models. Uses `predict_proba` for LR, `softmax(decision_function)` for LinearSVC. See [`app/model_loader.py`](app/model_loader.py).

---

## Frontend

A dark-themed single-page app served at `http://localhost:8000`:

- **Compare mode** — shows SVM vs LR in side-by-side cards with winner badge
- **Single mode** — uses only the best model (SVM)
- **Example buttons** — one-click test inputs
- **Confidence bars** + per-class probability breakdown
- **0ms–1ms predictions** on CPU

Built with vanilla HTML/CSS/JS — no framework. Served via FastAPI `StaticFiles`.

---

## Quick Start

```bash
cd sentimentsense
uv venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
uv pip install -r requirements.txt
python -c "import nltk; nltk.download('stopwords')"

python scripts/collect_data.py
python scripts/clean_data.py
python scripts/eda.py
python scripts/train.py
python scripts/evaluate.py

uvicorn app.main:app --reload
```

Open **http://localhost:8000** for the frontend or **http://localhost:8000/docs** for Swagger.

---

## Project Structure

```
sentimentsense/
├── app/
│   ├── main.py                   # API endpoints + static file serving
│   ├── config.py                 # Env-based config with CLASSES ordering
│   ├── model_loader.py           # Singleton — loads both SVM and LR
│   ├── preprocess.py             # Text cleaning with emoji demojize
│   ├── schemas.py                # Pydantic models (text + model field)
│   └── static/
│       └── index.html            # Comparison frontend
├── scripts/
│   ├── collect_data.py
│   ├── clean_data.py
│   ├── eda.py
│   ├── train.py                  # Trains + saves both models
│   └── evaluate.py
├── data/
│   ├── raw/
│   └── processed/                # cleaned_dataset.csv + train/val/test splits
├── models/
│   └── baseline/
│       ├── model.pkl             # Best model (SVM)
│       ├── lr_model.pkl          # Logistic Regression
│       ├── svm_model.pkl         # Linear SVM
│       └── vectorizer.pkl
├── reports/
│   ├── figures/                  # 7 EDA + 1 confusion matrix PNGs
│   ├── evaluation_report.json
│   ├── model_comparison.csv
│   ├── best_model.txt
│   └── sample_predictions.csv
├── config.yaml
├── DATA_SOURCES.md
├── requirements.txt
└── .gitignore
```

---

## Configuration

[`config.yaml`](config.yaml):

| Section | Key | Default | Description |
|---------|-----|---------|-------------|
| `data` | `test_size`, `val_size` | 0.15 | Split ratios |
| `cleaning` | `max_text_length` | 1000 | Character truncation |
| `training` | `tfidf_max_features` | 5000 | TF-IDF vocabulary |
| `training` | `tfidf_ngram_range` | [1, 2] | Unigram + bigram |
| `training` | `lr_max_iter` | 1000 | LR iterations |
| `api` | `host`, `port` | 0.0.0.0:8000 | Server binding |

---

## Requirements

- Python 3.10+
- scikit-learn, FastAPI, pandas, uvicorn
- See [`requirements.txt`](requirements.txt) for full list

---

## License

MIT
