import requests
import json
import os
import sys

# Get token from env var, or prompt user
token = os.environ.get("PLAYALING_TOKEN")
if not token:
    token = input("Paste your Bearer token: ").strip()
if not token:
    print("Error: no token provided.")
    sys.exit(1)

headers = {
    "Authorization": f"Bearer {token}"
}

url = "https://api.playaling.com/index.php/api/v1/word-set/1862/items"
res = requests.get(url, headers=headers)

if res.status_code == 401:
    print("Error: token rejected (401 Unauthorized). Check your token.")
    sys.exit(1)
if not res.ok:
    print(f"Error: HTTP {res.status_code}")
    sys.exit(1)

data = res.json()
items = data.get("word_set_items", [])

all_words = []
for item in items:
    vocab = item.get("vocabulary", {})
    all_words.append({
        "arabic": vocab.get("substring_title"),
        "translation": vocab.get("translation_title"),
        "info": vocab.get("info"),
    })

print(f"Fetched {len(all_words)} words.")

with open("vocab.json", "w", encoding="utf-8") as f:
    json.dump(all_words, f, ensure_ascii=False, indent=2)

print(f"\nDone! {len(all_words)} words saved to vocab.json")
