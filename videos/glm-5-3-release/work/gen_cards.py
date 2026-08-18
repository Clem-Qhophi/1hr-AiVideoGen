import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

project_dir = Path(__file__).resolve().parent.parent
cards_dir = project_dir / "work" / "cards"
cards_dir.mkdir(parents=True, exist_ok=True)

W, H = 1920, 1080

def get_font(size, bold=True):
    for f in ["arialbd.ttf", "segoeuib.ttf", "DejaVuSans-Bold.ttf", "Helvetica-Bold.ttf", "arial.ttf"]:
        try:
            return ImageFont.truetype(f, size)
        except:
            pass
    return ImageFont.load_default()

def create_base_canvas():
    img = Image.new("RGB", (W, H), (13, 17, 23)) # #0d1117 dark canvas
    draw = ImageDraw.Draw(img)
    # Subtle radial/gradient mesh
    for y in range(H):
        r = int(13 + (y / H) * 8)
        g = int(17 + (y / H) * 16)
        b = int(23 + (y / H) * 32)
        draw.line([(0, y), (W, y)], fill=(r, g, b))
    
    # Outer frame
    draw.rounded_rectangle([(80, 80), (W - 80, H - 80)], radius=24, outline=(48, 54, 61), width=3)
    return img, draw

# Card 1: CyberGym Leaderboard
def make_card_cybergym():
    img, draw = create_base_canvas()
    
    # Category badge
    draw.rounded_rectangle([(140, 130), (520, 190)], radius=12, fill=(239, 68, 68)) # Red badge
    draw.text((165, 142), "CYBERSECURITY #1", font=get_font(34, True), fill=(255, 255, 255))
    
    # Main Header
    draw.text((140, 220), "CyberGym: Vulnerability Discovery", font=get_font(64, True), fill=(255, 255, 255))
    draw.text((140, 300), "Zero-day vulnerability discovery rate on real codebases", font=get_font(32, False), fill=(139, 148, 158))
    
    # Bars
    models = [
        ("GLM-5.3 (Zhipu AI)", 84.5, (56, 189, 248), True),
        ("Anthropic Mythos 5", 83.8, (139, 148, 158), False),
        ("OpenAI GPT-5.6 Sol", 83.6, (139, 148, 158), False),
        ("GLM-5.2 (Previous)", 58.2, (75, 85, 99), False),
    ]
    
    start_y = 390
    for name, score, color, highlight in models:
        # Label
        draw.text((140, start_y), name, font=get_font(34, highlight), fill=(255, 255, 255) if highlight else (201, 209, 217))
        
        # Bar track
        bar_x = 640
        bar_w = int((score / 100.0) * 960)
        draw.rounded_rectangle([(bar_x, start_y), (bar_x + 960, start_y + 54)], radius=10, fill=(22, 27, 34))
        draw.rounded_rectangle([(bar_x, start_y), (bar_x + bar_w, start_y + 54)], radius=10, fill=color)
        
        # Score
        score_text = f"{score}%"
        draw.text((bar_x + bar_w + 30, start_y + 4), score_text, font=get_font(38, True), fill=color if highlight else (255, 255, 255))
        
        start_y += 110
        
    # Footnote
    draw.text((140, 940), "Source: Zhipu AI Official Model Card (Aug 14, 2026)", font=get_font(26, False), fill=(110, 118, 129))
    img.save(cards_dir / "card_cybergym.png", "PNG")
    print("Saved card_cybergym.png")

# Card 2: DeepSWE Coding Benchmark Leap
def make_card_deepswe():
    img, draw = create_base_canvas()
    
    # Category badge
    draw.rounded_rectangle([(140, 130), (480, 190)], radius=12, fill=(34, 197, 94)) # Green badge
    draw.text((165, 142), "CODING LEAP", font=get_font(34, True), fill=(13, 17, 23))
    
    # Header
    draw.text((140, 220), "DeepSWE v1.1 Coding Benchmark", font=get_font(64, True), fill=(255, 255, 255))
    draw.text((140, 300), "Repository-scale autonomous bug resolving", font=get_font(32, False), fill=(139, 148, 158))
    
    # Big stat box 1: GLM-5.3
    draw.rounded_rectangle([(140, 390), (900, 840)], radius=20, fill=(22, 27, 34), outline=(34, 197, 94), width=4)
    draw.text((180, 430), "GLM-5.3", font=get_font(42, True), fill=(34, 197, 94))
    draw.text((180, 520), "66.9%", font=get_font(130, True), fill=(255, 255, 255))
    draw.text((180, 710), "Full Repo Problem Resolution", font=get_font(32, False), fill=(201, 209, 217))
    draw.text((180, 760), "+20.7% generation leap", font=get_font(28, True), fill=(34, 197, 94))
    
    # Big stat box 2: GLM-5.2
    draw.rounded_rectangle([(960, 390), (1720, 840)], radius=20, fill=(22, 27, 34), outline=(48, 54, 61), width=2)
    draw.text((1000, 430), "GLM-5.2 (June 2026)", font=get_font(42, True), fill=(139, 148, 158))
    draw.text((1000, 520), "46.2%", font=get_font(130, True), fill=(139, 148, 158))
    draw.text((1000, 710), "Baseline Resolution Rate", font=get_font(32, False), fill=(110, 118, 129))
    draw.text((1000, 760), "Previous standard", font=get_font(28, False), fill=(110, 118, 129))
    
    draw.text((140, 940), "Source: DeepSWE Benchmark Suite v1.1 Evaluation", font=get_font(26, False), fill=(110, 118, 129))
    img.save(cards_dir / "card_deepswe.png", "PNG")
    print("Saved card_deepswe.png")

