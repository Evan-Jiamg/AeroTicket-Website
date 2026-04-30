import os
import sys
import math

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image, ImageDraw, ImageFont

font_dir = "C:\\Windows\\Fonts\\"

def get_intersection(node_type, center, angle):
    cx, cy = center
    if node_type == 'entity':
        w, h = 80, 50
        dx = math.cos(angle)
        dy = math.sin(angle)
        tx = (w/2) / abs(dx) if dx != 0 else float('inf')
        ty = (h/2) / abs(dy) if dy != 0 else float('inf')
        t = min(tx, ty)
        return cx + t*dx, cy + t*dy
    elif node_type == 'process':
        w, h = 110, 70
        dx = math.cos(angle)
        dy = math.sin(angle)
        tx = (w/2) / abs(dx) if dx != 0 else float('inf')
        ty = (h/2) / abs(dy) if dy != 0 else float('inf')
        t = min(tx, ty)
        return cx + t*dx, cy + t*dy
    elif node_type == 'store':
        w, h = 180, 30
        dx = math.cos(angle)
        dy = math.sin(angle)
        tx = (w/2) / abs(dx) if dx != 0 else float('inf')
        ty = (h/2) / abs(dy) if dy != 0 else float('inf')
        t = min(tx, ty)
        return cx + t*dx, cy + t*dy

def draw_arrow(draw, pt1, pt2, type1, type2, color, dashed, double, text, offset, font, text_pos, S=2):
    cx1, cy1 = pt1
    cx2, cy2 = pt2
    angle = math.atan2(cy2 - cy1, cx2 - cx1)
    
    ix1, iy1 = get_intersection(type1, pt1, angle)
    ix2, iy2 = get_intersection(type2, pt2, angle + math.pi)
    
    if offset != 0:
        dx = math.sin(angle) * offset
        dy = -math.cos(angle) * offset
        ix1 += dx
        iy1 += dy
        ix2 += dx
        iy2 += dy

    ix1, iy1 = ix1 * S, iy1 * S
    ix2, iy2 = ix2 * S, iy2 * S

    if dashed:
        dist = math.hypot(ix2 - ix1, iy2 - iy1)
        dash_len = 8 * S
        gap_len = 6 * S
        curr = 0
        while curr < dist:
            end = min(curr + dash_len, dist)
            sx = ix1 + math.cos(angle) * curr
            sy = iy1 + math.sin(angle) * curr
            ex = ix1 + math.cos(angle) * end
            ey = iy1 + math.sin(angle) * end
            draw.line([sx, sy, ex, ey], fill=color, width=2 * S)
            curr += dash_len + gap_len
    else:
        draw.line([ix1, iy1, ix2, iy2], fill=color, width=2 * S)
        
    arrow_l = 12 * S
    arrow_w = 5 * S
    
    p1 = (ix2, iy2)
    p2 = (ix2 - arrow_l * math.cos(angle) + arrow_w * math.sin(angle),
          iy2 - arrow_l * math.sin(angle) - arrow_w * math.cos(angle))
    p3 = (ix2 - arrow_l * math.cos(angle) - arrow_w * math.sin(angle),
          iy2 - arrow_l * math.sin(angle) + arrow_w * math.cos(angle))
    draw.polygon([p1, p2, p3], fill=color)
    
    if double:
        p1 = (ix1, iy1)
        p2 = (ix1 + arrow_l * math.cos(angle) + arrow_w * math.sin(angle),
              iy1 + arrow_l * math.sin(angle) - arrow_w * math.cos(angle))
        p3 = (ix1 + arrow_l * math.cos(angle) - arrow_w * math.sin(angle),
              iy1 + arrow_l * math.sin(angle) + arrow_w * math.cos(angle))
        draw.polygon([p1, p2, p3], fill=color)
        
    if text:
        mx = ix1 + (ix2 - ix1) * text_pos
        my = iy1 + (iy2 - iy1) * text_pos
        
        tx = mx + math.sin(angle) * (14 * S)
        ty = my - math.cos(angle) * (14 * S)
        
        bbox = draw.multiline_textbbox((0,0), text, font=font, align="center")
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        
        bg_pad = 2 * S
        draw.rectangle([tx - tw/2 - bg_pad, ty - th/2 - bg_pad, tx + tw/2 + bg_pad, ty + th/2 + bg_pad], fill="white")
        draw.multiline_text((tx - tw/2, ty - th/2), text, fill="black", font=font, align="center")

