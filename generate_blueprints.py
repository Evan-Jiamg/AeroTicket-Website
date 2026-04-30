import os
import sys

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image, ImageDraw, ImageFont

font_dir = "C:\\Windows\\Fonts\\"
try:
    f_12 = ImageFont.truetype(font_dir + "msjh.ttc", 12)
    f_13 = ImageFont.truetype(font_dir + "msjh.ttc", 13)
    f_14 = ImageFont.truetype(font_dir + "msjh.ttc", 14)
    f_14b = ImageFont.truetype(font_dir + "msjhbd.ttc", 14)
    f_22b = ImageFont.truetype(font_dir + "msjhbd.ttc", 22)
    f_24b = ImageFont.truetype(font_dir + "msjhbd.ttc", 24)
    f_26b = ImageFont.truetype(font_dir + "msjhbd.ttc", 26)
    try:
        f_icon = ImageFont.truetype("C:\\Windows\\Fonts\\seguiemj.ttf", 52)
    except:
        f_icon = ImageFont.truetype(font_dir + "msjh.ttc", 52)
except Exception:
    f_12 = f_13 = f_14 = f_14b = f_22b = f_24b = f_26b = f_icon = ImageFont.load_default()

def draw_right_text(draw, x_right, y, text, font, fill):
    bbox = draw.textbbox((0,0), text, font=font)
    w = bbox[2] - bbox[0]
    draw.text((x_right - w, y), text, fill=fill, font=font)

def create_form(filename, header_h, header_func, field_rows, field_extra_func, footer_func):
    width = 940
    field_pad_y = 20
    field_pad_x = 30
    
    img_d = Image.new("RGB", (width, 10))
    d_draw = ImageDraw.Draw(img_d)
    
    field_rows_tot = len(field_rows)
    field_rows_h = field_rows_tot*30 + max(0, field_rows_tot-1)*18
    extra_h = field_extra_func(d_draw, 0, 0, True) if field_extra_func else 0
    
    if field_rows_tot > 0 and extra_h > 0:
        field_tot_h = field_pad_y + field_rows_h + 18 + extra_h + field_pad_y
    elif extra_h > 0:
        field_tot_h = field_pad_y + extra_h + field_pad_y
    elif field_rows_tot > 0:
        field_tot_h = field_pad_y + field_rows_h + field_pad_y
    else:
        field_tot_h = field_pad_y*2
        
    footer_h = footer_func(d_draw, width, 0, True)
    
    height = header_h + field_tot_h + footer_h
    
    img = Image.new("RGB", (width, height), "white")
    draw = ImageDraw.Draw(img)
    
    draw.rectangle([0, header_h, width, header_h + field_tot_h], fill="#EEF4FA")
    draw.rectangle([0, header_h + field_tot_h, width, height], fill="white")
    
    header_func(draw, width, header_h)
    
    draw.line([0, header_h, width, header_h], fill="#555555", width=2)
    draw.line([0, header_h + field_tot_h, width, header_h + field_tot_h], fill="#555555", width=2)
    
    y = header_h + field_pad_y
    for row in field_rows:
        x = field_pad_x
        for item in row:
            if len(item) == 2:
                lbl = item[0]
                bbox = draw.textbbox((0,0), lbl, font=f_14)
                draw.text((x, y + 6), lbl, fill="black", font=f_14)
                x += (bbox[2]-bbox[0]) + 20
            else:
                lbl, letter, bw = item
                label_txt = lbl + "：" if lbl != "" else "" 
                if label_txt:
                    bbox = draw.textbbox((0,0), label_txt, font=f_14)
                    lw = bbox[2]-bbox[0]
                    draw.text((x, y + 6), label_txt, fill="black", font=f_14)
                    bx = x + lw
                else:
                    bx = x
                    
                draw.rectangle([bx, y, bx+bw, y+30], fill="white", outline="#6A9CC0", width=1)
                
                if letter:
                    l_bbox = draw.textbbox((0,0), letter, font=f_14b)
                    llw = l_bbox[2]-l_bbox[0]
                    draw.text((bx + (bw-llw)/2, y + 6), letter, fill="#1a4f8a", font=f_14b)
                x = bx + bw + 20
        y += 30 + 18
    
    if field_extra_func:
        field_extra_func(draw, field_pad_x, y, False)
        
    footer_func(draw, width, header_h + field_tot_h)
    
    draw.rectangle([0, 0, width-1, height-1], outline="black", width=2)
    
    img.save(filename, "PNG")

