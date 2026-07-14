# Sentiment Analysis

An end-to-end sentiment analysis system that collects, cleans, trains, and deploys machine learning models via a FastAPI-powered prediction API with an interactive React frontend.

Classifies text into **Positive**, **Negative**, or **Neutral** sentiment using **Linear SVM** (best, 76.0% macro F1) and **Logistic Regression** (75.1% macro F1). Compare both models side-by-side in the browser.

---

## Features

- **Two trained models** — Linear SVM and Logistic Regression, both ready for inference
- **Model comparison** — compare predictions from both models simultaneously via the API or frontend
- **Interactive frontend** — React 18 web app with dark cinematic UI, confidence bars, per-class probabilities, and one-click example inputs
- **Robust text preprocessing** — HTML stripping, URL removal, emoji-to-text conversion (`😀` → `grinning face`), special character filtering
- **Graceful error handling** — empty text, emoji-only input, text truncation, unavailable models all handled explicitly
- **Full training pipeline** — 5 scripts from data collection through evaluation, runnable end-to-end
- **Comprehensive evaluation** — per-class metrics, confusion matrix, model comparison, sample predictions
- **Single-instance model loading** — thread-safe singleton pattern loads models once on startup

---

## Pipeline

```
collect_data.py  →  clean_data.py  →  eda.py  →  train.py  →  evaluate.py
                                                                     ↓
                                                           FastAPI app + frontend
```

### 1. Data Collection — `scripts/collect_data.py`

| Source | Method | Samples |
|--------|--------|---------|
| Local CSVs | Reads `data/raw/twitter_training.csv` + `twitter_validation.csv` | 76,440 |
| Kaggle (fallback) | Downloads `kazanova/sentiment140` via `kagglehub` | 3,000 |
| Reddit (fallback) | Scrapes configured subreddits via `praw` | Configurable |
| Amazon reviews (fallback) | Downloads public review CSV | 2,000 |

Loads existing CSVs from `data/raw/`. If none found, falls back to online sources in order. Maps `Irrelevant` labels to `Neutral`. Saves combined output to `data/raw/combined_raw.csv`.

### 2. Data Cleaning — `scripts/clean_data.py`

```
raw CSV → drop duplicates → drop nulls → validate labels → clean_text() → save
```

The `clean_text()` function (shared with the API in `app/preprocess.py`):

| Step | Operation |
|------|-----------|
| Lowercase | `text.lower()` |
| Strip HTML | `BeautifulSoup(text, "html.parser").get_text()` |
| Remove URLs | `re.sub(r"https?://\S+\|www\.\S+", "", text)` |
| Convert emojis | `emoji.demojize(text)` → `:grinning_face:` → `grinning face` |
| Remove special chars | Keep only `a-z`, `0-9`, spaces, `.`, `!`, `?`, `'` |
| Collapse whitespace | `re.sub(r"\s+", " ", text).strip()` |

**Cleaning results:** 76,440 → 58,261 samples (23.8% removed). Output saved to `data/processed/cleaned_dataset.csv`.

### 3. Exploratory Data Analysis — `scripts/eda.py`

Generates 7 visualizations in `reports/figures/`:

| File | Description |
|------|-------------|
| `class_distribution.png` | Bar chart with counts and percentages per sentiment |
| `top_words_positive.png` | Top-20 most frequent words in positive texts |
| `top_words_negative.png` | Top-20 most frequent words in negative texts |
| `top_words_neutral.png` | Top-20 most frequent words in neutral texts |
| `wordcloud_positive.png` | Word cloud for positive sentiment |
| `wordcloud_negative.png` | Word cloud for negative sentiment |
| `wordcloud_neutral.png` | Word cloud for neutral sentiment |

### 4. Training — `scripts/train.py`

Applies stratified 70/15/15 train/validation/test split. Uses TF-IDF vectorization with 5,000 unigram+bigram features.

**Validation performance (F1-macro):**

| Model | F1-Score |
|-------|----------|
| Linear SVM | **0.760** |
| Logistic Regression | 0.751 |

Both models and the vectorizer are saved to `models/baseline/`. The best model (SVM) is additionally saved as `model.pkl`.

### 5. Evaluation — `scripts/evaluate.py`

Evaluates the best model on the held-out test set (8,649 samples).

**Per-class metrics:**

| Class | Precision | Recall | F1-Score | Support |
|-------|-----------|--------|----------|---------|
| Negative | 0.792 | 0.818 | 0.805 | 3,188 |
| Neutral | 0.726 | 0.689 | 0.707 | 2,581 |
| Positive | 0.766 | 0.773 | 0.770 | 2,880 |
| **Macro avg** | **0.761** | **0.760** | **0.760** | **8,649** |

