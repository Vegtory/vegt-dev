#!/usr/bin/env python3
"""Draw the site's favicon: the wordmark's `v` and its cobalt full stop.

Run by hand, not by the build. The generated files are committed:

    public/favicon.svg        what browsers actually use
    public/favicon-mono.svg   the Safari pinned-tab mask (one flat silhouette)
    public/favicon.png        32x32 fallback for anything without SVG support
    public/apple-favicon.png  180x180, full bleed, for the iOS home screen

    python3 scripts/make-favicon.py            # SVGs only
    python3 scripts/make-favicon.py --png      # SVGs + PNGs (needs a renderer)

THE MARK. The site's logo is `vegt.dev` with one coloured full stop (see the
header comment in `src/components/Header.astro`). At 16 px the wordmark is
unreadable, so the icon keeps the two pieces that carry it: the `v` and the
dot. The dot is the bare `cobalt` mark rather than `cobalt-ink` — here it is a
dot, not a letter of the wordmark, and `bg-cobalt` is exactly the member the
palette reserves for rules, dots and fills.

THE TILE. The ink sits on the site's own `background` silver rather than on
transparency. A near-black `v` on a transparent ground disappears into a dark
browser tab strip, and a favicon has no `prefers-color-scheme` to fall back on
in every client that renders it. The silver tile also reads as the stock the
rest of the site is printed on, which is the point of the palette.

THE PROPORTIONS are not the font's — they were drawn against a 16 px
rasterisation, which is the size that decides everything. A `v` built at the
wordmark's weight closes its counter at that size and turns into a filled
wedge; this one is wider and a little lighter so the notch survives. Change
X0/X1/TOP/TIP/W and look at 16 px before trusting how it looks at 256.
"""

import argparse
import pathlib
import shutil
import subprocess
import tempfile

# --- tokens, from tailwind.config.cjs -------------------------------------
GROUND = "#eef1f5"  # background
INK = "#131720"     # primaryText
DOT = "#2563eb"     # cobalt (the mark, not cobalt-ink)

# --- geometry, on a 32-unit grid ------------------------------------------
X0, X1 = 3.0, 20.6   # outer span of the v
TOP, TIP = 8.6, 24.2  # cap line and the point of the apex
W = 3.8              # width of a stem measured horizontally, not perpendicular
GAP = 1.8            # v to dot
R = 3.1              # dot radius
RADIUS = 3           # tile corners: near-square, like everything else here

ROOT = pathlib.Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"


def n(value: float) -> str:
    return f"{round(value, 2):g}"


def v_path() -> str:
    """The v as one filled polygon.

    Drawn rather than stroked: a stroke cuts its terminals perpendicular to the
    stem, and the wordmark's mono `v` cuts them flat along the cap line. The
    inner vertex is where the two inner edges meet — above the apex, which is
    what leaves the solid point underneath it.
    """
    cx = (X0 + X1) / 2
    slope = (cx - X0) / (TIP - TOP)          # run per unit of rise
    inner_y = TOP + (cx - (X0 + W)) / slope
    return (
        f"M{n(X0)} {n(TOP)}H{n(X0 + W)}L{n(cx)} {n(inner_y)}"
        f"L{n(X1 - W)} {n(TOP)}H{n(X1)}L{n(cx)} {n(TIP)}Z"
    )


def svg(*, ground: str | None, ink: str, dot: str, radius: int) -> str:
    cx = X1 + GAP + R
    tile = (
        f'<rect width="32" height="32" rx="{radius}" fill="{ground}"/>' if ground else ""
    )
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">'
        f"{tile}"
        f'<path d="{v_path()}" fill="{ink}"/>'
        f'<circle cx="{n(cx)}" cy="{n(TIP - R)}" r="{n(R)}" fill="{dot}"/>'
        "</svg>\n"
    )


def rasterise(svg_text: str, size: int, out: pathlib.Path) -> None:
    """SVG to PNG, with whatever is on the machine.

    Prefers rsvg-convert; falls back to headless Chromium, which is what these
    files were generated with. Chromium screenshots the viewport rather than
    the element, so the page is sized generously and the corner cropped back
    out — a window smaller than its minimum is silently widened.
    """
    if shutil.which("rsvg-convert"):
        subprocess.run(
            ["rsvg-convert", "-w", str(size), "-h", str(size), "-o", str(out)],
            input=svg_text.encode(), check=True,
        )
        return

    chromium = shutil.which("chromium") or "/opt/pw-browsers/chromium"
    if not pathlib.Path(chromium).exists():
        raise SystemExit("no rsvg-convert and no chromium: cannot write the PNGs")

    from PIL import Image  # only needed on this path

    with tempfile.TemporaryDirectory() as tmp:
        page = pathlib.Path(tmp, "icon.html")
        page.write_text(
            "<!doctype html><style>html,body{margin:0;padding:0}"
            f"svg{{display:block;width:{size}px;height:{size}px}}</style>{svg_text}"
        )
        shot = pathlib.Path(tmp, "shot.png")
        subprocess.run(
            [chromium, "--headless", "--disable-gpu", "--no-sandbox",
             "--hide-scrollbars", "--force-device-scale-factor=1",
             "--window-size=900,900", "--default-background-color=00000000",
             f"--screenshot={shot}", page.resolve().as_uri()],
            check=True, capture_output=True,
        )
        Image.open(shot).convert("RGBA").crop((0, 0, size, size)).save(out)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--png", action="store_true", help="also write the PNGs")
    args = parser.parse_args()

    colour = svg(ground=GROUND, ink=INK, dot=DOT, radius=RADIUS)
    # The mask is a silhouette: Safari fills every shape in it with the colour
    # from the <link>, so the tile has to go or the whole square fills in.
    mono = svg(ground=None, ink="#000000", dot="#000000", radius=0)

    (PUBLIC / "favicon.svg").write_text(colour)
    (PUBLIC / "favicon-mono.svg").write_text(mono)
    print("wrote public/favicon.svg, public/favicon-mono.svg")

    if args.png:
        rasterise(colour, 32, PUBLIC / "favicon.png")
        # Full bleed: iOS rounds and masks the home-screen icon itself, and a
        # tile with its own corners inside that mask shows two of them.
        rasterise(svg(ground=GROUND, ink=INK, dot=DOT, radius=0), 180,
                  PUBLIC / "apple-favicon.png")
        print("wrote public/favicon.png, public/apple-favicon.png")


if __name__ == "__main__":
    main()
