# ONI THEORY — Print-Ready Design Files

All files in `print-ready/` are vector SVG — infinite resolution, no quality loss at any size.

## Files

| File | Concept | Best Placement | Colours |
|------|---------|---------------|---------|
| `oni-demon-mask.svg` | Traditional oni mask with neon cyber eyes | Front chest (12×14") | Red · Cyan · White |
| `cyber-samurai.svg` | Kabuto helmet + katana + circuit armour | Full front or back (14×17") | Cyan · Red · White |
| `dragon-spirit.svg` | Coiling neon dragon with flame | Full back (14×18") | Red · Purple · White |
| `gaming-gods.svg` | Torii gate + controller with kanji buttons | Front chest (12×12") | Red · Cyan · Purple |
| `yokai-ghost.svg` | Yūrei ghost floating in neon moonlight | Front chest or back (12×15") | Purple · Cyan · White |
| `kami-kanji.svg` | Bold 神 kanji with circuit hex frame | Centre chest (8×8") or sleeve | Red · Cyan · White |
| `shuriken-strike.svg` | 8-point shuriken with motion blur | Centre chest (10×10") | Red · White (2-colour) |
| `oni-wordmark.svg` | Full brand lockup: 鬼 + ONI THEORY | Chest band, sleeve, waistband, tote | Red · Cyan · White |

## How to upload for printing

### DTG (Direct-to-Garment) — Printful, Printify, SPOD
1. Export SVG to PNG at **4500 × 4500 px** (or native size), **300 DPI**
2. Background must be **transparent** (all files already have no background)
3. Upload PNG to your DTG service's product builder
4. Set placement and scale per table above

### Screen Print
- Separate each colour layer for film output
- Red: `fill: #FF3346` elements
- Cyan: `fill: #00F5FF` elements  
- White: `fill: #FFFFFF` elements (also stroke-white lines)
- Purple: `fill: #BF5FFF` elements (dragon-spirit, yokai-ghost, gaming-gods only)
- All files are already separated by CSS class — easy to isolate per colour pass

### Embroidery
- `oni-demon-mask.svg` and `kami-kanji.svg` work best for embroidery digitising
- Simplify stroke widths — anything < 4px at actual size may need to be removed
- Recommended: convert to flat fills, no gradients, before sending to digitiser

## SVG to PNG conversion (command line)

```bash
# Using Inkscape (recommended)
inkscape oni-demon-mask.svg --export-type=png --export-dpi=300 --export-filename=oni-demon-mask.png

# Using ImageMagick
convert -background none oni-demon-mask.svg -resize 4500x4500 oni-demon-mask.png
```

## Colour reference

| Token | Hex | RGB | Use |
|-------|-----|-----|-----|
| Oni Red | `#FF3346` | 255, 51, 70 | Primary accent, oni elements |
| Cyber Cyan | `#00F5FF` | 0, 245, 255 | Circuit lines, tech elements |
| Oni Purple | `#BF5FFF` | 191, 95, 255 | Spirit / yokai elements |
| White | `#FFFFFF` | 255, 255, 255 | Main body fills, text |
| Near-black | `#0D0D0D` | 13, 13, 13 | Shadow fills (transparent on DTG) |