# === Form 1 ===
def h1(d, w, h):
    d.rectangle([0, 0, w, h], fill="#1a4f8a")
    d.text((16, 16), "台灣航空股份有限公司", fill="white", font=f_13)
    d.text((16, 40), "機　票　單", fill="white", font=f_26b)
    
    lx = w - 16 - 80
    ly = 12
    d.rectangle([lx, ly, lx+80, ly+70], fill="white", outline="#1a4f8a", width=1)
    bbox = d.textbbox((0,0), "LOGO", font=f_14)
    d.text((lx + (80-(bbox[2]-bbox[0]))/2, ly + (70-(bbox[3]-bbox[1]))/2), "LOGO", fill="gray", font=f_14)
    
    tx_r = w - 110
    draw_right_text(d, tx_r, 14, "表單編號：＿＿＿＿＿＿＿＿", f_12, "white")
    draw_right_text(d, tx_r, 34, "開票日期：＿＿年＿＿月＿＿日", f_12, "white")

def e1(d, x, y, dummy):
    if not dummy:
        d.text((x, y), "票種：□ 單程　□ 來回　□ 多程", fill="black", font=f_14)
        d.text((x, y+24), "退改票規定：□ 可退票　□ 可改期　□ 不可退改", fill="black", font=f_14)
    return 24 + 14

def f1(d, w, fy, dummy=False):
    if not dummy:
        y = fy + 18
        d.text((18, y), "旅客簽名：＿＿＿＿＿＿＿＿＿＿", fill="black", font=f_14)
        bbox = d.textbbox((0,0), "開票人員：＿＿＿＿＿＿＿＿", font=f_14)
        d.text(((w-(bbox[2]-bbox[0]))/2, y), "開票人員：＿＿＿＿＿＿＿＿", fill="black", font=f_14)
        draw_right_text(d, w-18, y, "主管核准：＿＿＿＿＿＿＿＿", f_14, "black")
        d.text((18, y+30), "備註：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿", fill="black", font=f_14)
    return 18 + 30 + 14 + 18

r1 = [
    [("機票編號", "A", 75), ("艙等", "B", 85), ("機票總量", "C", 75), ("機票總價", "D", 95)],
    [("旅程識別碼", "E", 75), ("乘客編號", "F", 75), ("起飛機場編號", "G", 75), ("降落機場編號", "H", 75)]
]

# === Form 2 ===
def h2(d, w, h):
    d.rectangle([0, 0, w, h], fill="white")
    d.line([0, 1, w, 1], fill="#1a4f8a", width=4)
    d.line([0, h-1, w, h-1], fill="#1a4f8a", width=1)
    
    d.text((16, 16), "台灣航空股份有限公司", fill="black", font=f_13)
    tt = "乘　客　資　料"
    tb = d.textbbox((0,0), tt, font=f_26b)
    d.text(((w-(tb[2]-tb[0]))/2, (h-(tb[3]-tb[1]))/2), tt, fill="#1a4f8a", font=f_26b)
    
    draw_right_text(d, w-16, 16, "表單編號：＿＿＿＿＿＿＿＿", f_12, "black")
    draw_right_text(d, w-16, 36, "建檔日期：＿＿年＿＿月＿＿日", f_12, "black")

def e2(d, x, y, dummy):
    if not dummy:
        d.text((x, y), "證件類型：□ 護照　□ 身分證　□ 居留證", fill="black", font=f_14)
        y += 26
        d.text((x, y+6), "聯絡電話：", fill="black", font=f_14)
        bx1 = x + d.textbbox((0,0), "聯絡電話：", font=f_14)[2]
        d.rectangle([bx1, y, bx1+170, y+30], fill="white", outline="#6A9CC0", width=1)
        
        x2 = bx1 + 170 + 20
        d.text((x2, y+6), "電子郵件：", fill="black", font=f_14)
        bx2 = x2 + d.textbbox((0,0), "電子郵件：", font=f_14)[2]
        d.rectangle([bx2, y, bx2+200, y+30], fill="white", outline="#6A9CC0", width=1)
    return 26 + 30

