#!/usr/bin/env python3
"""HTTP-Prüfung für Task 1.3; Token nur aus verdeckter Eingabe oder Environment."""
import argparse
import getpass
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('url', help='HTTPS-Staging-Origin oder http://127.0.0.1:PORT')
parser.add_argument('--http-only', action='store_true', help='Nur Apache/Auth prüfen, keine Diagnose abrufen')
args = parser.parse_args()
origin = urllib.parse.urlsplit(args.url)
if (origin.scheme not in ('http', 'https') or not origin.netloc
        or origin.username or origin.password or origin.query or origin.fragment
        or origin.path not in ('', '/')
        or (origin.scheme == 'http' and origin.hostname not in ('127.0.0.1', 'localhost', '::1'))):
    parser.error('Nur HTTPS-Origin oder lokales HTTP erlaubt.')
base = args.url.rstrip('/')
opener = urllib.request.build_opener(NoRedirect)
failures = []


def request(path, token=None, method='GET'):
    headers = {'X-Spike-Token': token} if token else {}
    req = urllib.request.Request(base + path, headers=headers, method=method)
    try:
        response = opener.open(req, timeout=90)
    except urllib.error.HTTPError as error:
        response = error
    with response:
        return response.status, response.headers, response.read(65536)


def check(label, ok):
    print(('OK   ' if ok else 'FAIL ') + label)
    if not ok:
        failures.append(label)


try:
    for path, expected in [('/', 200), ('/spike-old', 301), ('/spike-gone', 410),
                           ('/vendor/probe.txt', 403), ('/.spike-token', 403),
                           ('/.user.ini', 403), ('/.htaccess', 403), ('/missing-spike', 404),
                           ('/api/ping.php', 404)]:
        status, headers, body = request(path)
        check(f'{path}: HTTP {expected}', status == expected)
        check(f'{path}: Custom-Header', headers.get('X-Goekbau-Spike') == 'task-1.3')
        check(f'{path}: kein X-Powered-By', not headers.get('X-Powered-By'))
        if path == '/spike-old':
            check('301-Ziel', urllib.parse.urljoin(base, headers.get('Location', '')) == base + '/')
        if path == '/missing-spike':
            check('Eigene 404-Seite', b'goekbau-spike-404' in body)
    status, headers, _ = request('/', method='HEAD')
    check('HEAD liefert Header', status == 200 and headers.get('X-Goekbau-Spike') == 'task-1.3')
    check('Falsches Token abgelehnt', request('/api/ping.php', 'invalid-token')[0] == 404)
    if not args.http_only:
        if failures:
            raise ValueError('Öffentliche HTTP-Prüfungen fehlgeschlagen; keine authentifizierte Diagnose.')
        token = os.environ.get('SPIKE_TOKEN') or getpass.getpass('Spike-Token: ')
        if len(token) < 32:
            raise ValueError('Token muss mindestens 32 Zeichen haben.')
        check('POST abgelehnt', request('/api/ping.php', token, 'POST')[0] == 405)
        for number in (1, 2):
            status, headers, body = request('/api/ping.php', token)
            check(f'Diagnose {number}: HTTP 200', status == 200)
            check(f'Diagnose {number}: kein X-Powered-By', not headers.get('X-Powered-By'))
            if status != 200:
                raise ValueError('Diagnose nicht verfügbar.')
            report = json.loads(body)
            print(json.dumps(report, indent=2, ensure_ascii=False))
            check(f'Diagnose {number}: HTTPS abuse.ch mit TLS-Prüfung', report['https_abuse_ch']['transport_ok'])
            check(f'Diagnose {number}: SMTP TLS auf mindestens einem Port', any(report['smtp_tls'].values()))
        check('PHP >= 8.3', tuple(map(int, report['php_version'].split('.')[:2])) >= (8, 3))
        for extension in ('fileinfo', 'zip', 'zlib', 'openssl', 'dom', 'libxml'):
            check('Extension ' + extension, report['extensions'][extension])
        check('Bildverarbeitung', report['extensions']['gd'] or report['extensions']['imagick'])
        for key in ('outside_document_root', 'writable', 'previous_request_seen'):
            check('Speicher: ' + key, report['storage'][key])

        def size_bytes(value):
            value = value.strip().upper()
            return int(value[:-1]) * 1024 ** ('KMG'.index(value[-1]) + 1) if value[-1] in 'KMG' else int(value)

        check('upload_max_filesize >= 10 MiB', size_bytes(report['limits']['upload_max_filesize']) >= 10 * 1024**2)
        post_limit = size_bytes(report['limits']['post_max_size'])
        check('post_max_size >= 11 MiB oder unbegrenzt', post_limit == 0 or post_limit >= 11 * 1024**2)
        check('max_file_uploads >= 5', int(report['limits']['max_file_uploads']) >= 5)
    print(f'\n{len(failures)} fehlgeschlagene Prüfungen.'
          + (' Nur HTTP geprüft; Hosting-Fähigkeiten bleiben offen.' if args.http_only else ''))
    sys.exit(1 if failures else 0)
except (OSError, ValueError, KeyError) as error:
    print('Prüfung abgebrochen: ' + str(error), file=sys.stderr)
    sys.exit(1)