Outputs:
- `reports/evaluation_report.json` — full metrics including per-class breakdown
- `reports/confusion_matrix.png` — normalized confusion matrix visualization
- `reports/model_comparison.csv` — LR vs SVM side-by-side comparison
- `reports/sample_predictions.csv` — 10 example predictions with actual vs predicted labels

---

## Dataset

| Detail | Value |
|--------|-------|
| Source | Twitter sentiment dataset (public) |
| Raw samples | 76,440 (two CSV files) |
| After cleaning | 58,261 (23.8% removed) |
| Classes | Positive, Negative, Neutral (Irrelevant mapped to Neutral) |
| Training set | 40,361 samples (70%) |
| Validation set | 8,649 samples (15%) |
| Test set | 8,649 samples (15%) |
| Splitting | Stratified by label to preserve class proportions |

Labels were validated during cleaning — only `positive`, `negative`, and `neutral` are retained. Full source documentation in [`DATA_SOURCES.md`](DATA_SOURCES.md).

---

## API

### GET /

Serves the interactive comparison frontend at `http://localhost:8000`.

```
→ 200 — HTML page (app/static/index.html)
```

### GET /health

Returns the current status of the API and model loader.

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

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | `"ok"` or `"error"` |
| `model_loaded` | boolean | Whether models are loaded in memory |

### POST /predict

Classifies text sentiment using the specified model(s).

#### Request

```json
{
  "text": "I absolutely love this!",
  "model": "svm"
}
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `text` | string | required | Input text (min 1 character, max 1000) |
| `model` | string | `"svm"` | Model to use: `"svm"`, `"lr"`, or `"both"` |

#### Single-model response (`model: "svm"` or `"lr"`)

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"text": "This is terrible", "model": "svm"}'
```

```json
{
  "success": true,
  "data": {
    "text": "This is terrible",
    "sentiment": "negative",
    "confidence": 0.6054,
    "probabilities": {
      "negative": 0.6054,
      "neutral": 0.2443,
      "positive": 0.1503
    },
    "model": "svm",
    "processing_time_ms": 1,
    "truncated": false
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `text` | string | Original input text |
| `sentiment` | string | Predicted class: `"positive"`, `"negative"`, or `"neutral"` |
| `confidence` | float | Probability of the predicted class (0–1) |
| `probabilities` | object | Per-class probabilities |
| `model` | string | Model used for prediction |
| `processing_time_ms` | int | Inference time in milliseconds |
| `truncated` | boolean | Whether input was truncated (exceeded 1000 chars) |

#### Comparison response (`model: "both"`)

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
    "truncated": false,
    "results": [
      {
        "model": "svm",
        "sentiment": "positive",
        "confidence": 0.92,
        "probabilities": {
          "negative": 0.03,
          "neutral": 0.05,
          "positive": 0.92
        },
        "processing_time_ms": 1
      },
      {
        "model": "lr",
        "sentiment": "positive",
        "confidence": 0.97,
        "probabilities": {
          "negative": 0.01,
          "neutral": 0.02,
          "positive": 0.97
        },
        "processing_time_ms": 1
      }
    ]
  }
}
```

#### Input handling

| Input | Status | Behaviour |
|-------|--------|-----------|
| Empty text (`""`) | `422` | Returns `VALIDATION_ERROR` — text is required |
| Whitespace only (`"   "`) | `422` | Stripped before validation, treated as empty |
| Emoji-only (`"😀"`) | `200` | Demojized to text, returns neutral fallback with equal probabilities |
| Emoji + text (`"😀 happy"`) | `200` | Emojis converted to words, full prediction runs normally |
| Text > 1000 characters | `200` | Truncated to 1000 chars, `truncated: true` in response |
| Model unavailable | `503` | Returns `MODEL_UNAVAILABLE` error |
| Invalid model name | `422` | Pydantic regex validation rejects values other than `svm`, `lr`, `both` |

#### Error response format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "text is required"
  }
}
```

---

## Architecture

### Backend (`app/`)

```
app/
├── main.py            # FastAPI routes: /, /health, /predict
├── config.py          # Environment variables + CLASSES ordering
├── model_loader.py    # Singleton — loads SVM + LR + vectorizer once
├── preprocess.py      # clean_text() — shared with training pipeline
└── schemas.py         # Pydantic models for request/response validation
```

### Frontend (`client/`)

```
client/
├── src/
│   ├── components/
│   │   ├── Hero.tsx          # Fullscreen video hero with navbar
│   │   ├── About.tsx         # About card with word-level highlight
│   │   ├── Features.tsx      # Feature cards with 3D hover
│   │   ├── Demo.tsx          # Prediction interface with results
│   │   └── WordsPullUp.tsx   # Animated text reveal utility
│   ├── lib/
│   │   ├── api.ts            # API client (/predict, /health)
│   │   └── useTilt.ts        # Mouse-following 3D tilt hook
│   ├── App.tsx               # Root layout, footer, mobile nav
│   ├── main.tsx              # React entry point
│   └── index.css             # Tailwind + global styles
├── index.html                # Vite HTML entry
├── vite.config.ts            # Dev server + proxy config
├── tailwind.config.js        # Theme colors and fonts
├── tsconfig.json
└── package.json
```

#### Model loading — singleton pattern

`ModelLoader` in `app/model_loader.py` ensures models are loaded exactly once using the singleton pattern:

```python
class ModelLoader:
    _instance = None
    _models = None
    _vectorizer = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._load()
        return cls._instance
