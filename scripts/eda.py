import logging
from pathlib import Path

import pandas as pd
import matplotlib.pyplot as plt
from wordcloud import WordCloud
from nltk.corpus import stopwords

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

PROJECT_ROOT = Path(__file__).resolve().parent.parent
PROCESSED_DIR = PROJECT_ROOT / "data" / "processed"
FIGURES_DIR = PROJECT_ROOT / "reports" / "figures"


def _ensure_stopwords():
    try:
        stopwords.words("english")
    except LookupError:
        import nltk
        nltk.download("stopwords")


def plot_class_distribution(df, save_path):
    counts = df["label"].value_counts()
    fig, ax = plt.subplots(figsize=(8, 5))
    bars = ax.bar(counts.index, counts.values, color=["#2ecc71", "#e74c3c", "#95a5a6"])
    for bar, count in zip(bars, counts.values):
        pct = count / len(df) * 100
        ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 20,
                f"{count} ({pct:.1f}%)", ha="center", fontsize=11)
    ax.set_title("Class Distribution", fontsize=14, fontweight="bold")
    ax.set_ylabel("Count")
    ax.set_xlabel("Sentiment")
    fig.tight_layout()
    fig.savefig(save_path, dpi=150)
    plt.close(fig)


def plot_top_words(df: pd.DataFrame, label: str, save_path: Path) -> None:
    stop_words = set(stopwords.words("english"))
    words = []
    for text in df[df["label"] == label]["cleaned_text"]:
        for w in str(text).split():
            w = w.strip().lower()
            if w not in stop_words and w.isalpha():
                words.append(w)
    freq = pd.Series(words).value_counts().head(20)
    fig, ax = plt.subplots(figsize=(10, 6))
    freq.sort_values().plot.barh(ax=ax, color="steelblue")
    ax.set_title(f"Top 20 Words — {label.capitalize()}", fontsize=14, fontweight="bold")
    ax.set_xlabel("Frequency")
    fig.tight_layout()
    fig.savefig(save_path, dpi=150)
    plt.close(fig)


def plot_wordcloud(df: pd.DataFrame, label: str, save_path: Path) -> None:
    stop_words = set(stopwords.words("english"))
    text = " ".join(df[df["label"] == label]["cleaned_text"].dropna())
    wc = WordCloud(width=800, height=400, stopwords=stop_words, background_color="white", max_words=100)
    wc.generate(text)
    fig, ax = plt.subplots(figsize=(10, 5))
    ax.imshow(wc, interpolation="bilinear")
    ax.axis("off")
    ax.set_title(f"Word Cloud — {label.capitalize()}", fontsize=14, fontweight="bold")
    fig.tight_layout()
    fig.savefig(save_path, dpi=150)
    plt.close(fig)


def main():
    logger.info("Starting EDA...")
    dataset_path = PROCESSED_DIR / "cleaned_dataset.csv"
    if not dataset_path.exists():
        logger.error("Cleaned dataset not found at %s", dataset_path)
        return

    df = pd.read_csv(dataset_path)
    if df.empty:
        logger.error("Dataset is empty.")
        return

    logger.info("Loaded %d samples", len(df))
    logger.info("Class distribution:")
    for label, count in df["label"].value_counts().items():
        logger.info("  %s: %d (%.1f%%)", label, count, count / len(df) * 100)

    FIGURES_DIR.mkdir(parents=True, exist_ok=True)
    plot_class_distribution(df, FIGURES_DIR / "class_distribution.png")
    for label in ["positive", "negative", "neutral"]:
        plot_top_words(df, label, FIGURES_DIR / f"top_words_{label}.png")
        plot_wordcloud(df, label, FIGURES_DIR / f"wordcloud_{label}.png")

    logger.info("All EDA figures saved to reports/figures/")


if __name__ == "__main__":
    main()
