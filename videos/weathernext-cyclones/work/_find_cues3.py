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

shots = [
    ('WNHook', 0.0, [
        'one point four trillion', 'five days of warning', 'one full extra day',
        'strangest part of the paper',
    ]),
    ('WNContext', 29.25, [
        'seven hundred thousand', 'built-in trade-off', 'eye wall',
        'rapid intensification', 'thirty five miles', 'melissa did exactly that',
    ]),
    ('WNVerdict', 64.64, [
        'straight from the nature paper', 'three day forecasts', 'full day more',
        'twenty four hours', 'decade of progress', 'trend lines to back it',
    ]),
    ('WNMelissa', 87.64, [
        'not a lab demo', 'weak depression', 'wavered between haiti and jamaica',
        'eighty percent confidence', 'near certainty', 'tied for the strongest hurricane',
        'category 5 jump', 'top performing individual model',
    ]),
    ('WNScale', 126.2, [
        'fifteen days out', 'thousand possible futures', 'under a minute',
        'went open source', 'colab notebook', 'receipts in a second',
    ]),
    ('WNEvidence', 157.03, [
        'historical storms', 'one hundred kilometers', 'eleven knots',
        'verification report matters', 'twelve to seventy two', 'eastern pacific',
        'forty eight to a hundred twenty', 'already in their toolbox', 'second highest number',
        'near all time highs',
    ]),
    ('WNCTA', 223.67, ['channel never misses', 'first three minutes', 'subscribe now']),
    ('WNHow', 240.0, [
        'twenty terabytes', 'ibtrats', 'functional generative networks', 'spread of possible futures',
        'input resolution', 'twenty eight by twenty eight', 'hundred times coarser',
        'hundred eleven kilometers', 'surprised the scientists', 'open research question',
    ]),
    ('WNOpen', 285.4, [
        'bigquery and earth engine', 'weather lab', 'about thirty countries',
        'philippines taiwan indonesia', 'atlantic into the pacific',
    ]),
    ('WNHonest', 312.46, [
        'real one', 'not a bug', 'decision support', 'above the five year average',
        'tpu class hardware', 'short', 'decade of storms yet',
    ]),
    ('WNClose', 360.35, [
        'leaves you', 'real emergency operation', 'free to use', 'stopped being a research story',
        'first three minutes', 'subscribe so you do not miss', 'comment what you think',
    ]),
    ('WNHow2', 263.8, [
        'nobody fully understands', 'the scientists were surprised', 'ibtracs', 'still performs',
        'i will show you',
    ]),
]
for shot, base, cues in shots:
    print(f'== {shot} (base {base:.2f}s) ==')
    for c in cues:
        r = find(c)
        if r:
            print(f'  {c!r:50} global {r[0]:7.2f}  local {r[0]-base:7.2f}f@{(r[0]-base)*30:6.0f}')
        else:
            print(f'  {c!r}: NOT FOUND')
