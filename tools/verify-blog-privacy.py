"""Exercise CMS privacy with a disposable image and post; never touches user entries."""
import base64
import datetime
import json
import re
import urllib.error
import urllib.parse
import urllib.request
import uuid
from pathlib import Path

BASE = 'https://cms.test.pcgamercdmx.com'
raw = (Path.home() / '.pcgamercdmx/directus-backend.txt').read_text()
credentials = {key: re.search('^' + label + r':\s*(.+)$', raw, re.M).group(1).strip()
               for key, label in [('email', 'Admin email'), ('password', 'Admin password')]}

def request(route, method='GET', body=None, auth=False, content_type='application/json'):
    headers = {'Content-Type': content_type}
    if auth:
        headers['Authorization'] = 'Bearer ' + token
    data = body if isinstance(body, bytes) else json.dumps(body).encode() if body is not None else None
    try:
        with urllib.request.urlopen(urllib.request.Request(BASE + route, data=data, headers=headers, method=method), timeout=30) as response:
            data = response.read()
            return response.status, json.loads(data) if 'application/json' in response.headers.get('Content-Type', '') and data else data
    except urllib.error.HTTPError as error:
        return error.code, error.read()

status, login = request('/auth/login', 'POST', credentials)
assert status == 200, ('login', status)
token = login['data']['access_token']
file_id = post_id = None
results = {}
try:
    status, public_files = request('/files?filter[pc_blog_managed][_eq]=false&limit=1&fields=id')
    assert status == 200, ('public file listing', status)
    public_id = public_files['data'][0]['id'] if public_files['data'] else None
    if public_id:
        results['catalogue_asset_before'] = request('/assets/' + public_id)[0]

    boundary = 'privacy-' + uuid.uuid4().hex
    png = base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a3ioAAAAASUVORK5CYII=')
    multipart = (f'--{boundary}\r\nContent-Disposition: form-data; name="pc_blog_managed"\r\n\r\ntrue\r\n'
                 f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="privacy-check.png"\r\nContent-Type: image/png\r\n\r\n').encode() + png + f'\r\n--{boundary}--\r\n'.encode()
    status, uploaded = request('/files', 'POST', multipart, True, 'multipart/form-data; boundary=' + boundary)
    assert status == 200, ('upload', status)
    file_id = uploaded['data']['id']
    results['new_unattached_file_anonymous'] = request('/assets/' + file_id)[0]
    results['new_file_authorized'] = request('/assets/' + file_id, auth=True)[0]
    assert results['new_unattached_file_anonymous'] == 403
    assert results['new_file_authorized'] == 200

    now = datetime.datetime.now(datetime.timezone.utc)
    status, post = request('/items/pc_blog_posts', 'POST', {
        'title': 'Verificación temporal de privacidad', 'slug': 'privacy-check-' + uuid.uuid4().hex,
        'published': True, 'published_at': (now + datetime.timedelta(days=1)).isoformat(),
        'cover_image': {'fileId': file_id, 'url': BASE + '/assets/' + file_id}, 'sections': [],
    }, True)
    assert status == 200, ('create test post', status)
    post_id = post['data']['id']
    results['scheduled_post_anonymous'] = request('/items/pc_blog_posts/' + str(post_id))[0]
    results['scheduled_asset_anonymous'] = request('/assets/' + file_id)[0]
    assert results['scheduled_post_anonymous'] == 403
    assert results['scheduled_asset_anonymous'] == 403

    status, _ = request('/items/pc_blog_posts/' + str(post_id), 'PATCH', {'published_at': (now - datetime.timedelta(minutes=5)).isoformat()}, True)
    assert status == 200
    results['published_post_anonymous'] = request('/items/pc_blog_posts/' + str(post_id))[0]
    results['published_asset_anonymous'] = request('/assets/' + file_id)[0]
    assert results['published_post_anonymous'] == 200
    assert results['published_asset_anonymous'] == 200, (results, request('/assets/' + file_id))

    status, _ = request('/items/pc_blog_posts/' + str(post_id), 'PATCH', {'published_at': (now + datetime.timedelta(days=1)).isoformat()}, True)
    assert status == 200
    results['rescheduled_asset_anonymous'] = request('/assets/' + file_id)[0]
    assert results['rescheduled_asset_anonymous'] == 403

    status, _ = request('/items/pc_blog_posts/' + str(post_id), 'PATCH', {'published': False}, True)
    assert status == 200
    results['unpublished_asset_anonymous'] = request('/assets/' + file_id)[0]
    results['unpublished_asset_authorized'] = request('/assets/' + file_id, auth=True)[0]
    assert results['unpublished_asset_anonymous'] == 403
    assert results['unpublished_asset_authorized'] == 200
    if public_id:
        results['catalogue_asset_after'] = request('/assets/' + public_id)[0]
        assert results['catalogue_asset_before'] == results['catalogue_asset_after'] == 200
    print(json.dumps(results, indent=2))
finally:
    if post_id:
        assert request('/items/pc_blog_posts/' + str(post_id), 'DELETE', auth=True)[0] == 204
        if file_id:
            assert request('/assets/' + file_id)[0] == 403
    if file_id:
        assert request('/files/' + file_id, 'DELETE', auth=True)[0] == 204
    print('Disposable test records removed.')
