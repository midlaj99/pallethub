import numpy as np
from PIL import Image

def analyze():
    hp = Image.open('refrences/Palette Hubb Fashion Store Homepage.png')
    arr = np.array(hp)
    # Check vertical color profile to identify sections
    # Row mean colors
    row_means = arr.mean(axis=(1, 2))
    print("HP shape:", arr.shape)
    for y in range(0, 1077, 40):
        print(f"y={y}: avg rgb={arr[y].mean(axis=0).astype(int)}")

    hero = Image.open('refrences/original-db63c2b0d1ac5bdae882a2cc4b2643e4.webp')
    arr_h = np.array(hero)
    print("Hero shape:", arr_h.shape)
    for y in range(0, 768, 30):
        print(f"hero y={y}: avg rgb={arr_h[y].mean(axis=0).astype(int)}")

if __name__ == '__main__':
    analyze()
