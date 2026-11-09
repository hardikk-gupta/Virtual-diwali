"""Rebuild resources/images/rooftop-sky.webp from the original rooftop photograph.

The photo is extended upward by 1024px using its own sky: each column continues
the colour of the photo's top rows, eases toward a deep zenith navy, and carries
the same fine grain as the photographed sky, so no seam or CSS gradient is visible
when the camera tilts up.  Requires Pillow and NumPy:  python3 scripts/extend-sky.py
"""
from PIL import Image, ImageFilter
import numpy as np

SRC = 'resources/source/terrace-original.png'
OUT = 'resources/images/rooftop-sky.webp'
EXT = 1024                      # rows of sky added above the photo
ZENITH = np.array([9, 16, 40.])  # #091028, also the page background colour

photo = np.asarray(Image.open(SRC).convert('RGB')).astype(float)
height, width, _ = photo.shape
top_rows = photo[0:24].mean(axis=0)
sky_columns = top_rows[:, 2] > top_rows[:, 0] * 2.2          # blue-dominant = open sky
first_sky = int(np.argmax(sky_columns))
profile = top_rows.copy()
profile[~sky_columns] = top_rows[first_sky + 8]
kernel = np.ones(61) / 61
profile = np.stack([np.convolve(np.pad(profile[:, c], 30, mode='edge'), kernel, mode='valid') for c in range(3)], 1)

extension = np.zeros((EXT, width, 3))
for row in range(EXT):
    d = (EXT - row) / EXT
    t = d * d * (3 - 2 * d)
    extension[row] = profile * (1 - t) + ZENITH * t

rng = np.random.default_rng(7)
grain = rng.normal(0, 1, (EXT, width, 3)) * np.array([1.7, 1.6, 3.0])
grain_img = Image.fromarray(np.clip(grain * 20 + 128, 0, 255).astype('uint8')).filter(ImageFilter.GaussianBlur(.6))
grain = (np.asarray(grain_img).astype(float) - 128) / 20
extension += grain

full = np.concatenate([extension, photo], 0)
BLEND = 36
for j in range(BLEND):
    a = j / BLEND
    y = EXT + j
    mixed = full[y] * a + (profile + grain[EXT - 1 - j]) * (1 - a)
    full[y, sky_columns] = mixed[sky_columns]

Image.fromarray(np.clip(full, 0, 255).astype('uint8')).save(OUT, quality=84, method=6)
print('wrote', OUT, full.shape[1], 'x', full.shape[0])
