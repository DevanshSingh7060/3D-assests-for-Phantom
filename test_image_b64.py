import base64, os

brain = "/Users/devanshsingh/.gemini/antigravity-ide/brain/8404bdc8-4523-40df-b065-77aecc86f707/figma_3d_assets"
for f in os.listdir(brain):
    if f.endswith(('.jpg', '.png')):
        path = os.path.join(brain, f)
        size = os.path.getsize(path)
        print(f"{f}: {size} bytes")
