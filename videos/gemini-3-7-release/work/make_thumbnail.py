import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parent.parent.parent.parent
project_dir = Path(__file__).resolve().parent.parent
thumbs_dir = project_dir / "packaging" / "thumbs"
thumbs_dir.mkdir(parents=True, exist_ok=True)

W, H = 1280, 720
img = Image.new("RGB", (W, H), (13, 17, 23))
draw = ImageDraw.Draw(img)

# Gradient / glowing backdrop
for y in range(H):
    r = int(13 + (y / H) * 10)
    g = int(17 + (y / H) * 25)
    b = int(23 + (y / H) * 45)
    draw.line([(0, y), (W, y)], fill=(r, g, b))

# Right-side preview card (evidence preview)
ev_path = ROOT / "media/projects/gemini-3-7-release/evidence/deepmind-gemini-announcement.png"
if ev_path.exists():
    ev_img = Image.open(ev_path).convert("RGB")
    # Resize and crop to fit right half
    target_w, target_h = 580, 520
    ev_img.thumbnail((target_w, target_h), Image.Resampling.LANCZOS)
    
    # Draw frame / shadow
    card_x, card_y = 660, 100
    draw.rectangle([(card_x - 10, card_y - 10), (card_x + ev_img.width + 10, card_y + ev_img.height + 10)], fill=(33, 38, 45), outline=(56, 189, 248), width=3)
    img.paste(ev_img, (card_x, card_y))

# Left side badges and bold text
# Fonts
def get_font(size, bold=True):
    for f in ["arialbd.ttf", "segoeuib.ttf", "DejaVuSans-Bold.ttf", "Helvetica-Bold.ttf"]:
        try:
            return ImageFont.truetype(f, size)
        except:
            pass
    return ImageFont.load_default()

badge_font = get_font(28, bold=True)
title_font = get_font(68, bold=True)
em_font = get_font(68, bold=True)
foot_font = get_font(32, bold=True)

# Top badge
badge_text = "GOOGLE DEEPMIND"
draw.rounded_rectangle([(60, 70), (360, 120)], radius=8, fill=(56, 189, 248))
draw.text((80, 78), badge_text, font=badge_font, fill=(13, 17, 23))

# Main Hook Headline
draw.text((60, 160), "GEMINI 3.7", font=title_font, fill=(255, 255, 255))
draw.text((60, 245), "IS HERE.", font=title_font, fill=(56, 189, 248))

# Sub Hook
draw.text((60, 350), "65.3% CODING", font=em_font, fill=(74, 222, 128))
draw.text((60, 435), "50% PRICE CUT", font=em_font, fill=(250, 204, 21))

# Bottom warning pill
draw.rounded_rectangle([(60, 560), (540, 630)], radius=10, fill=(239, 68, 68))
draw.text((80, 575), "⚠️ BUT THERE'S A CATCH", font=foot_font, fill=(255, 255, 255))

out_png = thumbs_dir / "A.png"
out_jpg = thumbs_dir / "A.jpg"

img.save(out_png, "PNG")
img.save(out_jpg, "JPEG", quality=92)

print(f"Thumbnail saved -> {out_jpg} ({out_jpg.stat().st_size / 1024:.1f} KB)")
