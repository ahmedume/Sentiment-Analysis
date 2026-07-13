import re
import emoji
from bs4 import BeautifulSoup

def clean_text(raw_text: str) -> str | None:
    text = raw_text.lower()
    text = BeautifulSoup(text, "html.parser").get_text()
    text = re.sub(r"https?://\S+|www\.\S+", "", text)
    text = emoji.demojize(text, language="en")
    text = re.sub(r":[a-z_]+:", lambda m: m.group(0).replace("_", " ").strip(":"), text)
    text = re.sub(r"[^a-z0-9\s\.\!\?\']", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text if text else None