```

On construction, it loads both models (`svm_model.pkl`, `lr_model.pkl`) and the TF-IDF vectorizer from `models/baseline/`.

#### Probability computation

| Model | Method |
|-------|--------|
| Logistic Regression | Native `predict_proba()` — calibrated probabilities |
| Linear SVM | `softmax(decision_function())` — `LinearSVC` does not natively support probabilities, so a softmax is applied to the decision scores |

Both return identical response schemas with per-class probabilities summing to 1.

### Pipeline scripts (`scripts/`)

| Script | Input | Output |
|--------|-------|--------|
| `collect_data.py` | — | `data/raw/combined_raw.csv` |
| `clean_data.py` | `combined_raw.csv` | `data/processed/cleaned_dataset.csv` |
| `eda.py` | `cleaned_dataset.csv` | 7 PNG figures in `reports/figures/` |
| `train.py` | `cleaned_dataset.csv` | 4 `.pkl` files + `data/processed/train/val/test.csv` + `reports/model_comparison.csv` |
| `evaluate.py` | `model.pkl` + `test.csv` | `reports/evaluation_report.json`, `reports/figures/confusion_matrix.png`, `reports/sample_predictions.csv` |

### Frontend

Built with **React 18** + **TypeScript** + **Vite** + **Tailwind CSS 3** + **Framer Motion** + **Lucide React**. Served on port 5173, proxying `/predict` and `/health` to the FastAPI backend.

- **Hero section** — fullscreen video background with noise overlay, pill-shaped navbar, animated heading
- **About section** — dark card with multi-style text and mouse-following word-by-word highlight
- **Features section** — 4 animated cards with 3D hover effects on titles
- **Demo section** — interactive prediction interface with example buttons, textarea, model selector (SVM/LR/Both), and styled result cards with confidence bars + BEST winner badge
- **Mobile navigation** — burger menu with backdrop blur overlay

---

## Quick Start

### Using `start.bat` (Windows)

```bat
start.bat
```

Launches both the FastAPI backend and the React frontend automatically. Creates the Python virtual environment, installs dependencies, trains models if missing, installs npm packages, and starts both servers.

### Manual setup

```bash
# Clone and enter the project
cd sentimentsense

# Create and activate virtual environment
uv venv
.venv\Scripts\activate       # Windows
source .venv/bin/activate     # macOS / Linux

# Install Python dependencies
uv pip install -r requirements.txt

# Download NLTK stopwords
python -c "import nltk; nltk.download('stopwords')"

# Run the full pipeline
python scripts/collect_data.py
python scripts/clean_data.py
python scripts/eda.py
python scripts/train.py
python scripts/evaluate.py

# Install frontend dependencies and start dev server
cd client
npm install
npm run dev &