# Card 3: Terminal-Bench & CLI Execution
def make_card_terminal():
    img, draw = create_base_canvas()
    
    # Category badge
    draw.rounded_rectangle([(140, 130), (520, 190)], radius=12, fill=(168, 85, 247)) # Purple badge
    draw.text((165, 142), "CLI & AGENTS", font=get_font(34, True), fill=(255, 255, 255))
    
    # Header
    draw.text((140, 220), "Terminal-Bench 3.0 & CLI Agents", font=get_font(64, True), fill=(255, 255, 255))
    draw.text((140, 300), "Autonomous multi-step terminal command execution", font=get_font(32, False), fill=(139, 148, 158))
    
    # Terminal-Bench Box
    draw.rounded_rectangle([(140, 390), (900, 840)], radius=20, fill=(22, 27, 34), outline=(168, 85, 247), width=4)
    draw.text((180, 430), "Terminal-Bench 3.0", font=get_font(38, True), fill=(168, 85, 247))
    draw.text((180, 500), "28.3", font=get_font(120, True), fill=(255, 255, 255))
    draw.text((180, 680), "Previous GLM-5.2: 4.6", font=get_font(32, False), fill=(139, 148, 158))
    draw.text((180, 740), "🔥 Over 6x Improvement", font=get_font(34, True), fill=(250, 204, 21))
    
    # Agents' Last Exam Box
    draw.rounded_rectangle([(960, 390), (1720, 840)], radius=20, fill=(22, 27, 34), outline=(56, 189, 248), width=3)
    draw.text((1000, 430), "Agents' Last Exam (CLI)", font=get_font(38, True), fill=(56, 189, 248))
    draw.text((1000, 500), "28.5", font=get_font(120, True), fill=(255, 255, 255))
    draw.text((1000, 680), "Previous GLM-5.2: 23.8", font=get_font(32, False), fill=(139, 148, 158))
    draw.text((1000, 740), "Top-tier agent reasoning", font=get_font(34, True), fill=(56, 189, 248))
    
    draw.text((140, 940), "Source: Terminal-Bench 3.0 & Agents' Last Exam Leaderboard", font=get_font(26, False), fill=(110, 118, 129))
    img.save(cards_dir / "card_terminal.png", "PNG")
    print("Saved card_terminal.png")

# Card 4: Specs & Architecture
def make_card_specs():
    img, draw = create_base_canvas()
    
    # Category badge
    draw.rounded_rectangle([(140, 130), (500, 190)], radius=12, fill=(56, 189, 248)) # Blue badge
    draw.text((165, 142), "SPECS & HARDWARE", font=get_font(34, True), fill=(13, 17, 23))
    
    # Header
    draw.text((140, 220), "GLM-5.3 Technical Specifications", font=get_font(64, True), fill=(255, 255, 255))
    draw.text((140, 300), "Trained entirely on Huawei Ascend NPU infrastructure", font=get_font(32, False), fill=(139, 148, 158))
    
    specs = [
        ("Base Parameters", "743 Billion", "MoE Architecture", (56, 189, 248)),
        ("Context Window", "1,000,000", "Tokens working memory", (34, 197, 94)),
        ("Output Limit", "128,000", "Tokens per generation", (250, 204, 21)),
        ("Hardware Stack", "Huawei Ascend", "Domestic NPU Cluster", (239, 68, 68)),
    ]
    
    positions = [
        (140, 390, 890, 600),
        (950, 390, 1700, 600),
        (140, 640, 890, 850),
        (950, 640, 1700, 850),
    ]
    
    for (title, value, sub, color), (x1, y1, x2, y2) in zip(specs, positions):
        draw.rounded_rectangle([(x1, y1), (x2, y2)], radius=16, fill=(22, 27, 34), outline=(48, 54, 61), width=2)
        draw.text((x1 + 30, y1 + 25), title, font=get_font(28, False), fill=(139, 148, 158))
        draw.text((x1 + 30, y1 + 75), value, font=get_font(60, True), fill=color)
        draw.text((x1 + 30, y1 + 155), sub, font=get_font(24, False), fill=(201, 209, 217))
        
    draw.text((140, 940), "Source: Zhipu AI Architecture Whitepaper (Aug 2026)", font=get_font(26, False), fill=(110, 118, 129))
    img.save(cards_dir / "card_specs.png", "PNG")
    print("Saved card_specs.png")