def draw_dfd():
    S = 2
    width = 1400 * S
    height = 1000 * S
    img = Image.new("RGB", (width, height), "white")
    draw = ImageDraw.Draw(img)
    
    try:
        f_12 = ImageFont.truetype(font_dir + "msjh.ttc", 12 * S)
        f_14 = ImageFont.truetype(font_dir + "msjh.ttc", 14 * S)
        f_14b = ImageFont.truetype(font_dir + "msjhbd.ttc", 14 * S)
    except Exception:
        f_12 = f_14 = f_14b = ImageFont.load_default()
        
    nodes = {
        "E1": {"type": "entity", "pos": (100, 425), "name": "乘客"},
        "E2": {"type": "entity", "pos": (1330, 350), "name": "管理員"},
        
        "P1": {"type": "process", "pos": (300, 120), "num": "1.0", "name": "乘客資料管理", "bg": "#d9eaf7", "out": "#1a6fbb"},
        "P2": {"type": "process", "pos": (300, 270), "num": "2.0", "name": "旅程資訊管理", "bg": "#d9eaf7", "out": "#1a6fbb"},
        "P3": {"type": "process", "pos": (300, 420), "num": "3.0", "name": "機票管理", "bg": "#d9eaf7", "out": "#1a6fbb"},
        "P4": {"type": "process", "pos": (300, 570), "num": "4.0", "name": "交易管理", "bg": "#d9eaf7", "out": "#1a6fbb"},
        "P5": {"type": "process", "pos": (300, 720), "num": "5.0", "name": "旅程分段管理", "bg": "#d9eaf7", "out": "#1a6fbb"},
        
        "P6": {"type": "process", "pos": (880, 220), "num": "6.0", "name": "航班管理", "bg": "#fce3d2", "out": "#d45c00"},
        "P7": {"type": "process", "pos": (880, 470), "num": "7.0", "name": "航段管理", "bg": "#fce3d2", "out": "#d45c00"},
        "P8": {"type": "process", "pos": (880, 720), "num": "8.0", "name": "基礎資料管理", "bg": "#fce3d2", "out": "#d45c00"},
        
        "D1": {"type": "store", "pos": (590, 120), "id": "D1", "name": "乘客資料"},
        "D2": {"type": "store", "pos": (590, 270), "id": "D2", "name": "旅程資訊"},
        "D3": {"type": "store", "pos": (590, 420), "id": "D3", "name": "機票資料"},
        "D4": {"type": "store", "pos": (590, 570), "id": "D4", "name": "交易記錄"},
        "D5": {"type": "store", "pos": (590, 720), "id": "D5", "name": "旅程分段"},
        
        "D6": {"type": "store", "pos": (750, 850), "id": "D6", "name": "航班資料"},
        
        "D8": {"type": "store", "pos": (1180, 220), "id": "D8", "name": "航空公司"},
        "D7": {"type": "store", "pos": (1180, 520), "id": "D7", "name": "航段資料"},
        "D9": {"type": "store", "pos": (1180, 780), "id": "D9", "name": "機場資料"},
        
        "D10": {"type": "store", "pos": (620, 930), "id": "D10", "name": "航段_航班(M:N)"},
        "D11": {"type": "store", "pos": (980, 930), "id": "D11", "name": "公司_航段(M:N)"},
    }
    
    blue = "#1a6fbb"
    orange = "#d45c00"
    gray = "#888888"
    
    flows = [
        ("E1", "P1", blue, False, False, "乘客資料", 15, 0.3),
        ("P1", "E1", blue, False, False, "乘客資料", 15, 0.7),
        ("P1", "D1", blue, False, True, "新增/讀取/修改\n/刪除乘客資料", 0, 0.5),
        
        ("E1", "P2", blue, False, False, "旅程資訊", 0, 0.4),
        ("P2", "D2", blue, False, True, "新增/讀取/修改\n/刪除旅程資訊", 0, 0.5),
        
        ("E1", "P3", blue, False, False, "機票資料", 0, 0.5),
        ("P3", "D3", blue, False, True, "新增/讀取/修改\n/刪除機票資料", 0, 0.5),
        ("P3", "D2", gray, True, False, "讀取旅程\n資訊(FK)", 15, 0.65),
        ("P3", "D1", gray, True, False, "讀取乘客\n資料(FK)", 0, 0.75),
        
        ("E1", "P4", blue, False, False, "交易資料", 0, 0.4),
        ("P4", "D4", blue, False, True, "新增/讀取/\n修改交易記錄", 0, 0.5),
        ("P4", "D3", gray, True, False, "讀取機票\n資料(FK)", -15, 0.6),
        
        ("E1", "P5", blue, False, False, "旅程分段", 0, 0.3),
        ("P5", "D5", blue, False, True, "新增/讀取/\n刪除旅程分段", 0, 0.5),
        ("P5", "D6", gray, True, False, "讀取航班資料", 0, 0.6),
        
        ("E2", "P6", orange, False, False, "航班資料", 0, 0.2),
        ("P6", "D6", orange, False, True, "新增/修改/\n刪除航班資料", 0, 0.5),
        ("P6", "D8", gray, True, False, "讀取航空\n公司(FK)", -15, 0.5),
        ("P6", "D9", gray, True, False, "讀取機場\n資料(FK)", 0, 0.2),
        ("P6", "D10", orange, False, True, "寫入航段_\n航班關聯", 0, 0.7),
        
        ("E2", "P7", orange, False, False, "航段資料", 0, 0.3),
        ("P7", "D7", orange, False, True, "新增/修改/\n刪除航段資料", 0, 0.5),
        ("P7", "D9", gray, True, False, "讀取機場\n資料(FK)", -15, 0.6),
        ("P7", "D10", orange, False, True, "寫入航段_\n航班關聯", -10, 0.3),
        ("P7", "D11", orange, False, True, "寫入公司_\n航段關聯", 10, 0.4),
        
        ("E2", "P8", orange, False, False, "基礎資料", 0, 0.2),
        ("P8", "D8", orange, False, True, "新增/修改/\n刪除航空公司", 15, 0.25),
        ("P8", "D9", orange, False, True, "新增/修改/\n刪除機場資料", 0, 0.5),
        ("P8", "D11", orange, False, True, "寫入公司_\n航段關聯", 0, 0.7),
    ]
    
    for src, dst, color, dashed, double, text, offset, pos in flows:
        pt1 = nodes[src]["pos"]
        pt2 = nodes[dst]["pos"]
        type1 = nodes[src]["type"]
        type2 = nodes[dst]["type"]
        draw_arrow(draw, pt1, pt2, type1, type2, color, dashed, double, text, offset, f_12, pos, S)
        
    for k, v in nodes.items():
        cx, cy = v["pos"]
        cx *= S
        cy *= S
        if v["type"] == "entity":
            w, h = 80 * S, 50 * S
            draw.rectangle([cx-w/2, cy-h/2, cx+w/2, cy+h/2], fill="#b5cbb7", outline="black", width=2 * S)
            bbox = draw.textbbox((0,0), v["name"], font=f_14b)
            draw.text((cx - (bbox[2]-bbox[0])/2, cy - (bbox[3]-bbox[1])/2 - 3*S), v["name"], fill="black", font=f_14b)
        elif v["type"] == "process":
            w, h = 110 * S, 70 * S
            draw.rounded_rectangle([cx-w/2, cy-h/2, cx+w/2, cy+h/2], radius=15 * S, fill=v["bg"], outline=v["out"], width=2 * S)
            b1 = draw.textbbox((0,0), v["num"], font=f_14b)
            draw.text((cx - (b1[2]-b1[0])/2, cy - 25*S), v["num"], fill="black", font=f_14b)
            b2 = draw.textbbox((0,0), v["name"], font=f_14)
            draw.text((cx - (b2[2]-b2[0])/2, cy + 5*S), v["name"], fill="black", font=f_14)
        elif v["type"] == "store":
            w, h = 180 * S, 30 * S
            x1, y1 = cx - w/2, cy - h/2
            x2, y2 = cx + w/2, cy + h/2
            draw.line([x1, y1, x2, y1], fill="black", width=2 * S)
            draw.line([x1, y2, x2, y2], fill="black", width=2 * S)
            draw.line([x1, y1, x1, y2], fill="black", width=2 * S)
            draw.line([x1+40*S, y1, x1+40*S, y2], fill="black", width=2 * S)
            
            b1 = draw.textbbox((0,0), v["id"], font=f_14b)
            draw.text((x1 + 20*S - (b1[2]-b1[0])/2, cy - 8*S), v["id"], fill="black", font=f_14b)
            draw.text((x1 + 50*S, cy - 8*S), v["name"], fill="black", font=f_14)

    draw.text((nodes["D10"]["pos"][0]*S - 40*S, nodes["D10"]["pos"][1]*S + 20*S), "多對多關聯表", fill="gray", font=f_12)
    draw.text((nodes["D11"]["pos"][0]*S - 40*S, nodes["D11"]["pos"][1]*S + 20*S), "多對多關聯表", fill="gray", font=f_12)
    
    lx, ly = 1200 * S, 800 * S
    draw.rectangle([lx, ly, lx+180*S, ly+160*S], outline="black", width=1*S, fill="white")
    draw.text((lx+10*S, ly+10*S), "【 圖 例 】", fill="black", font=f_14b)
    
    draw.rectangle([lx+10*S, ly+40*S, lx+40*S, ly+60*S], fill="#b5cbb7", outline="black", width=1*S)
    draw.text((lx+50*S, ly+42*S), "外部實體", fill="black", font=f_12)
    
    draw.rounded_rectangle([lx+10*S, ly+70*S, lx+40*S, ly+90*S], radius=8*S, fill="#d9eaf7", outline="#1a6fbb", width=1*S)
    draw.text((lx+50*S, ly+72*S), "處理 (Process)", fill="black", font=f_12)
    
    draw.line([lx+10*S, ly+105*S, lx+40*S, ly+105*S], fill="black", width=1*S)
    draw.line([lx+10*S, ly+115*S, lx+40*S, ly+115*S], fill="black", width=1*S)
    draw.line([lx+10*S, ly+105*S, lx+10*S, ly+115*S], fill="black", width=1*S)
    draw.text((lx+50*S, ly+102*S), "資料儲存", fill="black", font=f_12)
    
    draw.line([lx+10*S, ly+135*S, lx+40*S, ly+135*S], fill="black", width=1*S)
    draw.polygon([(lx+40*S, ly+135*S), (lx+35*S, ly+132*S), (lx+35*S, ly+138*S)], fill="black")
    draw.text((lx+50*S, ly+127*S), "資料流", fill="black", font=f_12)
    
    final_img = img.resize((1400, 1000), Image.Resampling.LANCZOS)
    
    out_dir = "c:\\Users\\yhfydt\\Desktop\\系統分析"
    os.makedirs(out_dir, exist_ok=True)
    final_img.save(os.path.join(out_dir, "Aviation_Ticketing_DFD.png"), "PNG")

if __name__ == "__main__":
    draw_dfd()
    print("Done")
