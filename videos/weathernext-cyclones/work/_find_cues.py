import json, sys

t = json.load(open('videos/weathernext-cyclones/work/edited-transcript.json', encoding='utf-8'))
words = t['words']
print('total words:', len(words), 'dur:', t.get('duration_s'))

def norm(w):
    return w['text'].lower().strip('.,;:!?()"')

def find(phrase):
    pl = [x for x in phrase.lower().split() if x]
    for i in range(len(words) - len(pl) + 1):
        if [norm(w) for w in words[i:i+len(pl)]] == pl:
            return words[i]['start']/1000, words[i+len(pl)-1]['end']/1000
    return None

phrases = [
    'if you live near any coast',
    'for fifty years',
    'here is the claim',
    'first the numbers',
    'the field was not weak',
    'here is what this channel never misses',
    'how does it work',
    'the input resolution',
    'the data side is open',
    'now the catch',
    'one more honest caveat',
    'so where does this leave you',
    'the verdict this is the day',
]
for p in phrases:
    r = find(p)
    print(f'{p!r}: {r}')
