"""Regenerate exact-typography social previews; requires Pillow."""
from pathlib import Path
import json,html
from PIL import Image, ImageDraw, ImageFont
root=Path(__file__).resolve().parents[1]
pages=json.loads((root/'src/data/sitePages.json').read_text())
font_path='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
out=root/'public/social';out.mkdir(parents=True,exist_ok=True)
for page in pages:
    e=html.escape
    size=88 if page['slug']=='portfolio' else 98
    while max(ImageFont.truetype(font_path,size).getlength(line) for line in page['lines'])>1040:size-=1
    step=int(size*1.18)
    first=255 if len(page['lines'])==3 else 270
    lines=''.join(f'<text x="70" y="{first+i*step}" font-family="DejaVu Sans" font-size="{size}" font-weight="700">{e(line)}</text>' for i,line in enumerate(page['lines']))
    note='Product design · Visual systems · Creative technology' if page['slug']=='portfolio' else ('Prototype UI / source-grounded presentation' if page['slug']=='clip-studio' else 'Product case study / interface design & visual storytelling')
    svg=f'''<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="{page['background']}"/><rect x="0" y="618" width="1200" height="12" fill="{page['accent']}"/><g fill="{page['ink']}"><text x="70" y="70" font-family="DejaVu Sans" font-size="19" font-weight="700">VISWANATHAN G.</text><text x="1130" y="70" text-anchor="end" font-family="DejaVu Sans" font-size="14">PRODUCT &amp; VISUAL DESIGN</text><path d="M70 104H1130" stroke="{page['ink']}" stroke-opacity=".3"/><text x="70" y="155" font-family="DejaVu Sans Mono" font-size="15">{e(page['tag'])}</text>{lines}<text x="70" y="546" font-family="DejaVu Sans" font-size="18">{e(note)}</text><text x="70" y="587" font-family="DejaVu Sans Mono" font-size="12">VISWANATHAN-PORTFOLIO-IOTA.VERCEL.APP</text><text x="1130" y="570" text-anchor="end" font-family="DejaVu Sans" font-size="54" fill="{page['accent']}">↗</text></g></svg>'''
    (out/f"{page['slug']}.svg").write_text(svg)
    image=Image.new('RGB',(1200,630),page['background']);draw=ImageDraw.Draw(image)
    bold=lambda n:ImageFont.truetype(font_path,n)
    regular=lambda n:ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',n)
    mono=lambda n:ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf',n)
    ink=page['ink']
    draw.rectangle((0,618,1200,630),fill=page['accent'])
    draw.text((70,70),'VISWANATHAN G.',font=bold(19),fill=ink,anchor='ls')
    draw.text((1130,70),'PRODUCT & VISUAL DESIGN',font=regular(14),fill=ink,anchor='rs')
    draw.line((70,104,1130,104),fill=page['accent'])
    draw.text((70,155),page['tag'],font=mono(15),fill=ink,anchor='ls')
    for i,line in enumerate(page['lines']):draw.text((70,first+i*step),line,font=bold(size),fill=ink,anchor='ls')
    draw.text((70,546),note,font=regular(18),fill=ink,anchor='ls')
    draw.text((70,587),'VISWANATHAN-PORTFOLIO-IOTA.VERCEL.APP',font=mono(12),fill=ink,anchor='ls')
    draw.text((1130,570),'↗',font=regular(54),fill=page['accent'],anchor='rs')
    image.save(out/f"{page['slug']}.png",optimize=True)
print(f'Generated {len(pages)} sharing previews at 1200 × 630.')
