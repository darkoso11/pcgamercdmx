"""Exercise SEO with an isolated temporary entry; clean up its entry and file."""
import base64
import datetime
import json
import os
import re
import urllib.error
import urllib.request
import uuid
from pathlib import Path

CMS = os.environ.get('DIRECTUS_URL', 'https://cms.test.pcgamercdmx.com')
SITE = os.environ.get('BLOG_TEST_URL', 'http://127.0.0.1:4267')
raw = (Path.home() / '.pcgamercdmx/directus-backend.txt').read_text()
credentials = {key: re.search('^' + label + r':\s*(.+)$', raw, re.M).group(1).strip()
               for key, label in [('email', 'Admin email'), ('password', 'Admin password')]}
token = None

def request(base, route, method='GET', body=None, authorized=False, content_type='application/json'):
    headers = {'Content-Type': content_type}
    if authorized:
        headers['Authorization'] = 'Bearer ' + token
    data = body if isinstance(body, bytes) else json.dumps(body).encode() if body is not None else None
    try:
        with urllib.request.urlopen(urllib.request.Request(base + route, method=method, data=data, headers=headers), timeout=30) as response:
            raw = response.read().decode(errors='replace')
            return response.status, json.loads(raw) if raw and 'application/json' in response.headers.get('Content-Type', '') else raw
    except urllib.error.HTTPError as error:
        return error.code, error.read().decode()

status, login = request(CMS, '/auth/login', 'POST', credentials)
assert status == 200
token = login['data']['access_token']
post_id = file_id = None
slug = 'seo-verification-' + uuid.uuid4().hex
now = datetime.datetime.now(datetime.timezone.utc)
try:
    boundary = uuid.uuid4().hex
    png = base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a3ioAAAAASUVORK5CYII=')
    body = (f'--{boundary}\r\nContent-Disposition: form-data; name="pc_blog_managed"\r\n\r\ntrue\r\n'
            f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="seo-verification.png"\r\nContent-Type: image/png\r\n\r\n').encode() + png + f'\r\n--{boundary}--\r\n'.encode()
    status, uploaded = request(CMS, '/files', 'POST', body, True, 'multipart/form-data; boundary=' + boundary)
    assert status == 200
    file_id = uploaded['data']['id']
    status, created = request(CMS, '/items/pc_blog_posts', 'POST', {
        'title': 'Entrada temporal SEO', 'slug': slug, 'summary': 'Resumen de prueba SEO',
        'seo_title': 'Título SEO personalizado', 'seo_description': 'Descripción SEO personalizada',
        'seo_image': CMS + '/assets/' + file_id, 'published': False,
        'sections': [{'id': 'test', 'title': 'Contenido', 'text': '<p>Contenido visible de prueba SEO.</p>'}],
    }, True)
    assert status == 200, ('create', status)
    post_id = created['data']['id']
    assert request(SITE, '/blog/' + slug)[0] == 404
    status, _ = request(CMS, '/items/pc_blog_posts/' + str(post_id), 'PATCH', {'published': True, 'published_at': (now + datetime.timedelta(days=1)).isoformat()}, True)
    assert status == 200
    assert request(SITE, '/blog/' + slug)[0] == 404
    assert slug not in request(SITE, '/sitemap.xml')[1]
    assert request(CMS, '/assets/' + file_id)[0] == 403
    published_at = (now - datetime.timedelta(minutes=5)).isoformat()
    status, _ = request(CMS, '/items/pc_blog_posts/' + str(post_id), 'PATCH', {'published_at': published_at}, True)
    assert status == 200
    status, html = request(SITE, '/blog/' + slug)
    assert status == 200
    assert '<title>Título SEO personalizado</title>' in html
    assert 'Descripción SEO personalizada' in html
    assert 'Contenido visible de prueba SEO.' in html
    assert 'BlogPosting' in html and 'dateModified' in html and 'datePublished' in html
    assert CMS + '/assets/' + file_id in html
    assert request(CMS, '/assets/' + file_id)[0] == 200
    assert slug in request(SITE, '/sitemap.xml')[1]
    status, _ = request(CMS, '/items/pc_blog_posts/' + str(post_id), 'PATCH', {'seo_title': 'SEO actualizado sin reconstruir'}, True)
    assert status == 200
    assert '<title>SEO actualizado sin reconstruir</title>' in request(SITE, '/blog/' + slug)[1]
    status, _ = request(CMS, '/items/pc_blog_posts/' + str(post_id), 'PATCH', {'published': False}, True)
    assert status == 200
    assert request(SITE, '/blog/' + slug)[0] == 404
    assert slug not in request(SITE, '/sitemap.xml')[1]
    assert request(CMS, '/assets/' + file_id)[0] == 403
    print('Live SEO overrides, initial HTML, publication scheduling, social-image privacy, fresh updates and sitemap: passed.')
finally:
    if post_id:
        assert request(CMS, '/items/pc_blog_posts/' + str(post_id), 'DELETE', authorized=True)[0] == 204
    if file_id:
        assert request(CMS, '/files/' + file_id, 'DELETE', authorized=True)[0] == 204
    print('Temporary SEO records removed.')
