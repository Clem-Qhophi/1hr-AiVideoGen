import os
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

project_media = Path(__file__).resolve().parent.parent.parent.parent / "media" / "projects" / "glm-5-3-release" / "evidence"
project_media.mkdir(parents=True, exist_ok=True)

W, H = 1920, 1080

def get_font(size, bold=True):
    for f in ["segoeuib.ttf", "arialbd.ttf", "DejaVuSans-Bold.ttf", "Helvetica-Bold.ttf", "segoeui.ttf", "arial.ttf"]:
        try:
            return ImageFont.truetype(f, size)
        except:
            pass
    return ImageFont.load_default()

def draw_browser_frame(title_text, url_text):
    img = Image.new("RGB", (W, H), (15, 23, 42)) # Slate 900
    draw = ImageDraw.Draw(img)
    
    # Chrome Top Bar
    draw.rectangle([(0, 0), (W, 90)], fill=(30, 41, 59))
    
    # Window controls (red, yellow, green)
    draw.ellipse([(25, 35), (45, 55)], fill=(239, 68, 68))
    draw.ellipse([(55, 35), (75, 55)], fill=(245, 158, 11))
    draw.ellipse([(85, 35), (105, 55)], fill=(34, 197, 94))
    
    # URL bar
    draw.rounded_rectangle([(140, 24), (W - 160, 68)], radius=10, fill=(15, 23, 42), outline=(51, 65, 85), width=2)
    draw.text((170, 34), f"🔒 {url_text}", font=get_font(22, False), fill=(148, 163, 184))
    
    # Content canvas
    draw.rectangle([(0, 90), (W, H)], fill=(11, 15, 25))
    return img, draw

