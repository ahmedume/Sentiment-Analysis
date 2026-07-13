import sys
import logging
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pandas as pd
from app.preprocess import clean_text

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

PROJECT_ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = PROJECT_ROOT / "data" / "raw"
PROCESSED_DIR = PROJECT_ROOT / "data" / "processed"
MIN_SAMPLES = 5000


def main():
    logger.info("Starting data cleaning...")
    raw_path = RAW_DIR / "combined_raw.csv"
    if not raw_path.exists():
        logger.error("Raw data not found at %s", raw_path)
        return

    df = pd.read_csv(raw_path)
    before = len(df)
    logger.info("Loaded %d raw samples", before)

    df = df.drop_duplicates(subset=["text"])
    df = df.dropna(subset=["text", "label"])
    df = df[df["text"].str.strip().astype(bool)]
    valid_labels = {"positive", "negative", "neutral"}
    df = df[df["label"].str.strip().str.lower().isin(valid_labels)]
    df["label"] = df["label"].str.strip().str.lower()

    df["cleaned_text"] = df["text"].apply(clean_text)
    df = df.dropna(subset=["cleaned_text"])
    df = df[df["cleaned_text"].str.strip().astype(bool)]

    after = len(df)
    pct_removed = ((before - after) / before * 100) if before > 0 else 0
    logger.info("Before cleaning: %d", before)
    logger.info("After cleaning: %d", after)
    logger.info("Removed: %.1f%%", pct_removed)

    if pct_removed > 50:
        logger.warning("High data loss during cleaning: %.1f%%", pct_removed)
    if after < MIN_SAMPLES:
        logger.warning("Dataset below minimum threshold: %d < %d", after, MIN_SAMPLES)

    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    df.to_csv(PROCESSED_DIR / "cleaned_dataset.csv", index=False)
    logger.info("Cleaned dataset saved to data/processed/cleaned_dataset.csv")


if __name__ == "__main__":
    main()
