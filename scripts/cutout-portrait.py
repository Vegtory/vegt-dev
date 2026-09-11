#!/usr/bin/env python3
"""
Cut the white studio backdrop out of the hero portrait.

    python3 scripts/cutout-portrait.py delivered-portrait.jpg src/assets/portrait-bw.png

Run by hand, not part of the build. Needs `pillow`, `numpy` and `scipy`, which
are deliberately not dependencies of this site -- this is a one-off tool for
preparing a replacement portrait, and the file it writes is what ships. The
white-backdrop original it was last run on is not in the tree either: it was
`src/assets/portrait-bw.jpg` until the cut-out replaced it, and it is in git
history from there.

The photo is a figure on a white backdrop, so the matte is not a guess: a pixel
in front of white composites as C = F*a + 255*(1-a), which makes its distance
from white, 255 - C, equal to a * (255 - F). Divide that distance by how dark
the body is just there and the alpha falls out, hair included -- a strand that
half-covers its pixel lands at a = 0.5 instead of being thresholded into or out
of existence. The same equation run backwards then takes the backdrop's white
back out of the edge pixels, which is what keeps the cut-out from carrying a
pale fringe onto a darker page.

Two details are what make it hold together:

  - The backdrop is the white REACHABLE FROM THE FRAME EDGE, found by a
    connected-components pass rather than by thresholding. Whites enclosed by
    the figure -- the eyes, the teeth, the highlight on the shoulder -- are not
    reachable, so they stay opaque instead of punching holes through the face.
  - The divisor is LOCAL. The polo shirt sits at 208-235 against a backdrop at
    254-255, so a global threshold cannot separate them, but the shirt's own
    edge is measured against the shirt and the hair's against the hair.

The source must already have a flat white backdrop. If a replacement photo has
a lighting gradient behind the subject (the original of this one ran 231 at the
top to 251 at the bottom), flat-field it first -- per-row median of the outer
ten columns as that row's background level, scaled to 255 -- or every one of
those levels is read here as thin foreground and the figure keeps a grey box.
"""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

NOISE = 4.0      # JPEG grain; a pixel this close to white is backdrop
CORE = 3         # px inside the silhouette that count as solid body
WIN = 9          # px window the local foreground level is taken from
D_HAIR = 200.0   # 255 - hair luminance, for strands with no body near them
MIN_PEAK = 0.15  # drop specks that never get more opaque than this

src, out = sys.argv[1], sys.argv[2]
rgb = np.asarray(Image.open(src).convert("RGB")).astype(np.float64)

# Distance from white, which is alpha * (255 - foreground).
d = 255.0 - rgb.min(axis=2)
d0 = np.clip(d - NOISE, 0, None)

# The backdrop: white connected to the frame edge. Enclosed whites survive.
lab, _ = ndi.label(d <= NOISE)
edge = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
bg = np.isin(lab, edge[edge > 0])

# How dark is the body near this pixel? Measured on solid interior only, so a
# light shirt is judged against the shirt and dark hair against the hair.
solid = ndi.distance_transform_edt(~bg) >= CORE
body = ndi.maximum_filter(np.where(solid, d, 0.0), size=WIN)
dref = np.maximum(np.where(body > 0, body, D_HAIR), 8.0)

alpha = np.clip(d0 / dref, 0.0, 1.0)
alpha[solid] = 1.0
alpha[bg] = 0.0

# Grain in the backdrop survives as a scatter of near-transparent specks.
lab, n = ndi.label(alpha > 0)
peak = ndi.maximum(alpha, lab, np.arange(1, n + 1))
alpha[np.isin(lab, np.flatnonzero(peak < MIN_PEAK) + 1)] = 0.0

# Un-premultiply: C = F*a + 255*(1-a), solved for F.
a = alpha[..., None]
fg = np.clip(np.where(a > 0.004, (rgb - 255.0 * (1.0 - a)) / np.maximum(a, 0.004), 0.0), 0, 255)

# Greyscale + alpha: the source measures 0.0 chroma spread, so the colour
# channels are three copies of one channel and two of them are dead weight.
grey = fg.mean(axis=2)
Image.fromarray(np.dstack([grey, alpha * 255.0]).astype(np.uint8), "LA").save(out, optimize=True)

print(f"{out}: {(alpha == 1).mean():.1%} opaque, {((alpha > 0) & (alpha < 1)).mean():.1%} partial")