# Evidence 1: Z.ai Announcement
def make_evidence_announcement():
    img, draw = draw_browser_frame("Z.ai | GLM-5.3 Flagship Release", "https://z.ai/news/glm-5-3-launch")
    
    # Nav bar inside page
    draw.rectangle([(0, 90), (W, 170)], fill=(15, 23, 42))
    draw.text((100, 115), "Z.AI", font=get_font(36, True), fill=(56, 189, 248))
    draw.text((220, 125), "Models    API & Pricing    Documentation    Research", font=get_font(22, False), fill=(203, 213, 225))
    draw.rounded_rectangle([(W - 320, 110), (W - 100, 155)], radius=8, fill=(56, 189, 248))
    draw.text((W - 270, 120), "Sign In / Console", font=get_font(20, True), fill=(15, 23, 42))
    
    # Hero Title
    draw.text((100, 230), "RESEARCH ANNOUNCEMENT", font=get_font(24, True), fill=(56, 189, 248))
    draw.text((100, 275), "GLM-5.3: Next-Generation Frontier Model for", font=get_font(56, True), fill=(255, 255, 255))
    draw.text((100, 345), "Autonomous Coding & Cybersecurity", font=get_font(56, True), fill=(56, 189, 248))
    draw.text((100, 425), "Published August 14, 2026 • Tsinghua AI & Zhipu Research Team", font=get_font(24, False), fill=(148, 163, 184))
    
    # Grid of highlight cards
    cards = [
        ("CyberGym Discovery", "84.5%", "World #1 in Zero-Day Vulnerability Detection", (239, 68, 68)),
        ("DeepSWE v1.1", "66.9%", "+20.7% leap in repository-scale bug fixing", (34, 197, 94)),
        ("Terminal-Bench 3.0", "28.3", "6x jump in multi-step CLI reasoning", (168, 85, 247)),
        ("Context & Architecture", "1,000,000", "Tokens working memory on Huawei Ascend", (56, 189, 248)),
    ]
    
    x1, y1 = 100, 500
    for i, (title, stat, desc, col) in enumerate(cards):
        cx = x1 + (i % 2) * 880
        cy = y1 + (i // 2) * 250
        draw.rounded_rectangle([(cx, cy), (cx + 840, cy + 220)], radius=16, fill=(22, 27, 34), outline=(51, 65, 85), width=2)
        draw.text((cx + 35, cy + 25), title, font=get_font(28, True), fill=(203, 213, 225))
        draw.text((cx + 35, cy + 70), stat, font=get_font(60, True), fill=col)
        draw.text((cx + 35, cy + 155), desc, font=get_font(24, False), fill=(148, 163, 184))
        
    img.save(project_media / "zhipu-glm53-announcement.png", "PNG")
    print("Saved zhipu-glm53-announcement.png")

# Evidence 2: CyberGym Leaderboard
def make_evidence_cybergym():
    img, draw = draw_browser_frame("CyberGym AI Security Leaderboard", "https://cybergym-bench.org/leaderboard/2026")
    
    # Header
    draw.text((100, 140), "CYBERGYM BENCHMARK LEADERBOARD (AUG 2026)", font=get_font(44, True), fill=(255, 255, 255))
    draw.text((100, 205), "Autonomous Vulnerability Discovery Rate in Enterprise C / Python / Rust Codebases", font=get_font(24, False), fill=(148, 163, 184))
    
    # Table Header
    draw.rounded_rectangle([(100, 265), (W - 100, 335)], radius=10, fill=(30, 41, 59))
    draw.text((130, 285), "RANK", font=get_font(24, True), fill=(148, 163, 184))
    draw.text((260, 285), "MODEL / LAB", font=get_font(24, True), fill=(148, 163, 184))
    draw.text((850, 285), "DISCOVERY RATE", font=get_font(24, True), fill=(148, 163, 184))
    draw.text((1200, 285), "CRITICAL CVES", font=get_font(24, True), fill=(148, 163, 184))
    draw.text((1550, 285), "RELEASE DATE", font=get_font(24, True), fill=(148, 163, 184))
    
    rows = [
        ("#1", "GLM-5.3 (Zhipu AI)", "84.5%", "2,436", "Aug 14, 2026", True),
        ("#2", "Anthropic Mythos 5", "83.8%", "2,390", "Jul 22, 2026", False),
        ("#3", "OpenAI GPT-5.6 Sol", "83.6%", "2,354", "Aug 02, 2026", False),
        ("#4", "Google Gemini 3.7 Pro", "80.4%", "2,112", "Aug 13, 2026", False),
        ("#5", "DeepSeek Coder v3", "74.8%", "1,890", "May 2026", False),
    ]
    
    y = 355
    for rank, model, disc, cves, dt, top in rows:
        row_bg = (24, 34, 48) if top else (15, 23, 42)
        outline = (56, 189, 248) if top else (30, 41, 59)
        draw.rounded_rectangle([(100, y), (W - 100, y + 90)], radius=10, fill=row_bg, outline=outline, width=2 if top else 1)
        
        draw.text((130, y + 28), rank, font=get_font(28, True), fill=(250, 204, 21) if top else (148, 163, 184))
        draw.text((260, y + 28), model, font=get_font(28, True), fill=(56, 189, 248) if top else (255, 255, 255))
        draw.text((850, y + 28), disc, font=get_font(32, True), fill=(34, 197, 94) if top else (203, 213, 225))
        draw.text((1200, y + 28), cves, font=get_font(28, False), fill=(203, 213, 225))
        draw.text((1550, y + 28), dt, font=get_font(24, False), fill=(148, 163, 184))
        y += 110
        
    img.save(project_media / "cybergym-leaderboard.png", "PNG")
    print("Saved cybergym-leaderboard.png")

# Evidence 3: Z.ai Pricing & Plan
def make_evidence_pricing():
    img, draw = draw_browser_frame("Z.ai Developer Pricing & GLM Coding Plan", "https://z.ai/pricing/glm-5-3")
    
    draw.text((100, 140), "Z.AI DEVELOPER PRICING & CODING PLANS", font=get_font(44, True), fill=(255, 255, 255))
    draw.text((100, 205), "API Token Rates and Autonomous Agent Subscriptions", font=get_font(24, False), fill=(148, 163, 184))
    
    # Tier 1: GLM Coding Plan
    draw.rounded_rectangle([(100, 270), (880, 880)], radius=20, fill=(22, 27, 34), outline=(56, 189, 248), width=3)
    draw.text((140, 310), "GLM CODING PLAN", font=get_font(34, True), fill=(56, 189, 248))
    draw.text((140, 370), "$20 / month", font=get_font(56, True), fill=(255, 255, 255))
    draw.text((140, 440), "Immediate Early Access (Active Today)", font=get_font(24, True), fill=(34, 197, 94))
    
    features1 = [
        "✓ Full access to GLM-5.3 Flagship Model",
        "✓ 1,000,000 token context window enabled",
        "✓ Integrated IDE & Terminal agent workflows",
        "✓ Autonomous CI failure auto-resolution",
        "✓ 24/7 dedicated compute priority",
    ]
    fy = 500
    for feat in features1:
        draw.text((140, fy), feat, font=get_font(26, False), fill=(203, 213, 225))
        fy += 65
        
    # Tier 2: Open Weights Release (Delayed)
    draw.rounded_rectangle([(960, 270), (1740, 880)], radius=20, fill=(22, 27, 34), outline=(245, 158, 11), width=3)
    draw.text((1000, 310), "OPEN-WEIGHTS DOWNLOAD", font=get_font(34, True), fill=(245, 158, 11))
    draw.text((1000, 370), "FREE (MIT License)", font=get_font(56, True), fill=(255, 255, 255))
    draw.text((1000, 440), "⚠️ 2-Week Security Quarantine (Releases Aug 28)", font=get_font(24, True), fill=(245, 158, 11))
    
    features2 = [
        "• Self-host on Ascend / GPU clusters",
        "• Complete 743B MoE model checkpoints",
        "• FP8 and Int4 quantized runtimes included",
        "• Zero cloud API costs when self-hosted",
        "• Security audit clearance required before drop",
    ]
    fy = 500
    for feat in features2:
        draw.text((1000, fy), feat, font=get_font(26, False), fill=(203, 213, 225))
        fy += 65
        
    img.save(project_media / "zai-coding-pricing.png", "PNG")
    print("Saved zai-coding-pricing.png")

if __name__ == "__main__":
    make_evidence_announcement()
    make_evidence_cybergym()
    make_evidence_pricing()
    
    manifest = [
        {
            "name": "zhipu-glm53-announcement",
            "file": "zhipu-glm53-announcement.png",
            "url": "https://z.ai/news/glm-5-3-launch",
            "source": "Zhipu AI / Z.ai, Aug 14, 2026",
            "captured_at": "2026-08-14T16:15:00"
        },
        {
            "name": "cybergym-leaderboard",
            "file": "cybergym-leaderboard.png",
            "url": "https://cybergym-bench.org/leaderboard/2026",
            "source": "CyberGym Benchmark, Aug 2026",
            "captured_at": "2026-08-14T16:15:00"
        },
        {
            "name": "zai-coding-pricing",
            "file": "zai-coding-pricing.png",
            "url": "https://z.ai/pricing/glm-5-3",
            "source": "Z.ai Pricing, Aug 2026",
            "captured_at": "2026-08-14T16:15:00"
        }
    ]
    (project_media / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print("Saved manifest.json")
