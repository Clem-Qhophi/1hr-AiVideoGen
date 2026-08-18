import json
with open('videos/ai-kill-switch/work/edited-transcript.json') as f:
    data = json.load(f)
words = data['words']
print(f'Total words: {len(words)}')
print(f'Duration: {words[-1]["end"]/1000:.1f}s')
# Find key phrases
key_phrases = [
    'eleven hundred',
    'Three weeks ago',
    'Here is what changed',
    'The evidence behind',
    'Here is where',
    'The pattern is clear',
]
for phrase in key_phrases:
    for i in range(len(words) - 4):
        chunk = ' '.join(w['text'] for w in words[i:i+5]).lower()
        if phrase.lower() in chunk:
            print(f'  "{phrase}" -> {words[i]["start"]/1000:.1f}s')
            break
