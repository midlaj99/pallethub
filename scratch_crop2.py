from PIL import Image

hp = Image.open('refrences/Palette Hubb Fashion Store Homepage.png')

# Precise category crops (just the clean image inside each card):
# In Homepage reference, category cards are at y around 35 to 152
# Let's check each category card exactly:
cats_precise = [
    ("costume", (56, 36, 196, 153)),
    ("accessories", (214, 36, 354, 153)),
    ("caps", (372, 36, 512, 153)),
    ("hoodies", (530, 36, 670, 153)),
    ("watches", (688, 36, 828, 153)),
    ("chains", (846, 36, 986, 153)),
]

for name, box in cats_precise:
    cropped = hp.crop(box)
    cropped.save(f"public/images/categories/{name}.png")

# Precise product image crops:
# The product cards are at y=328 to y=485, but the image inside the card starts at y=328 + 2 to avoid text.
# Let's inspect the rounded image itself: roughly y=328 to 486. But wait! At y=327 the title "Top Picks" was slightly above it.
# The card image actually starts around y=330!
# Let's check the height: from y=330 to y=486 is 156px.
# Let's crop without the heart or we can crop the full clean image.
prods_precise = [
    ("oversized-tshirt", (56, 330, 221, 486)),
    ("formal-blazer", (242, 330, 407, 486)),
    ("trendy-cap", (429, 330, 594, 486)),
    ("mens-watch", (616, 330, 781, 486)),
    ("chain-necklace", (803, 330, 968, 486)),
]

for name, box in prods_precise:
    cropped = hp.crop(box)
    cropped.save(f"public/images/products/{name}.png")

# Logo in footer:
# Footer is y=990 to 1060. Let's find exact logo box:
logo_box = (56, 915, 175, 960) # Wait, let's locate the logo in footer:
# Footer background starts at y=980
# Logo icon is a white square bag with a hanger/tag inside and text PALETTE HUBB to its right
logo_crop = hp.crop((56, 915, 175, 960)) # Let's find where PALETTE HUBB is in footer