def f2(d, w, fy, dummy=False):
    if not dummy:
        y = fy + 18
        d.text((18, y), "資料建立來源：□ 乘客自行登錄　□ 系統匯入　□ 人工建檔", fill="black", font=f_14)
        d.text((18, y+24), "資料確認人員：＿＿＿＿＿＿＿＿＿＿", fill="black", font=f_14)
        d.text((18, y+48), "備註：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿", fill="black", font=f_14)
    return 18 + 48 + 14 + 18

r2 = [
    [("乘客編號", "A", 75), ("姓氏", "B", 170), ("名字", "C", 170)],
    [("性別", "D", 60), ("出生日期", "E", 120), ("國籍", "F", 170)]
]

# === Form 3 ===
def h3(d, w, h):
    d.rectangle([0, 0, w, h], fill="white")
    d.rectangle([0, 0, 210, h], fill="#1a4f8a")
    tt = "旅　程　資　訊"
    tb = d.textbbox((0,0), tt, font=f_22b)
    d.text(((210-(tb[2]-tb[0]))/2, (h-(tb[3]-tb[1]))/2), tt, fill="white", font=f_22b)
    
    d.text((210+16, 16), "台灣航空股份有限公司", fill="black", font=f_13)
    draw_right_text(d, w-16, 16, "表單編號：＿＿＿＿＿＿＿＿", f_12, "black")
    draw_right_text(d, w-16, 36, "建檔日期：＿＿年＿＿月＿＿日", f_12, "black")

def e3(d, x, y, dummy):
    if not dummy:
        d.text((x, y+6), "旅遊人數：", fill="black", font=f_14)
        bx1 = x + d.textbbox((0,0), "旅遊人數：", font=f_14)[2]
        d.rectangle([bx1, y, bx1+75, y+30], fill="white", outline="#6A9CC0", width=1)
        
        x2 = bx1 + 75 + 20
        d.text((x2, y+6), "艙等需求：□ 經濟　□ 商務　□ 頭等", fill="black", font=f_14)
    return 30

def f3(d, w, fy, dummy=False):
    if not dummy:
        y = fy + 18
        d.text((18, y), "旅程狀態：□ 規劃中　□ 已確認　□ 已出發　□ 已完成", fill="black", font=f_14)
        d.text((18, y+24), "經辦人員：＿＿＿＿＿＿＿＿＿＿", fill="black", font=f_14)
        d.text((18, y+48), "備註：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿", fill="black", font=f_14)
    return 18 + 48 + 14 + 18

r3 = [
    [("旅程識別碼", "A", 75), ("出發日期", "B", 120), ("地點安排", "C", 170)],
    [("出發地", "D", 170), ("目的地", "E", 170)]
]

# === Form 4 ===
def h4(d, w, h):
    for i in range(w):
        ratio = i / w
        r = int(26 + (46 - 26) * ratio)
        g = int(79 + (109 - 79) * ratio)
        b = int(138 + (164 - 138) * ratio)
        d.line([i, 0, i, h], fill=(r,g,b), width=1)
    d.text((16, 16), "台灣航空股份有限公司", fill="white", font=f_13)
    d.text((16, 40), "交　易　記　錄", fill="white", font=f_26b)
    draw_right_text(d, w-16, 14, "表單編號：＿＿＿＿＿＿＿＿", f_12, "white")
    draw_right_text(d, w-16, 34, "交易日期：＿＿年＿＿月＿＿日", f_12, "white")

def e4(d, x, y, dummy):
    if not dummy:
        d.text((x, y), "交易狀態：□ 成功　□ 待確認　□ 失敗　□ 已退款", fill="black", font=f_14)
    return 14

def f4(d, w, fy, dummy=False):
    if not dummy:
        y = fy + 18
        d.text((18, y), "持卡人簽名：＿＿＿＿＿＿＿＿＿＿", fill="black", font=f_14)
        bbox = d.textbbox((0,0), "收款人員：＿＿＿＿＿＿＿＿", font=f_14)
        d.text(((w-(bbox[2]-bbox[0]))/2, y), "收款人員：＿＿＿＿＿＿＿＿", fill="black", font=f_14)
        draw_right_text(d, w-18, y, "主管核准：＿＿＿＿＿＿＿＿", f_14, "black")
        d.text((18, y+30), "備註：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿", fill="black", font=f_14)
    return 18 + 30 + 14 + 18

