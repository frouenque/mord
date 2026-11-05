"""Icônes Mord Fluent (Word-like, rouge+M) + ICO Windows multi-tailles valide."""

from __future__ import annotations

import math
import struct
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
ASSETS = Path(
    r"C:\Users\Franck\.cursor\projects\c-Users-Franck-Documents-mord\assets"
)
ICONS = ROOT / "src-tauri" / "icons"
PUBLIC = ROOT / "public"

DOC_TOP = (255, 120, 120, 255)
DOC_BOT = (180, 28, 48, 255)
BADGE = (170, 20, 40, 255)
BADGE_TOP = (200, 45, 55, 255)
WHITE = (255, 255, 255, 255)


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(4))


def make_studio_transparent(im: Image.Image) -> Image.Image:
    """Supprime fond blanc ou noir de studio, garde le rouge."""
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if r > 245 and g > 245 and b > 245:
                px[x, y] = (0, 0, 0, 0)
            elif r < 18 and g < 18 and b < 18:
                px[x, y] = (0, 0, 0, 0)
    return im


def autocrop(im: Image.Image, pad: float = 0.03) -> Image.Image:
    bbox = im.getbbox()
    if not bbox:
        return im
    c = im.crop(bbox)
    side = max(c.size)
    p = max(1, int(side * pad))
    out = Image.new("RGBA", (side + 2 * p, side + 2 * p), (0, 0, 0, 0))
    out.paste(
        c,
        ((out.size[0] - c.size[0]) // 2, (out.size[1] - c.size[1]) // 2),
        c,
    )
    return out


def draw_letter_m(draw: ImageDraw.ImageDraw, box, stroke_ratio=0.15):
    x0, y0, x1, y1 = box
    w, h = x1 - x0, y1 - y0
    stroke = max(2, int(min(w, h) * stroke_ratio))
    pad = 0.20
    left, right = x0 + w * pad, x1 - w * pad
    top, bottom = y0 + h * pad, y1 - h * pad
    mid_x = (left + right) / 2
    mid_y = top + (bottom - top) * 0.55
    for a, b in [
        [(left, bottom), (left, top)],
        [(left, top), (mid_x, mid_y)],
        [(mid_x, mid_y), (right, top)],
        [(right, top), (right, bottom)],
    ]:
        draw.line([a, b], fill=WHITE, width=stroke)
    r = stroke / 2
    for x, y in [(left, bottom), (left, top), (mid_x, mid_y), (right, top), (right, bottom)]:
        draw.ellipse((x - r, y - r, x + r, y + r), fill=WHITE)


def recreate_fluent(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    inset = size * 0.06
    doc = [
        int(inset + size * 0.10),
        int(inset),
        int(size - inset),
        int(size - inset),
    ]
    rad = int(size * 0.18)
    doc_img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    dd = ImageDraw.Draw(doc_img)
    x0, y0, x1, y1 = doc
    for y in range(y0, y1):
        t = (y - y0) / max(y1 - y0, 1)
        wave = 0.08 * math.sin(t * math.pi)
        tt = min(1.0, max(0.0, t + wave))
        dd.line([(x0, y), (x1, y)], fill=lerp(DOC_TOP, DOC_BOT, tt))
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle(doc, radius=rad, fill=255)
    soft = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    soft.paste(doc_img, (0, 0))
    soft.putalpha(mask)
    sh = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle(
        [c + int(size * 0.02) for c in doc], radius=rad, fill=(0, 0, 0, 55)
    )
    sh = sh.filter(ImageFilter.GaussianBlur(radius=max(1, size // 40)))
    img = Image.alpha_composite(img, sh)
    img = Image.alpha_composite(img, soft)

    tile = int(size * 0.48)
    tx, ty = int(size * 0.02), int(size * 0.46)
    badge = Image.new("RGBA", (tile, tile), (0, 0, 0, 0))
    bd = ImageDraw.Draw(badge)
    brad = int(tile * 0.18)
    for y in range(tile):
        bd.line([(0, y), (tile, y)], fill=lerp(BADGE_TOP, BADGE, y / max(tile - 1, 1)))
    bmask = Image.new("L", (tile, tile), 0)
    ImageDraw.Draw(bmask).rounded_rectangle((0, 0, tile - 1, tile - 1), radius=brad, fill=255)
    badge.putalpha(bmask)
    draw_letter_m(ImageDraw.Draw(badge), (0, 0, tile, tile), 0.14)
    bsh = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ImageDraw.Draw(bsh).rounded_rectangle(
        (tx + size * 0.015, ty + size * 0.015, tx + tile + size * 0.015, ty + tile + size * 0.015),
        radius=brad,
        fill=(0, 0, 0, 70),
    )
    bsh = bsh.filter(ImageFilter.GaussianBlur(radius=max(1, size // 50)))
    img = Image.alpha_composite(img, bsh)
    img.paste(badge, (tx, ty), badge)
    return img


def load_ai_master() -> Image.Image | None:
    for name in ("mord-icon-fluent.jpg", "mord-icon-fluent.png"):
        p = ASSETS / name
        if not p.exists():
            continue
        im = make_studio_transparent(Image.open(p))
        im = autocrop(im, pad=0.03)
        return im.resize((1024, 1024), Image.Resampling.LANCZOS)
    return None


def save_ico(path: Path, master: Image.Image) -> None:
    sizes = [16, 24, 32, 48, 64, 128, 256]
    imgs = [
        master.resize((s, s), Image.Resampling.LANCZOS).convert("RGBA") for s in sizes
    ]
    # Pillow : sauver la PLUS GRANDE en premier + append les autres
    imgs[-1].save(
        path,
        format="ICO",
        sizes=[(s, s) for s in sizes],
        append_images=imgs[:-1],
    )
    data = path.read_bytes()
    n = struct.unpack_from("<H", data, 4)[0]
    if n < 3 or path.stat().st_size < 5000:
        raise RuntimeError(f"ICO invalide: entries={n} bytes={path.stat().st_size}")


def main() -> None:
    ICONS.mkdir(parents=True, exist_ok=True)
    PUBLIC.mkdir(parents=True, exist_ok=True)

    ai = load_ai_master()
    master = ai if ai is not None else recreate_fluent(1024)
    print("master:", "AI" if ai else "procedural")

    master.save(ROOT / "word-icon-1024.png")
    master.resize((512, 512), Image.Resampling.LANCZOS).save(ICONS / "icon.png")

    for name, size in {
        "32x32.png": 32,
        "64x64.png": 64,
        "128x128.png": 128,
        "128x128@2x.png": 256,
        "Square30x30Logo.png": 30,
        "Square44x44Logo.png": 44,
        "Square71x71Logo.png": 71,
        "Square89x89Logo.png": 89,
        "Square107x107Logo.png": 107,
        "Square142x142Logo.png": 142,
        "Square150x150Logo.png": 150,
        "Square284x284Logo.png": 284,
        "Square310x310Logo.png": 310,
        "StoreLogo.png": 50,
    }.items():
        master.resize((size, size), Image.Resampling.LANCZOS).save(ICONS / name)
        print("wrote", name)

    save_ico(ICONS / "icon.ico", master)
    print("wrote icon.ico bytes=", (ICONS / "icon.ico").stat().st_size)

    # ICNS via tauri icon (laisser l'utilisateur / CI) — on ne l'écrase pas ici
    master.resize((256, 256), Image.Resampling.LANCZOS).save(PUBLIC / "mord.png")
    print("done")


if __name__ == "__main__":
    main()
