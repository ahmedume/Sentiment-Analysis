# SentimentSense

End-to-end sentiment analysis system — from data collection to deployed prediction API.

Classifies text into **Positive**, **Negative**, or **Neutral** sentiment using a Linear SVM model trained on 57,659 Twitter samples. The best-performing model achieves **76.5% accuracy** and **76.0% macro F1-score** on held-out test data.

---

## Dataset

| Detail | Value |
|--------|-------|
| Source | Twitter sentiment dataset (public) |
| Raw samples | 75,682 |
| After cleaning | 57,659 (23.8% removed — duplicates, URLs, HTML, emojis, special chars) |
| Classes | Positive, Negative, Neutral |
| Split | 70% train / 15% val / 15% test |

Labels validated and cleaned via `scripts/clean_data.py`. Full source documentation in [`DATA_SOURCES.md`](DATA_SOURCES.md).

---

## Pipeline Overview

```
collect_data.py  →  clean_data.py  →  eda.py  →  train.py  →  evaluate.py
                                                                    ↓
                                                              FastAPI app
```

### 1. Data Collection — `scripts/collect_data.py`
Loads the Twitter CSVs from `data/raw/` (or local copies), combines them into a single `combined_raw.csv`, and maps labels (`Positive`/`Negative`/`Neutral`/`Irrelevant`). The `Irrelevant` class is merged into `Neutral`.

### 2. Data Cleaning — `scripts/clean_data.py`
Applies the following transformations:
- Removes duplicate rows and missing text
- Strips HTML tags via `BeautifulSoup`
- Removes URLs (`https?://...`, `www...`)
- Removes emojis via the `emoji` library
- Removes non-alphanumeric special characters (keeps `.`, `!`, `?`, `'`)
- Lowercases all text
- Filters out entries with empty text after cleaning
- Labels: `Irrelevant` → `Neutral`, drops `Positive`/`Negative`→`positive`/`negative`

Outputs `data/processed/cleaned_dataset.csv` (57,659 rows) and split CSVs (`train.csv`, `val.csv`, `test.csv`).

### 3. Exploratory Data Analysis — `scripts/eda.py`
Generates 7 visualization files in `reports/figures/`:
- `class_distribution.png` — histogram of label counts
- `top_words_positive.png`, `top_words_negative.png`, `top_words_neutral.png` — most frequent words per class (bar charts)
- `wordcloud_positive.png`, `wordcloud_negative.png`, `wordcloud_neutral.png` — word clouds per class

### 4. Model Training — `scripts/train.py`
Trains two models using TF-IDF vectorization (5,000 features, unigram+bigram):

| Model | Accuracy | Precision | Recall | F1-Score |
|-------|----------|-----------|--------|----------|
| **Linear SVM** | **76.5%** | **0.761** | **0.760** | **0.760** |
| Logistic Regression | 75.5% | 0.753 | 0.750 | 0.751 |

**Linear SVM** selected as best and saved to `models/baseline/` (`model.pkl` + `vectorizer.pkl`).

DistilBERT was considered but skipped during training — CPU training on 40k+ samples would require ~14 hours per epoch, making it impractical without a GPU.

### 5. Evaluation — `scripts/evaluate.py`
Full per-class breakdown on the 8,649-sample test set:

| Class | Precision | Recall | F1-Score | Support |
|-------|-----------|--------|----------|---------|
| Negative | 0.792 | 0.818 | 0.805 | 3,188 |
| Neutral | 0.726 | 0.689 | 0.707 | 2,581 |
| Positive | 0.766 | 0.773 | 0.770 | 2,880 |
| **Macro avg** | **0.761** | **0.760** | **0.760** | **8,649** |

Outputs:
- `reports/evaluation_report.json` — all metrics in structured JSON
- `reports/model_comparison.csv` — side-by-side comparison
- `reports/best_model.txt` — selected model name
- `reports/sample_predictions.csv` — 10 sample predictions with actual vs predicted
- `reports/figures/confusion_matrix.png` — normalized confusion matrix

---

## API

### Endpoints

#### `GET /health`
Returns service status and whether the model is loaded.

```bash
curl http://localhost:8000/health
```

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "model_loaded": true
  }
}
```

#### `POST /predict`
Predicts sentiment for input text.

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"text": "I absolutely love this product! It is amazing."}'
```

```json
{
  "success": true,
  "data": {
    "text": "I absolutely love this product! It is amazing.",
    "sentiment": "positive",
    "confidence": 0.9894,
    "probabilities": {
      "positive": 0.9894,
      "negative": 0.0079,
      "neutral": 0.0027
    },
    "processing_time_ms": 8,
    "truncated": false
  }
}
```

