import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parent.parent.parent.parent
project_dir = Path(__file__).resolve().parent.parent
thumbs_dir = project_dir / "packaging" / "thumbs"
thumbs_dir.mkdir(parents=True, exist_ok=True)

W, H = 1280, 720

def get_font(size, bold=True):
    for f in ["arialbd.ttf", "segoeuib.ttf", "DejaVuSans-Bold.ttf", "Helvetica-Bold.ttf"]:
        try:
            return ImageFont.truetype(f, size)
        except:
            pass
    return ImageFont.load_default()

badge_font = get_font(28, bold=True)
title_font = get_font(72, bold=True)
em_font = get_font(64, bold=True)
foot_font = get_font(32, bold=True)

# THUMBNAIL A: The Cyber Leaderboard Shocker
def make_thumb_a():
    img = Image.new("RGB", (W, H), (13, 17, 23))
    draw = ImageDraw.Draw(img)
    
    # Glowing backdrop gradient
    for y in range(H):
        r = int(13 + (y / H) * 12)
        g = int(17 + (y / H) * 28)
        b = int(23 + (y / H) * 55)
        draw.line([(0, y), (W, y)], fill=(r, g, b))
        
    # Evidence card on the right
    ev_path = ROOT / "media/projects/glm-5-3-release/evidence/cybergym-leaderboard.png"
    if ev_path.exists():
        ev_img = Image.open(ev_path).convert("RGB")
        target_w, target_h = 580, 520
        ev_img.thumbnail((target_w, target_h), Image.Resampling.LANCZOS)
        card_x, card_y = 660, 100
        draw.rectangle([(card_x - 10, card_y - 10), (card_x + ev_img.width + 10, card_y + ev_img.height + 10)],
                       fill=(33, 38, 45), outline=(56, 189, 248), width=3)
        img.paste(ev_img, (card_x, card_y))
        
    # Top pill
    draw.rounded_rectangle([(60, 70), (380, 120)], radius=8, fill=(239, 68, 68))
    draw.text((80, 78), "ZHIPU AI (Z.AI)", font=badge_font, fill=(255, 255, 255))
    
    # Main Hook
    draw.text((60, 160), "GLM-5.3", font=title_font, fill=(255, 255, 255))
    draw.text((60, 250), "IS HERE.", font=title_font, fill=(56, 189, 248))
    
    # Sub Hook
    draw.text((60, 360), "84.5% CYBER #1", font=em_font, fill=(239, 68, 68))
    draw.text((60, 445), "BEATS OPENAI", font=em_font, fill=(250, 204, 21))
    
    # Bottom warning pill
    draw.rounded_rectangle([(60, 560), (560, 630)], radius=10, fill=(245, 158, 11))
    draw.text((80, 575), "⚠️ 2-WEEK CATCH INSIDE", font=foot_font, fill=(13, 17, 23))
    
    img.save(thumbs_dir / "A.png", "PNG")
    img.save(thumbs_dir / "A.jpg", "JPEG", quality=92)
    print("Saved Thumbnail A")

# THUMBNAIL B: Coding & Huawei Ascend Powerhouse
def make_thumb_b():
    img = Image.new("RGB", (W, H), (15, 23, 42))
    draw = ImageDraw.Draw(img)
    
    for y in range(H):
        r = int(15 + (y / H) * 8)
        g = int(23 + (y / H) * 35)
        b = int(42 + (y / H) * 40)
        draw.line([(0, y), (W, y)], fill=(r, g, b))
        
    ev_path = project_dir / "work" / "cards" / "card_deepswe.png"
    if ev_path.exists():
        ev_img = Image.open(ev_path).convert("RGB")
        target_w, target_h = 580, 520
        ev_img.thumbnail((target_w, target_h), Image.Resampling.LANCZOS)
        card_x, card_y = 660, 100
        draw.rectangle([(card_x - 10, card_y - 10), (card_x + ev_img.width + 10, card_y + ev_img.height + 10)],
                       fill=(22, 27, 34), outline=(34, 197, 94), width=3)
        img.paste(ev_img, (card_x, card_y))
        
    draw.rounded_rectangle([(60, 70), (440, 120)], radius=8, fill=(34, 197, 94))
    draw.text((80, 78), "HUAWEI ASCEND NPU", font=badge_font, fill=(13, 17, 23))
    
    draw.text((60, 160), "66.9% SWE", font=title_font, fill=(34, 197, 94))
    draw.text((60, 250), "CODING LEAP", font=title_font, fill=(255, 255, 255))
    
    draw.text((60, 360), "NO NVIDIA", font=em_font, fill=(250, 204, 21))
    draw.text((60, 445), "1M CONTEXT", font=em_font, fill=(56, 189, 248))
    
    draw.rounded_rectangle([(60, 560), (520, 630)], radius=10, fill=(56, 189, 248))
    draw.text((80, 575), "⚡ NEW OPEN BENCHMARK", font=foot_font, fill=(13, 17, 23))
    
    img.save(thumbs_dir / "B.png", "PNG")
    img.save(thumbs_dir / "B.jpg", "JPEG", quality=92)
    print("Saved Thumbnail B")

# THUMBNAIL C: Bold Verdict / Industry Shift
def make_thumb_c():
    img = Image.new("RGB", (W, H), (11, 15, 25))
    draw = ImageDraw.Draw(img)
    
    for y in range(H):
        r = int(11 + (y / H) * 25)
        g = int(15 + (y / H) * 15)
        b = int(25 + (y / H) * 35)
        draw.line([(0, y), (W, y)], fill=(r, g, b))
        
    ev_path = ROOT / "media/projects/glm-5-3-release/evidence/zhipu-glm53-announcement.png"
    if ev_path.exists():
        ev_img = Image.open(ev_path).convert("RGB")
        target_w, target_h = 580, 520
        ev_img.thumbnail((target_w, target_h), Image.Resampling.LANCZOS)
        card_x, card_y = 660, 100
        draw.rectangle([(card_x - 10, card_y - 10), (card_x + ev_img.width + 10, card_y + ev_img.height + 10)],
                       fill=(22, 27, 34), outline=(239, 68, 68), width=3)
        img.paste(ev_img, (card_x, card_y))
        
    draw.rounded_rectangle([(60, 70), (410, 120)], radius=8, fill=(250, 204, 21))
    draw.text((80, 78), "BREAKING AI NEWS", font=badge_font, fill=(13, 17, 23))
    
    draw.text((60, 160), "CHINA JUST", font=title_font, fill=(255, 255, 255))
    draw.text((60, 250), "SURPASSED US", font=title_font, fill=(239, 68, 68))
    
    draw.text((60, 360), "GLM-5.3", font=em_font, fill=(56, 189, 248))
    draw.text((60, 445), "2,436 CVES", font=em_font, fill=(34, 197, 94))
    
    draw.rounded_rectangle([(60, 560), (520, 630)], radius=10, fill=(239, 68, 68))
    draw.text((80, 575), "🚨 UNDER 3 MIN VERDICT", font=foot_font, fill=(255, 255, 255))
    
    img.save(thumbs_dir / "C.png", "PNG")
    img.save(thumbs_dir / "C.jpg", "JPEG", quality=92)
    print("Saved Thumbnail C")

if __name__ == "__main__":
    make_thumb_a()
    make_thumb_b()
    make_thumb_c()
    print("All 3 thumbnails rendered.")
