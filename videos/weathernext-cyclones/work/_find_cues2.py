import json

t = json.load(open('videos/weathernext-cyclones/work/edited-transcript.json', encoding='utf-8'))
words = t['words']

def norm(w):
    return w['text'].lower().strip('.,;:!?()"')

def find(phrase):
    pl = [x for x in phrase.lower().split() if x]
    for i in range(len(words) - len(pl) + 1):
        if [norm(w) for w in words[i:i+len(pl)]] == pl:
            return words[i]['start']/1000, words[i+len(pl)-1]['end']/1000
    return None

for p in [
    'and this is not a lab demo',
    'the model forecasts fifteen days out',
    'the whole thing just went open source',
    'on historical storms from 2023 to 2024',
    'the report is not shy',
    'and the field was not weak',
    'how does it work',
    'the input resolution',
    'the data side is open',
    'now the catch',
    'one more honest caveat',
    'so where does this leave you',
]:
    print(f'{p!r}: {find(p)}')