r4 = [
    [("交易編號", "A", 75), ("付款方式", "B", 85), ("交易時間", "C", 120), ("機票編號", "J", 75)],
    [("銀行代號", "D", 75), ("銀行名稱", "E", 170), ("信用卡種類", "F", 85)],
    [("信用卡持卡人姓名", "G", 170), ("信用卡號", "H", 170), ("到期日", "I", 120)]
]

# === Form 5 ===
def h5(d, w, h):
    d.rectangle([0, 0, w, h], fill="white")
    d.text((16, 16), "台灣航空股份有限公司", fill="black", font=f_13)
    tt = "航　班　資　料"
    d.text((16, 40), tt, fill="#1a4f8a", font=f_26b)
    d.line([16, 75, 216, 75], fill="#1a4f8a", width=2)
    draw_right_text(d, w-16, 16, "表單編號：＿＿＿＿＿＿＿＿", f_12, "black")
    draw_right_text(d, w-16, 36, "建檔日期：＿＿年＿＿月＿＿日", f_12, "black")

def e5(d, x, y, dummy):
    if not dummy:
        d.text((x, y), "航班狀態：□ 正常　□ 延誤　□ 取消　□ 候補", fill="black", font=f_14)
        d.text((x, y+24), "機型：□ 窄體客機　□ 廣體客機　□ 區域客機", fill="black", font=f_14)
    return 24 + 14

def f5(d, w, fy, dummy=False):
    if not dummy:
        y = fy + 18
        d.text((18, y), "建檔人員：＿＿＿＿＿＿＿＿＿＿", fill="black", font=f_14)
        d.text((18, y+24), "備註：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿", fill="black", font=f_14)
    return 18 + 24 + 14 + 18

r5 = [
    [("航班編號", "A", 75), ("航空公司代號", "B", 60), ("起飛機場編號", "C", 75), ("降落機場編號", "D", 75)],
    [("起飛時間", "E", 120), ("降落時間", "F", 120), ("飛行時數", "G", 75)]
]

# === Form 6 ===
def h6(d, w, h):
    d.rectangle([0, 0, w, h], fill="#2c3e6b")
    d.text((16, 16), "台灣航空股份有限公司", fill="white", font=f_13)
    d.text((16, 40), "航　段　資　料", fill="white", font=f_26b)
    draw_right_text(d, w-16, 16, "表單編號：＿＿＿＿＿＿＿＿", f_12, "white")
    draw_right_text(d, w-16, 36, "建檔日期：＿＿年＿＿月＿＿日", f_12, "white")

def e6(d, x, y, dummy):
    if not dummy:
        d.text((x, y), "航段距離（公里）：＿＿＿＿＿＿", fill="black", font=f_14)
        d.text((x, y+24), "飛行時間（小時）：＿＿＿＿＿＿", fill="black", font=f_14)
        d.text((x, y+48), "航段類型：□ 國內線　□ 國際線", fill="black", font=f_14)
    return 48 + 14

def f6(d, w, fy, dummy=False):
    if not dummy:
        y = fy + 18
        d.text((18, y), "航段狀態：□ 啟用中　□ 已停用", fill="black", font=f_14)
        d.text((18, y+24), "建檔人員：＿＿＿＿＿＿＿＿＿＿", fill="black", font=f_14)
        d.text((18, y+48), "備註：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿", fill="black", font=f_14)
    return 18 + 48 + 14 + 18

r6 = [
    [("起飛機場編號", "A", 75), ("降落機場編號", "B", 75)]
]

# === Form 7 ===
def h7(d, w, h):
    d.rectangle([0, 0, w, h], fill="white")
    d.rectangle([0, 0, 4, h], fill="#1a4f8a")
    d.text((16, 16), "台灣航空股份有限公司", fill="black", font=f_13)
    d.text((16, 40), "旅　程　分　段", fill="#1a4f8a", font=f_24b)
    draw_right_text(d, w-16, 16, "表單編號：＿＿＿＿＿＿＿＿", f_12, "black")
    draw_right_text(d, w-16, 36, "建檔日期：＿＿年＿＿月＿＿日", f_12, "black")

def e7(d, x, y, dummy):
    if not dummy:
        d.text((x, y), "乘客人數：＿＿＿＿人", fill="black", font=f_14)
        d.text((x, y+24), "座位艙等：□ 經濟艙　□ 商務艙　□ 頭等艙", fill="black", font=f_14)
        d.text((x, y+48), "分段順序：第＿＿段，共＿＿段", fill="black", font=f_14)
    return 48 + 14

