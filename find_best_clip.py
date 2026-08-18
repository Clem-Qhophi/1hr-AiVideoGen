import json

data = json.load(open('videos/musty-basement-fix/work/edited-transcript.json'))
words = data['words']

for w in words:
    if 228000 <= w['start'] <= 240000:
        print(f"{w['start']/1000:.2f}s - {w['end']/1000:.2f}s: {w['text']}")
    if 295000 <= w['start'] <= 302000:
        print(f"END: {w['start']/1000:.2f}s - {w['end']/1000:.2f}s: {w['text']}")

# Also let's check Opening Hook (0 to 45s)
print("\n--- OPENING HOOK WORDS ---")
for w in words[:70]:
    print(f"{w['start']/1000:.2f}s - {w['end']/1000:.2f}s: {w['text']}")