### Input Validation

- **Empty text** — returns `422` with `VALIDATION_ERROR`
- **No analyzable content** (e.g. only emojis/URLs) — returns `422` with `NO_CONTENT`
- **Text > 1000 chars** — truncated to 1000 with `truncated: true`
- **Model not loaded** — returns `503` with `MODEL_UNAVAILABLE`

### Model Loading

The model uses a singleton `ModelLoader` (lazy-loaded on first request) with automatic fallback: `predict_proba` for Logistic Regression, `softmax(decision_function)` for Linear SVM. See [`app/model_loader.py`](app/model_loader.py).

---

## Quick Start

```bash
# 1. Enter the project
cd sentimentsense

# 2. Create virtual environment
uv venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate

# 3. Install dependencies
uv pip install -r requirements.txt

# 4. Download NLTK stopwords
python -c "import nltk; nltk.download('stopwords')"

# 5. Run the full pipeline
python scripts/collect_data.py
python scripts/clean_data.py
python scripts/eda.py
python scripts/train.py
python scripts/evaluate.py

# 6. Start the API
uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

---

## Project Structure

```
sentimentsense/
├── app/                          # FastAPI web application
│   ├── __init__.py
│   ├── main.py                   # API endpoints (GET /health, POST /predict)
│   ├── config.py                 # Environment-based configuration
│   ├── model_loader.py           # Singleton model loader with fallback
│   ├── preprocess.py             # Text cleaning pipeline (used by both API and training)
│   └── schemas.py                # Pydantic request/response models
├── data/
│   ├── raw/                      # Original CSV files + combined_raw.csv
│   └── processed/                # Cleaned dataset + train/val/test splits
├── models/
│   └── baseline/                 # Trained model.pkl + vectorizer.pkl
├── reports/
│   ├── figures/                  # EDA plots + confusion matrix (7 PNGs)
│   ├── best_model.txt            # Selected model name
│   ├── evaluation_report.json    # Full metrics
│   ├── model_comparison.csv      # LR vs SVM comparison
│   └── sample_predictions.csv    # 10 example predictions
├── scripts/
│   ├── collect_data.py           # Loads data from local CSVs
│   ├── clean_data.py             # Dedup, clean, split, label map
│   ├── eda.py                    # Visualizations
│   ├── train.py                  # LR + SVM training and comparison
│   └── evaluate.py               # Full evaluation on test set
├── config.yaml                   # Central configuration
├── DATA_SOURCES.md               # Source documentation
├── requirements.txt              # Python dependencies
└── .gitignore
```

---

## Configuration

Key settings in [`config.yaml`](config.yaml):

| Section | Parameter | Default | Description |
|---------|-----------|---------|-------------|
| `data` | `test_size`, `val_size` | 0.15 | Train/val/test split ratios |
| `data` | `random_state` | 42 | Reproducibility seed |
| `cleaning` | `max_text_length` | 1000 | Max chars before truncation |
| `training` | `tfidf_max_features` | 5000 | TF-IDF vocabulary size |
| `training` | `tfidf_ngram_range` | [1, 2] | Unigram + bigram |
| `training` | `lr_max_iter` | 1000 | Logistic Regression iterations |
| `api` | `host`, `port` | 0.0.0.0:8000 | Server binding |

Environment variables override config values at runtime (see [`app/config.py`](app/config.py)).

---

## Requirements

Core dependencies (full list in [`requirements.txt`](requirements.txt)):

- Python 3.10+
- scikit-learn 1.6+ — model training and evaluation
- FastAPI 0.115+ — prediction API server
- pandas 2.2+ — data handling
- matplotlib 3.10+ / seaborn 0.13+ / wordcloud — visualizations
- nltk 3.9+ — stopwords
- beautifulsoup4 / lxml — HTML stripping
- joblib — model serialization
- PyYAML — configuration loader

---

## Future Improvements

- **Deep learning model** — fine-tune DistilBERT/BERT when GPU is available
- **Hyperparameter tuning** — GridSearchCV on SVM C/kernel and LR regularization
- **Class weighting** — address neutral class (0.707 F1) with balanced class weights or oversampling
- **API auth** — API key validation for production deployment
- **Batch prediction** — endpoint accepting multiple texts at once
- **Docker** — containerized deployment with docker-compose
- **CI/CD** — automated testing + model retraining pipeline

---

## License

MIT