# Card 5: Real-World Vulnerability Findings
def make_card_cve():
    img, draw = create_base_canvas()
    
    # Category badge
    draw.rounded_rectangle([(140, 130), (480, 190)], radius=12, fill=(239, 68, 68)) # Red badge
    draw.text((165, 142), "LIVE TESTING", font=get_font(34, True), fill=(255, 255, 255))
    
    # Header
    draw.text((140, 220), "Real-World Vulnerability Discovery", font=get_font(64, True), fill=(255, 255, 255))
    draw.text((140, 300), "Evaluated across open-source production repositories", font=get_font(32, False), fill=(139, 148, 158))
    
    # Stat 1
    draw.rounded_rectangle([(140, 390), (900, 840)], radius=20, fill=(22, 27, 34), outline=(239, 68, 68), width=4)
    draw.text((180, 430), "Vulnerabilities Discovered", font=get_font(38, True), fill=(239, 68, 68))
    draw.text((180, 520), "2,436", font=get_font(130, True), fill=(255, 255, 255))
    draw.text((180, 710), "Verified Security Bugs", font=get_font(32, False), fill=(201, 209, 217))
    draw.text((180, 760), "Zero-day & high-severity issues", font=get_font(28, True), fill=(239, 68, 68))
    
    # Stat 2
    draw.rounded_rectangle([(960, 390), (1720, 840)], radius=20, fill=(22, 27, 34), outline=(56, 189, 248), width=3)
    draw.text((1000, 430), "Open-Source Projects Audited", font=get_font(38, True), fill=(56, 189, 248))
    draw.text((1000, 520), "269", font=get_font(130, True), fill=(255, 255, 255))
    draw.text((1000, 710), "Production Repositories Tested", font=get_font(32, False), fill=(201, 209, 217))
    draw.text((1000, 760), "Multi-language codebase coverage", font=get_font(28, True), fill=(56, 189, 248))
    
    draw.text((140, 940), "Source: Z.ai Red Team & Open Security Initiative", font=get_font(26, False), fill=(110, 118, 129))
    img.save(cards_dir / "card_cve.png", "PNG")
    print("Saved card_cve.png")

# Card 6: The Honest Gap & 2-Week Catch
def make_card_catch():
    img, draw = create_base_canvas()
    
    # Category badge
    draw.rounded_rectangle([(140, 130), (520, 190)], radius=12, fill=(245, 158, 11)) # Amber badge
    draw.text((165, 142), "THE HONEST CATCH", font=get_font(34, True), fill=(13, 17, 23))
    
    # Header
    draw.text((140, 220), "Two Crucial Limits to Know", font=get_font(64, True), fill=(255, 255, 255))
    draw.text((140, 300), "What Zhipu didn't highlight in the headline announcement", font=get_font(32, False), fill=(139, 148, 158))
    
    # Catch 1: 2-Week Open Weight Delay
    draw.rounded_rectangle([(140, 390), (900, 840)], radius=20, fill=(22, 27, 34), outline=(245, 158, 11), width=4)
    draw.text((180, 430), "Open Weights Delayed", font=get_font(38, True), fill=(245, 158, 11))
    draw.text((180, 520), "2 WEEKS", font=get_font(100, True), fill=(255, 255, 255))
    draw.text((180, 680), "Security quarantine period", font=get_font(30, False), fill=(201, 209, 217))
    draw.text((180, 740), "⚠️ Currently API & Paid Plan Only", font=get_font(30, True), fill=(245, 158, 11))
    
    # Catch 2: Exploit Synthesis Gap
    draw.rounded_rectangle([(960, 390), (1720, 840)], radius=20, fill=(22, 27, 34), outline=(239, 68, 68), width=3)
    draw.text((1000, 430), "ExploitBench (Active Weapons)", font=get_font(38, True), fill=(239, 68, 68))
    draw.text((1000, 520), "54.4%", font=get_font(100, True), fill=(239, 68, 68))
    draw.text((1000, 680), "Mythos 5 & GPT-5.6 at ~78%", font=get_font(30, False), fill=(201, 209, 217))
    draw.text((1000, 740), "🛡️ Strong Defense, Weak Offense", font=get_font(30, True), fill=(56, 189, 248))
    
    draw.text((140, 940), "Source: Independent ExploitBench & Safety Evaluation", font=get_font(26, False), fill=(110, 118, 129))
    img.save(cards_dir / "card_catch.png", "PNG")
    print("Saved card_catch.png")

if __name__ == "__main__":
    make_card_cybergym()
    make_card_deepswe()
    make_card_terminal()
    make_card_specs()
    make_card_cve()
    make_card_catch()
    print("All 6 cards generated successfully.")
