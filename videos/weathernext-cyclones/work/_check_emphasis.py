import json

p = json.load(open('videos/weathernext-cyclones/work/caption-plan.json', encoding='utf-8'))
words = [w for ph in p['phrases'] for w in ph['w']]
stress = {w['t'].lower().strip('.,;:!?()"'): bool(w.get('m')) for w in words}
for term in ['weathernext', 'melissa', 'jamaica', 'category', 'nature', 'tpu', 'bigquery',
             'colab', 'ibtracs', 'thousand', 'hurricane', 'trillion', 'confidence', 'subscribe']:
    hits = [(k, v) for k, v in stress.items() if term in k]
    print(f'{term:<12} {hits[:8]}')
