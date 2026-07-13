import logging
from pathlib import Path

import pandas as pd

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

PROJECT_ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = PROJECT_ROOT / "data" / "raw"
MIN_SAMPLES = 5000


def collect_kaggle() -> pd.DataFrame:
    try:
        import kagglehub
        path = kagglehub.dataset_download("kazanova/sentiment140")
        df = pd.read_csv(
            f"{path}/training.1600000.processed.noemoticon.csv",
            encoding="latin-1",
            header=None,
            names=["target", "id", "date", "flag", "user", "text"]
        )
        df["label"] = df["target"].map({0: "negative", 2: "neutral", 4: "positive"})
        df["source"] = "kaggle"
        df = df[["text", "label", "source"]].head(3000)
        return df
    except Exception as e:
        logger.warning("Kaggle download failed: %s", e)
        return pd.DataFrame(columns=["text", "label", "source"])


def collect_reddit() -> pd.DataFrame:
    import os
    client_id = os.getenv("REDDIT_CLIENT_ID")
    client_secret = os.getenv("REDDIT_CLIENT_SECRET")
    if not client_id or not client_secret:
        logger.warning("REDDIT_CLIENT_ID / REDDIT_CLIENT_SECRET not set. Skipping Reddit.")
        return pd.DataFrame(columns=["text", "label", "source"])
    try:
        import praw
        import yaml
        config_path = PROJECT_ROOT / "config.yaml"
        with open(config_path) as f:
            config = yaml.safe_load(f)
        subreddits = config["sources"]["reddit"]["subreddits"]
        limit = config["sources"]["reddit"]["limit_per_subreddit"]
        reddit = praw.Reddit(
            client_id=os.getenv("REDDIT_CLIENT_ID"),
            client_secret=os.getenv("REDDIT_CLIENT_SECRET"),
            user_agent="sentimentsense_scraper v1.0"
        )
        rows = []
        for sub_name in subreddits:
            try:
                sub = reddit.subreddit(sub_name)
                for post in sub.hot(limit=limit):
                    if post.selftext and len(post.selftext.strip()) > 20:
                        rows.append({"text": post.selftext, "label": "neutral", "source": f"reddit_{sub_name}"})
            except Exception as e:
                logger.warning("Failed to scrape r/%s: %s", sub_name, e)
        return pd.DataFrame(rows)
    except ImportError:
        logger.warning("praw not installed. Skipping Reddit collection.")
        return pd.DataFrame(columns=["text", "label", "source"])


def collect_reviews() -> pd.DataFrame:
    try:
        import requests
        url = "https://raw.githubusercontent.com/nickmuchi/amazon-reviews-scraper/main/data/amazon_reviews.csv"
        df = pd.read_csv(url)
        if "reviewText" in df.columns and "overall" in df.columns:
            df["text"] = df["reviewText"]
            df["label"] = df["overall"].apply(
                lambda x: "positive" if x >= 4 else ("negative" if x <= 2 else "neutral")
            )
            df["source"] = "reviews"
            return df[["text", "label", "source"]].head(2000)
        return pd.DataFrame(columns=["text", "label", "source"])
    except Exception as e:
        logger.warning("Review download failed: %s", e)
        return pd.DataFrame(columns=["text", "label", "source"])


def load_local_csvs() -> pd.DataFrame:
    csv_files = list(RAW_DIR.glob("*.csv"))
    if not csv_files:
        return pd.DataFrame(columns=["text", "label", "source"])
    dfs = []
    for fpath in csv_files:
        try:
            df = pd.read_csv(fpath, header=None)
            if df.shape[1] >= 4:
                df = df.iloc[:, [3, 2]]
                df.columns = ["text", "label"]
                df["source"] = fpath.stem
                dfs.append(df)
        except Exception as e:
            logger.warning("Failed to read %s: %s", fpath.name, e)
    if dfs:
        return pd.concat(dfs, ignore_index=True)
    return pd.DataFrame(columns=["text", "label", "source"])


def main():
    logger.info("Starting data collection...")

    local_df = load_local_csvs()
    if not local_df.empty:
        logger.info("Loaded %d samples from local CSVs in data/raw/", len(local_df))
        local_df.to_csv(RAW_DIR / "combined_raw.csv", index=False)
        logger.info("Saved to data/raw/combined_raw.csv")
        return

    logger.info("No local CSVs found. Falling back to online sources...")
    all_dfs = []
    sources = [
        ("kaggle", collect_kaggle),
        ("reddit", collect_reddit),
        ("reviews", collect_reviews),
    ]
    for name, func in sources:
        logger.info("Collecting from %s...", name)
        df = func()
        logger.info("Collected %d samples from %s", len(df), name)
        if not df.empty:
            all_dfs.append(df)

    if not all_dfs:
        logger.error("No data collected from any source.")
        return

    combined = pd.concat(all_dfs, ignore_index=True)
    combined.to_csv(RAW_DIR / "combined_raw.csv", index=False)
    logger.info("Total raw samples collected: %d", len(combined))
    logger.info("Saved to data/raw/combined_raw.csv")


if __name__ == "__main__":
    main()
