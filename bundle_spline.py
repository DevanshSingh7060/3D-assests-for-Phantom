import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

with open('style.css', 'r', encoding='utf-8') as f:
    css = f.read()

with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# For Spline overlay transparency in hero
spline_css = """
html { background: transparent !important; }
body { background: transparent !important; }
.section-hero { pointer-events: none; }
.hero-editorial-col { pointer-events: auto; }
.snapshot-header-tag, .focal-glasses-card, .spatial-timeline-bar { pointer-events: auto; }
""" + css

# Replace <link rel="stylesheet" href="style.css"> with <style>...</style>
inlined = html.replace('<link rel="stylesheet" href="style.css">', f'<style>\n{spline_css}\n</style>')
# Replace <script src="app.js"></script> with <script>...</script>
inlined = inlined.replace('<script src="app.js"></script>', f'<script>\n{js}\n</script>')

with open('inlined.html', 'w', encoding='utf-8') as f:
    f.write(inlined)

print(f"Inlined HTML generated. Length: {len(inlined)} characters.")
