from PIL import Image
import os

outdir = 'remotion/out'
files = sorted([f for f in os.listdir(outdir) if f.endswith('.png') and '@f' in f and f.startswith('WN')])
for f in files:
    im = Image.open(os.path.join(outdir, f)).convert('RGB')
    px = list(im.resize((80, 45)).getdata())
    uniq = len(set(px))
    lum = [0.299*r+0.587*g+0.114*b for r, g, b in px]
    m = sum(lum)/len(lum)
    var = (sum((x-m)**2 for x in lum)/len(lum))**0.5
    print(f'{f:<30} {os.path.getsize(os.path.join(outdir, f))//1024:>5}KB uniq={uniq:>4} luma_std={var:5.1f}')