def f7(d, w, fy, dummy=False):
    if not dummy:
        y = fy + 18
        d.text((18, y), "分段狀態：□ 待出發　□ 已出發　□ 已抵達　□ 已取消", fill="black", font=f_14)
        d.text((18, y+24), "備註：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿", fill="black", font=f_14)
    return 18 + 24 + 14 + 18

r7 = [
    [("旅程分段編號", "A", 75), ("航班編號", "B", 75)]
]

# === Form 8 ===
def h8(d, w, h):
    d.rectangle([0, 0, w, h], fill="white")
    d.line([0, 1, w, 1], fill="black", width=1)
    d.line([0, h-2, w, h-2], fill="black", width=3)
    d.text((16, 16), "台灣航空股份有限公司", fill="black", font=f_13)
    tt = "航　空　公　司"
    tb = d.textbbox((0,0), tt, font=f_26b)
    d.text(((w-(tb[2]-tb[0]))/2, (h-(tb[3]-tb[1]))/2), tt, fill="#1a4f8a", font=f_26b)
    draw_right_text(d, w-16, 16, "表單編號：＿＿＿＿＿＿＿＿", f_12, "black")
    draw_right_text(d, w-16, 36, "建檔日期：＿＿年＿＿月＿＿日", f_12, "black")

def e8(d, x, y, dummy):
    if not dummy:
        d.text((x, y), "國籍：□ 本國籍　□ 外國籍", fill="black", font=f_14)
        d.text((x, y+24), "航線類型：□ 國內線　□ 國際線　□ 兩者皆有", fill="black", font=f_14)
        d.text((x, y+48), "客服電話：＿＿＿＿＿＿＿＿＿＿＿＿", fill="black", font=f_14)
    return 48 + 14

def f8(d, w, fy, dummy=False):
    if not dummy:
        y = fy + 18
        d.text((18, y), "公司狀態：□ 合作中　□ 暫停合作　□ 已終止", fill="black", font=f_14)
        d.text((18, y+30), "登錄人員：＿＿＿＿＿＿＿＿＿＿", fill="black", font=f_14)
        draw_right_text(d, w-18, y+30, "主管核准：＿＿＿＿＿＿＿＿", f_14, "black")
        d.text((18, y+60), "備註：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿", fill="black", font=f_14)
    return 18 + 60 + 14 + 18

r8 = [
    [("公司代碼", "A", 60), ("公司名稱", "B", 170)]
]

# === Form 9 ===
def h9(d, w, h):
    d.rectangle([0, 0, w, h], fill="#1a4f8a")
    if getattr(f_icon, "getname", lambda: None)() != ("", ""): 
        d.text((w-20-52, 16), "✈", fill="white", font=f_icon)
    d.text((16, 16), "台灣航空股份有限公司", fill="white", font=f_13)
    d.text((16, 40), "機　場　資　料", fill="white", font=f_26b)
    draw_right_text(d, w-80, 16, "表單編號：＿＿＿＿＿＿＿＿", f_12, "white")
    draw_right_text(d, w-80, 36, "建檔日期：＿＿年＿＿月＿＿日", f_12, "white")

def e9(d, x, y, dummy):
    if not dummy:
        d.text((x, y), "所在城市：＿＿＿＿＿＿＿＿", fill="black", font=f_14)
        bbox = d.textbbox((0,0), "所在城市：＿＿＿＿＿＿＿＿", font=f_14)
        d.text((x + (bbox[2]-bbox[0]) + 30, y), "所在國家：＿＿＿＿＿＿＿＿", fill="black", font=f_14)
        d.text((x, y+24), "機場類型：□ 國際機場　□ 國內機場　□ 軍民共用", fill="black", font=f_14)
        d.text((x, y+48), "IATA代碼：＿＿＿＿＿＿", fill="black", font=f_14)
    return 48 + 14

def f9(d, w, fy, dummy=False):
    if not dummy:
        y = fy + 18
        d.text((18, y), "機場狀態：□ 啟用中　□ 維修中　□ 已停用", fill="black", font=f_14)
        d.text((18, y+24), "建檔人員：＿＿＿＿＿＿＿＿＿＿", fill="black", font=f_14)
        d.text((18, y+48), "備註：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿", fill="black", font=f_14)
    return 18 + 48 + 14 + 18

r9 = [
    [("機場編號", "A", 75), ("機場名稱", "B", 170)]
]

