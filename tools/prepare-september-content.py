"""Build the September editorial data from the reviewed source transcriptions.

Run after placing original Drive image bytes in .tmp-september-assets/<drive-id>.
Images are copied unchanged; no runtime Drive dependency is introduced.
"""
from pathlib import Path
import re
import json
import html
import shutil
import unicodedata
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'src/app/features/commercial-pages'
ASSETS = ROOT / 'src/assets/img/septiembre-2026'
OUT.mkdir(parents=True, exist_ok=True)
ASSETS.mkdir(parents=True, exist_ok=True)
LINKS = {
    '/pc-gamer-gama-alta': '/pc-gamer-gama-alta-cdmx',
    '/pc-gamer-gama-media': '/cotiza-tu-pc',
    '/computadora-para-diseno-grafico': '/cotiza-tu-pc',
    '/ensambles/hyperion': '/contacto',
    '/ensambles/workstation': '/contacto',
}

def destination(url):
    path = url.replace('https://pcgamercdmx.com', '').rstrip('/') or '/'
    return LINKS.get(path, path)

def inline(text):
    value = html.escape(text)
    return re.sub(r'\[([^]]+)\]\(([^)]+)\)', lambda m: '<a href="' + destination(m[2]) + '">' + m[1] + '</a>', value)

def action(text):
    return [{'label': label if '/ensambles/hyperion' not in url and '/ensambles/workstation' not in url else 'Consultar este ensamble', 'href': destination(url)} for label, url in re.findall(r'\[([^]]+)\]\(([^)]+)\)', text)]

manifest = []
manifest_path = ROOT / 'docs/content/septiembre-2026/images.json'
previous_images = {item['driveId']: item for item in json.loads(manifest_path.read_text(encoding='utf-8'))} if manifest_path.exists() else {}
def media(lines, topic, number):
    raw = next(line for line in lines if re.match(r'URL[:;]', line))
    drive_id = re.search(r'/file/d/([^/]+)', raw)[1]
    title = next(line.split(':', 1)[1].strip() for line in lines if line.startswith('Título:'))
    alt = next(line.split(':', 1)[1].strip() for line in lines if line.startswith('Alt Text:'))
    original = ROOT / '.tmp-september-assets' / drive_id
    if not original.exists() and drive_id in previous_images:
        original = ROOT / 'src' / previous_images[drive_id]['src'].lstrip('/')
    with Image.open(original) as image:
        width, height = image.size
        ext = {'JPEG': 'jpg', 'PNG': 'png', 'WEBP': 'webp'}[image.format]
    slug = re.sub(r'[^a-z0-9]+', '-', unicodedata.normalize('NFKD', title).encode('ascii', 'ignore').decode().lower()).strip('-')[:100].rstrip('-')
    filename = f'{topic}-{number:02}-{slug}.{ext}'
    if original.resolve() != (ASSETS / filename).resolve():
        shutil.copyfile(original, ASSETS / filename)
    result = {'src': '/assets/img/septiembre-2026/' + filename, 'title': title, 'alt': alt, 'width': width, 'height': height}
    manifest.append({'driveId': drive_id, **result})
    return result

pages = {}
for topic in ['edicion', 'workstation', 'streaming', 'componentes']:
    lines = [line.strip() for line in (ROOT / f'docs/content/septiembre-2026/{topic}-fuente.md').read_text(encoding='utf-8').splitlines() if line.strip()]
    lines = lines[3:]
    assert lines[0].startswith('# ')
    page = {'heading': lines.pop(0)[2:], 'intro': [], 'heroActions': [], 'cards': [], 'sections': [], 'faqs': []}
    start = next(i for i, line in enumerate(lines) if line.startswith('## Conoce'))
    for line in lines[:start]:
        if line.startswith('## '): page['heroActions'] += action(line)
        else: page['intro'].append(inline(line))
    page['catalogHeading'] = lines[start][3:]
    end = next(i for i in range(start + 1, len(lines)) if lines[i].startswith('## '))
    catalog = lines[start + 1:end]
    if topic == 'componentes':
        starts = [i for i, line in enumerate(catalog) if line.startswith('### ')]
    else:
        starts = [i for i, line in enumerate(catalog) if re.match(r'URL[:;]', line)]
    for index, pos in enumerate(starts):
        block = catalog[pos:starts[index+1] if index+1 < len(starts) else len(catalog)]
        title = next(line[4:] for line in block if line.startswith('### ') and not line.startswith('### ['))
        prices = [line for line in block if line.startswith('$')]
        ctas = [cta for line in block if line.startswith('### [') for cta in action(line)]
        page['cards'].append({'name': title, 'image': media(block, topic, index+1), 'price': prices[0] if prices else '', 'action': ctas[0] if ctas else {'label': 'Cotizar componente', 'href': '/contacto'}})
    image_number = len(starts)
    current = None
    faq_mode = False
    i = end
    while i < len(lines):
        line = lines[i]
        if line == '## Preguntas frecuentes':
            faq_mode = True
        elif faq_mode:
            if line.startswith('### '): page['faqs'].append({'question': line[4:], 'answer': ''})
            else: page['faqs'][-1]['answer'] += (' ' if page['faqs'][-1]['answer'] else '') + line
        elif line.startswith('## ['):
            page['sections'].append({'heading': '', 'blocks': [], 'images': [], 'actions': action(line)})
        elif line.startswith('## '):
            current = {'heading': line[3:], 'blocks': [], 'images': [], 'actions': []}
            page['sections'].append(current)
        elif re.match(r'URL[:;]', line):
            image_number += 1
            current['images'].append(media(lines[i:i+3], topic, image_number))
            i += 2
        elif line.startswith('### '):
            current['blocks'].append({'heading': line[4:], 'paragraphs': []})
        else:
            if not current['blocks']: current['blocks'].append({'heading': '', 'paragraphs': []})
            current['blocks'][-1]['paragraphs'].append(inline(line))
        i += 1
    assert len(page['faqs']) == 4
    assert len(page['cards']) == (14 if topic == 'componentes' else 6)
    pages[topic] = page

(OUT / 'commercial-content.ts').write_text('// Editorial source: docs/content/septiembre-2026. Regenerate with tools/prepare-september-content.py.\nimport { CommercialContent } from "./commercial-page.model";\n\nexport const COMMERCIAL_CONTENT: Record<string, CommercialContent> = ' + json.dumps(pages, ensure_ascii=False, indent=2) + ';\n', encoding='utf-8')
(ROOT / 'docs/content/septiembre-2026/images.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
(OUT / 'commercial-images.ts').write_text('export const COMMERCIAL_IMAGES: Record<string, string> = ' + json.dumps({key: page['cards'][0]['image']['src'] for key, page in pages.items()}, ensure_ascii=False, indent=2) + ';\n', encoding='utf-8')
print(f'Prepared {len(pages)} pages and {len(manifest)} images.')
