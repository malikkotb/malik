import json
import csv
import re

def clean(text):
    # Remove parenthetical tags like (Egy), (MSA/Lev), (Egy, Lev), etc.
    text = re.sub(r'\([^)]*\)', '', text)
    # Remove bare uppercase tags like MSA
    text = re.sub(r'\b[A-Z]{2,5}\b', '', text)
    return text.strip(" ,;")

with open("vocab.json", encoding="utf-8") as f:
    words = json.load(f)

with open("vocab_anki.csv", "w", encoding="utf-8", newline="") as f:
    writer = csv.writer(f, delimiter=";")
    for word in words:
        arabic = clean(word.get("arabic") or "")
        translation = clean(word.get("translation") or "")
        if arabic and translation:
            writer.writerow([arabic, translation])

print(f"Done! {len(words)} cards saved to vocab_anki.csv")