# === Form 10 ===
def h10(d, w, h):
    d.rectangle([0, 0, w, h], fill="#2c3e6b")
    d.text((16, 16), "台灣航空股份有限公司", fill="white", font=f_13)
    d.text((16, 40), "航段＿航班對應表", fill="white", font=f_26b)
    
    draw_right_text(d, w-16, 16, "表單編號：＿＿＿＿＿＿＿＿", f_12, "white")
    draw_right_text(d, w-16, 36, "建檔日期：＿＿年＿＿月＿＿日", f_12, "white")
    draw_right_text(d, w-16, h-24, "多對多關聯表（M:N）", f_14, "white")

def e10(d, x, y, dummy):
    if not dummy:
        d.text((x, y), "※ A+B 為複合外鍵，對應【航段資料】之複合主鍵", fill="black", font=f_14)
        d.text((x, y+24), "※ C 為外鍵，對應【航班資料】之航班編號", fill="black", font=f_14)
        d.text((x, y+48), "※ A+B+C 共同構成此表之複合主鍵", fill="black", font=f_14)
    return 48 + 14

def f10(d, w, fy, dummy=False):
    if not dummy:
        y = fy + 18
        d.text((18, y), "建檔人員：＿＿＿＿＿＿＿＿＿＿", fill="black", font=f_14)
        d.text((18, y+24), "備註：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿", fill="black", font=f_14)
    return 18 + 24 + 14 + 18

r10 = [
    [("起飛機場編號", "A", 75), ("降落機場編號", "B", 75), ("航班編號", "C", 75)]
]

# === Form 11 ===
def h11(d, w, h):
    d.rectangle([0, 0, w, h], fill="#2c3e6b")
    d.text((16, 16), "台灣航空股份有限公司", fill="white", font=f_13)
    d.text((16, 40), "公司＿航段對應表", fill="white", font=f_26b)
    
    draw_right_text(d, w-16, 16, "表單編號：＿＿＿＿＿＿＿＿", f_12, "white")
    draw_right_text(d, w-16, 36, "建檔日期：＿＿年＿＿月＿＿日", f_12, "white")
    draw_right_text(d, w-16, h-24, "多對多關聯表（M:N）", f_14, "white")

def e11(d, x, y, dummy):
    if not dummy:
        d.text((x, y), "※ A 為外鍵，對應【航空公司】之公司代碼", fill="black", font=f_14)
        d.text((x, y+24), "※ B+C 為複合外鍵，對應【航段資料】之複合主鍵", fill="black", font=f_14)
        d.text((x, y+48), "※ A+B+C 共同構成此表之複合主鍵", fill="black", font=f_14)
    return 48 + 14

def f11(d, w, fy, dummy=False):
    if not dummy:
        y = fy + 18
        d.text((18, y), "建檔人員：＿＿＿＿＿＿＿＿＿＿", fill="black", font=f_14)
        d.text((18, y+24), "備註：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿", fill="black", font=f_14)
    return 18 + 24 + 14 + 18

r11 = [
    [("公司代碼", "A", 60), ("起飛機場編號", "B", 75), ("降落機場編號", "C", 75)]
]


if __name__ == "__main__":
    out_dir = "c:\\Users\\yhfydt\\Desktop\\系統分析"
    os.makedirs(out_dir, exist_ok=True)
    
    configs = [
        ("1_Ticket.png", 100, h1, r1, e1, f1),
        ("2_Passenger.png", 90, h2, r2, e2, f2),
        ("3_Info.png", 90, h3, r3, e3, f3),
        ("4_Transaction.png", 100, h4, r4, e4, f4),
        ("5_Itinerary.png", 90, h5, r5, e5, f5),
        ("6_FlightSegment.png", 90, h6, r6, e6, f6),
        ("7_TripLeg.png", 90, h7, r7, e7, f7),
        ("8_Company.png", 90, h8, r8, e8, f8),
        ("9_Airport.png", 100, h9, r9, e9, f9),
        ("10_FlightSegment_Itinerary.png", 90, h10, r10, e10, f10),
        ("11_Company_FlightSegment.png", 90, h11, r11, e11, f11)
    ]
    
    for filename, hh, hf, r, ef, ff in configs:
        create_form(os.path.join(out_dir, filename), hh, hf, r, ef, ff)
        print(f"Generated {filename}")
    print("Done")
