"""Génère les icônes Mord : recreation vectorielle (petites tailles) + master AI (grandes)."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
ASSETS = Path(
    r"C:\Users\Franck\.cursor\projects\c-Users-Franck-Documents-mord\assets"
)
ICONS = ROOT / "src-tauri" / "icons"
PUBLIC = ROOT / "public"


def remove_dark_bg(im: Image.Image, thresh: int = 28) -> Image.Image:
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if r < thresh and g < thresh and b < thresh:
                px[x, y] = (0, 0, 0, 0)
    return im


def autocrop(im: Image.Image, pad_ratio: float = 0.06) -> Image.Image:
    bbox = im.getbbox()
    if not bbox:
        return im
    cropped = im.crop(bbox)
    side = max(cropped.size)
    pad = int(side * pad_ratio)
    canvas = Image.new("RGBA", (side + 2 * pad, side + 2 * pad), (0, 0, 0, 0))
    ox = (canvas.size[0] - cropped.size[0]) // 2
    oy = (canvas.size[1] - cropped.size[1]) // 2
    canvas.paste(cropped, (ox, oy), cropped)
    return canvas


def recreate_small(size: int) -> Image.Image:
    """Badge plat rouge + M épais — conçu pour rester lisible à 16px."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    m = max(1, size // 16)
    radius = max(2, size * 22 // 100)
    red = (227, 24, 55, 255)
    draw.rounded_rectangle(
        (m, m, size - 1 - m, size - 1 - m), radius=radius, fill=red
    )

    inset = size * 0.22
    left = m + inset
    right = size - m - inset
    top = m + inset * 0.95
    bottom = size - m - inset * 0.95
    mid_x = size / 2
    mid_y = top + (bottom - top) * 0.62
    stroke = max(2, int(size * 0.14))

    lines = [
        [(left, bottom), (left, top)],
        [(left, top), (mid_x, mid_y)],
        [(mid_x, mid_y), (right, top)],
        [(right, top), (right, bottom)],
    ]
    for a, b in lines:
        draw.line([a, b], fill=(255, 255, 255, 255), width=stroke)
    r = stroke / 2
    for x, y in [
        (left, bottom),
        (left, top),
        (mid_x, mid_y),
        (right, top),
        (right, bottom),
    ]:
        draw.ellipse((x - r, y - r, x + r, y + r), fill=(255, 255, 255, 255))
    return img


def recreate_master(size: int) -> Image.Image:
    """Icône type Word : document rouge stratifié + tuile M au premier plan."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))

    margin = int(size * 0.08)
    doc = [
        margin + int(size * 0.12),
        margin,
        size - margin,
        size - margin - int(size * 0.02),
    ]
    x0, y0, x1, y1 = doc
    h = y1 - y0
    bands = [
        (y0, y0 + int(h * 0.34), (255, 90, 90, 255)),
        (y0 + int(h * 0.34), y0 + int(h * 0.62), (210, 35, 55, 255)),
        (y0 + int(h * 0.62), y1, (140, 20, 45, 255)),
    ]
    rad = int(size * 0.16)

    doc_layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    dd = ImageDraw.Draw(doc_layer)
    for by0, by1, col in bands:
        dd.rectangle((x0, by0, x1, by1), fill=col)
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle(doc, radius=rad, fill=255)
    soft = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    soft.paste(doc_layer, (0, 0))
    soft.putalpha(mask)

    shadow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    offset = int(size * 0.02)
    sd.rounded_rectangle(
        [x0 + offset, y0 + offset, x1 + offset, y1 + offset],
        radius=rad,
        fill=(0, 0, 0, 90),
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=max(1, size // 40)))
    img = Image.alpha_composite(img, shadow)
    img = Image.alpha_composite(img, soft)

    tile_size = int(size * 0.52)
    tx = int(size * 0.06)
    ty = size - tile_size - int(size * 0.06)
    tile = recreate_small(tile_size)

    tshadow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    tsd = ImageDraw.Draw(tshadow)
    off = int(size * 0.02)
    tsd.rounded_rectangle(
        (tx + off, ty + off, tx + tile_size + off, ty + tile_size + off),
        radius=int(tile_size * 0.22),
        fill=(0, 0, 0, 100),
    )
    tshadow = tshadow.filter(ImageFilter.GaussianBlur(radius=max(1, size // 50)))
    img = Image.alpha_composite(img, tshadow)
    img.paste(tile, (tx, ty), tile)
    return img


def load_ai_master() -> Image.Image:
    path = ASSETS / "mord-icon-master.jpg"
    im = remove_dark_bg(Image.open(path))
    im = autocrop(im, pad_ratio=0.04)
    return im.resize((1024, 1024), Image.Resampling.LANCZOS)


def make_icon(size: int, ai_master: Image.Image) -> Image.Image:
    # Petites tailles : dessin dédié (pas un downscale)
    if size <= 48:
        return recreate_small(size)
    # Grandes tailles : master AI nettoyé
    if size >= 128:
        return ai_master.resize((size, size), Image.Resampling.LANCZOS)
    # Tailles intermédiaires : recreation vectorielle complète
    return recreate_master(size)


def main() -> None:
    ICONS.mkdir(parents=True, exist_ok=True)
    PUBLIC.mkdir(parents=True, exist_ok=True)

    ai_master = load_ai_master()
    proc_1024 = recreate_master(1024)
    ai_master.save(ROOT / "word-icon-1024.png")
    proc_1024.save(ROOT / "word-icon-procedural-1024.png")
    recreate_small(512).save(ROOT / "word-icon-small-512.png")

    targets = {
        "32x32.png": 32,
        "128x128.png": 128,
        "128x128@2x.png": 256,
        "icon.png": 512,
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
    }

    for name, size in targets.items():
        make_icon(size, ai_master).save(ICONS / name)
        print(f"wrote {name} ({size})")

    ico_sizes = [16, 24, 32, 48, 64, 128, 256]
    ico_images = [make_icon(s, ai_master) for s in ico_sizes]
    # Pillow ICO: save largest with append_images for multi-resolution
    ico_images[-1].save(
        ICONS / "icon.ico",
        format="ICO",
        sizes=[(s, s) for s in ico_sizes],
        append_images=ico_images[:-1],
    )
    print("wrote icon.ico")

    # ICNS via tauri later if needed; keep a high-res PNG source
    make_icon(64, ai_master).save(PUBLIC / "mord.png")
    (PUBLIC / "mord.svg").write_text(
        """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect x="4" y="4" width="56" height="56" rx="12" fill="#E31837"/>
  <path d="M16 48 V16 L32 34 L48 16 V48" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
""",
        encoding="utf-8",
    )
    print("done")


if __name__ == "__main__":
    main()