# Start the API server (in a separate terminal)
cd ..
uvicorn app.main:app --reload
```

Open **http://localhost:5173** for the React frontend or **http://localhost:8000/docs** for the interactive Swagger documentation.

---

## Project Structure

```
sentimentsense/
├── app/                           # FastAPI application
│   ├── __init__.py
│   ├── main.py                    # API routes (GET /, GET /health, POST /predict)
│   ├── config.py                  # Environment variables and CLASSES ordering
│   ├── model_loader.py            # Singleton — loads SVM, LR, and vectorizer
│   ├── preprocess.py              # Text cleaning (HTML, URLs, emojis, special chars)
│   └── schemas.py                 # Pydantic models
├── client/                        # React frontend (Vite + Tailwind + Framer Motion)
│   ├── src/
│   │   ├── components/            # Hero, About, Features, Demo, etc.
│   │   ├── lib/                   # API client, useTilt hook
│   │   ├── App.tsx                # Root layout
│   │   ├── main.tsx               # Entry point
│   │   └── index.css              # Global styles
│   ├── index.html                 # Vite entry
│   ├── vite.config.ts             # Dev server + proxy
│   ├── tailwind.config.js         # Theme config
│   ├── tsconfig.json
│   └── package.json
├── scripts/                       # Training pipeline scripts
│   ├── collect_data.py            # Load local CSVs, fallback to online sources
│   ├── clean_data.py              # Deduplicate, clean, validate labels
│   ├── eda.py                     # Class distribution, top words, word clouds
│   ├── train.py                   # TF-IDF → Logistic Regression + Linear SVM
│   └── evaluate.py                # Best model evaluation, metrics, confusion matrix
├── data/
│   ├── raw/                       # Raw Twitter CSVs (gitignored)
│   └── processed/                 # cleaned_dataset.csv + train.csv / val.csv / test.csv
├── models/
│   └── baseline/
│       ├── model.pkl              # Best model (Linear SVM)
│       ├── svm_model.pkl          # Linear SVM
│       ├── lr_model.pkl           # Logistic Regression
│       └── vectorizer.pkl         # TF-IDF vectorizer (5k unigram+bigram)
├── reports/
│   ├── figures/
│   │   ├── class_distribution.png
│   │   ├── top_words_positive.png / top_words_negative.png / top_words_neutral.png
│   │   ├── wordcloud_positive.png / wordcloud_negative.png / wordcloud_neutral.png
│   │   └── confusion_matrix.png
│   ├── evaluation_report.json
│   ├── model_comparison.csv
│   ├── best_model.txt
│   └── sample_predictions.csv
├── config.yaml                    # Central configuration
├── DATA_SOURCES.md                # Dataset source documentation
├── requirements.txt               # Python dependencies
├── start.bat                      # One-click startup script (Windows)
├── .env.example                   # Environment variable template
└── .gitignore
```

---

## Configuration

### `config.yaml`

```yaml
data:
  min_samples: 5000
  random_state: 42
  test_size: 0.15
  val_size: 0.15

training:
  tfidf_max_features: 5000
  tfidf_ngram_range: [1, 2]
  lr_max_iter: 1000

api:
  host: "0.0.0.0"
  port: 8000
  max_text_length: 1000
```

| Section | Key | Default | Description |
|---------|-----|---------|-------------|
| `data` | `test_size`, `val_size` | 0.15 | Proportion of data for test and validation splits |
| `data` | `min_samples` | 5000 | Minimum required samples after cleaning |
| `data` | `random_state` | 42 | Seed for reproducible splits |
| `training` | `tfidf_max_features` | 5000 | TF-IDF vocabulary size |
| `training` | `tfidf_ngram_range` | [1, 2] | Unigram + bigram features |
| `training` | `lr_max_iter` | 1000 | Logistic Regression max iterations |
| `api` | `host` | 0.0.0.0 | Server bind address |
| `api` | `port` | 8000 | Server port |
| `api` | `max_text_length` | 1000 | Max input text length before truncation |

### Environment variables (`.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `HOST` | `0.0.0.0` | Server bind address |
| `PORT` | `8000` | Server port |
| `MAX_TEXT_LENGTH` | `1000` | Max text length for API |
| `REDDIT_CLIENT_ID` | — | Reddit API client ID (for fallback data collection) |
| `REDDIT_CLIENT_SECRET` | — | Reddit API client secret (for fallback data collection) |

Copy `.env.example` to `.env` and fill in optional values.

---

## Requirements

| Dependency | Purpose |
|------------|---------|
| Python 3.10+ | Runtime |
| fastapi | Web framework for the prediction API |
| uvicorn | ASGI server |
| scikit-learn | TF-IDF vectorization, LinearSVC, LogisticRegression |
| pandas | Data loading, manipulation, CSV I/O |
| numpy | Numerical operations |
| matplotlib | Visualization |
| seaborn | Confusion matrix visualization |
| wordcloud | Word cloud generation |
| nltk | Stopwords for EDA |
| beautifulsoup4 | HTML tag stripping |
| emoji | Emoji-to-text conversion |
| joblib | Model serialization |
| pydantic | Request/response validation |
| pyyaml | Config file loading |
| kagglehub | Fallback data source |
| praw | Reddit API (fallback data source) |
| requests | HTTP calls (fallback data source) |
| transformers | Optional transformer model support |
| torch | Optional transformer model support |

Full list with pinned versions in [`requirements.txt`](requirements.txt).

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `ModuleNotFoundError: nltk` | Run `python -c "import nltk; nltk.download('stopwords')"` |
| Models not found | Run `python scripts/train.py` to train models |
| Port 8000 in use | Change port in `config.yaml` or set `PORT` environment variable |
| Reddit collection fails | Set `REDDIT_CLIENT_ID` and `REDDIT_CLIENT_SECRET` in `.env`, or ignore — pipeline continues with local data |
| Data cleaning removes too many samples | Check `config.yaml` for cleaning settings; raw data must have valid labels |
| `uv` not found | Install it with `pip install uv` or use `python -m venv .venv` and `pip install -r requirements.txt` |

---

## License

MIT
