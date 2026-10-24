from PIL import Image

hp = Image.open('refrences/Palette Hubb Fashion Store Homepage.png')
# Let's inspect category cards horizontal positions around y=30 to 180
# There are 6 cards across 1024 px width
# Total width: 1024. Let's see the cards:
# y roughly 35 to 155
# Let's crop individual categories:
cats = [
    ("costume", (56, 35, 196, 155)),
    ("accessories", (214, 35, 354, 155)),
    ("caps", (372, 35, 512, 155)),
    ("hoodies", (530, 35, 670, 155)),
    ("watches", (688, 35, 828, 155)),
    ("chains", (846, 35, 986, 155)),
]

for name, box in cats:
    cropped = hp.crop(box)
    cropped.save(f"public/images/categories/{name}.png")
    print(f"Saved category {name}: {cropped.size}")

# Featured products: 5 cards across 1024 width
# Let's crop the 5 product images (from roughly y=325 to y=485)
prods = [
    ("oversized-tshirt", (56, 327, 221, 486)),
    ("formal-blazer", (242, 327, 407, 486)),
    ("trendy-cap", (429, 327, 594, 486)),
    ("mens-watch", (616, 327, 781, 486)),
    ("chain-necklace", (803, 327, 968, 486)),
]

for name, box in prods:
    cropped = hp.crop(box)
    cropped.save(f"public/images/products/{name}.png")
    print(f"Saved product {name}: {cropped.size}")

# Promo banner:
# Let's inspect promo banner model around y=620 to 768, x=56 to 350
promo_model = hp.crop((56, 622, 353, 768))
promo_model.save("public/images/promo/upgrade-style-model.png")
print("Saved promo model:", promo_model.size)

# Promo full banner
promo_banner = hp.crop((56, 622, 968, 768))
promo_banner.save("public/images/promo/upgrade-style-banner.png")
print("Saved promo banner:", promo_banner.size)

# Footer Logo:
# Logo in footer around y=990 to 1060, x=56 to 220
logo_crop = hp.crop((56, 995, 190, 1055))
logo_crop.save("public/images/logo.png")
print("Saved logo:", logo_crop.size)

# Hero image from original-db63c2b0d1ac5bdae882a2cc4b2643e4.webp
hero = Image.open('refrences/original-db63c2b0d1ac5bdae882a2cc4b2643e4.webp')
# Crop hero card
hero_card = hero.crop((128, 235, 896, 620))
hero_card.save("public/images/hero/hero-card.png")
print("Saved hero card:", hero_card.size)

# Also crop just the models on the right of the hero
hero_models = hero.crop((540, 235, 896, 620))
hero_models.save("public/images/hero/hero-models.png")
print("Saved hero models:", hero_models.size)

# Also crop hero models clean
hero_models_full = hero.crop((480, 235, 896, 620))
hero_models_full.save("public/images/hero/hero-models-wide.png")
print("Saved hero models wide:", hero_models_full.size)
