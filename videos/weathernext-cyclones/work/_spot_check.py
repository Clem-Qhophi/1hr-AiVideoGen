from PIL import Image
import subprocess, os, tempfile

mp4 = 'videos/weathernext-cyclones/output/weathernext-cyclones-preview.mp4'
tmp = 'C:/Users/OMEN~1/AppData/Local/Temp/opencode'
checks = [  # (time_s, what we expect to be on screen)
    (3.0, 'hook: statement card'),
    (45.0, 'context: trade-off cards'),
    (75.0, 'verdict: +24h claim'),
    (105.0, 'melissa: Cat5 statement'),
    (165.0, 'evidence: deepmind blog screenshot (high contrast, white page)'),
    (205.0, 'evidence: NHC report screenshot'),
    (230.0, 'cta: subscribe card'),
    (270.0, 'how: 100x coarser statement'),
    (295.0, 'open: github screenshot (dark)'),
    (335.0, 'honest: caveats'),
    (390.0, 'close: CTA')
]
for t, label in checks:
    f = os.path.join(tmp, f'spot_{int(t)}.png')
    subprocess.run(['ffmpeg', '-ss', str(t), '-i', mp4, '-frames:v', '1', '-y', f],
                   capture_output=True)
    im = Image.open(f).convert('RGB')
    px = list(im.resize((80, 45)).getdata())
    uniq = len(set(px))
    lum = [0.299*r+0.587*g+0.114*b for r, g, b in px]
    m = sum(lum)/len(lum)
    var = (sum((x-m)**2 for x in lum)/len(lum))**0.5
    print(f'{t:>6.1f}s  {label:<46} uniq={uniq:>4} luma_std={var:5.1f}')
