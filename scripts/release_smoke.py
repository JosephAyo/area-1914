import datetime
import json
import os
from pathlib import Path
import re
import socket
import subprocess
import tempfile
import time
import urllib.request
import urllib.error

root = Path(__file__).resolve().parents[1]
checks = []

def request(url, method='GET', payload=None, origin=None):
    headers = {'Origin': origin} if origin else {}
    if payload is not None:
        headers['Content-Type'] = 'application/json'
    if method == 'OPTIONS':
        headers.update({'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type'})
    req = urllib.request.Request(url, data=json.dumps(payload).encode() if payload is not None else None, headers=headers, method=method)
    try:
        response = urllib.request.urlopen(req, timeout=15)
    except urllib.error.HTTPError as error:
        response = error
    with response:
        raw = response.read()
        try:
            body = json.loads(raw)
        except (ValueError, UnicodeDecodeError):
            body = raw.decode(errors='replace')
        return response.status, body, response.headers

def verify(name, condition):
    checks.append({'check': name, 'passed': bool(condition)})
    if not condition:
        raise AssertionError(name)

def port():
    with socket.socket() as sock:
        sock.bind(('127.0.0.1', 0))
        return sock.getsockname()[1]

def wait_ready(base, proc):
    for _ in range(100):
        if proc.poll() is not None:
            raise RuntimeError('Smoke server exited before startup')
        try:
            if request(base)[0] == 200:
                return
        except OSError:
            pass
        time.sleep(0.1)
    raise TimeoutError('Smoke server did not start')

with tempfile.TemporaryDirectory(prefix='area1914-release-') as temporary:
    env = os.environ.copy()
    env['DATABASE_URL'] = 'sqlite:///' + str(Path(temporary) / 'smoke.db')
    python = str(root / 'backend/.venv/bin/python')
    seed = '''from datetime import datetime, timezone
from sqlmodel import Session
from app.database import engine, create_db_and_tables
from app.models import WikiTopic
create_db_and_tables()
with Session(engine) as s:
 s.add(WikiTopic(slug="Release_Probe", title="Release probe", last_fetched_at=datetime.now(timezone.utc)))
 s.commit()
'''
    subprocess.run([python, '-c', seed], cwd=root/'backend', env=env, check=True, capture_output=True)
    api_port, frontend_port = port(), port()
    while frontend_port == api_port:
        frontend_port = port()
    api = f'http://127.0.0.1:{api_port}'
    site = f'http://127.0.0.1:{frontend_port}'
    processes = []
    with open(Path(temporary)/'servers.log', 'w') as log:
        try:
            processes.append(subprocess.Popen([python, '-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', str(api_port)], cwd=root/'backend', env=env, stdout=log, stderr=subprocess.STDOUT))
            processes.append(subprocess.Popen(['node', 'node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', str(frontend_port), '--strictPort'], cwd=root/'frontend', stdout=log, stderr=subprocess.STDOUT))
            wait_ready(api+'/health', processes[0])
            wait_ready(site+'/', processes[1])
            verify('Isolated API health', request(api+'/health')[0] == 200)
            origin = 'http://localhost:5173'
            status, _, headers = request(api+'/api/classification-reports', 'OPTIONS', origin=origin)
            verify('Report submission CORS preflight', status == 200 and headers.get('Access-Control-Allow-Origin') == origin)
            payload = {'slug': 'Release_Probe', 'requested_relevance': False, 'reason': 'Synthetic release smoke check; no real subject is being reviewed.', 'source_url': None}
            status, receipt, headers = request(api+'/api/classification-reports', 'POST', payload, origin)
            verify('HTTP report submission returns private pending receipt', status == 201 and set(receipt) == {'id','status'} and receipt['status'] == 'pending' and headers.get('Access-Control-Allow-Origin') == origin)
            verify('Duplicate report returns same reference', request(api+'/api/classification-reports', 'POST', payload)[1] == receipt)
            verify('Pending report does not exclude cached subject', request(api+'/api/topics/Release_Probe')[0] == 200)
            queue = subprocess.run([python,'-m','app.review_reports','list'],cwd=root/'backend',env=env,check=True,capture_output=True,text=True)
            verify('Maintainer queue sees report from separate process', json.loads(queue.stdout)['id'] == receipt['id'])
            def review(reference, action):
                subprocess.run([python,'-m','app.review_reports','review',str(reference),action,'--note','Synthetic isolated smoke review.'],cwd=root/'backend',env=env,check=True,capture_output=True)
            review(receipt['id'], 'approve')
            verify('Approved exclusion returns relevance rejection', request(api+'/api/topics/Release_Probe')[0] == 422)
            payload['requested_relevance'] = True
            _, correction, _ = request(api+'/api/classification-reports','POST',payload)
            verify('Pending reversal does not change approved exclusion', request(api+'/api/topics/Release_Probe')[0] == 422)
            review(correction['id'], 'approve')
            verify('Approved reversal restores cached subject', request(api+'/api/topics/Release_Probe')[0] == 200)
            payload['reason'] += ' Additional dismissed report.'
            payload['requested_relevance'] = False
            _, dismissed, _ = request(api+'/api/classification-reports','POST',payload)
            review(dismissed['id'], 'dismiss')
            verify('Dismissal leaves relevance unchanged', request(api+'/api/topics/Release_Probe')[0] == 200)
            verify('Reports cannot be listed publicly', request(api+'/api/classification-reports')[0] == 405)
            verify('Invalid report is rejected over HTTP', request(api+'/api/classification-reports','POST',{'slug':'','reason':''})[0] == 422)
            for route in ['/', '/discover', '/topics/Fela_Kuti', '/stories', '/stories/afrobeat', '/stories/reading-the-pulse', '/stories/subjects/Fela_Kuti']:
                status, body, _ = request(site+route)
                verify('Production SPA entry '+route, status == 200 and 'id="root"' in body)
            _, html, _ = request(site+'/')
            for asset in re.findall(r'(?:src|href)="(/assets/[^\"]+)"', html):
                verify('Production bundle '+asset.rsplit('/',1)[-1], request(site+asset)[0] == 200)
            for weight in [400,500,600]:
                verify(f'Production Noto Sans {weight}', request(site+f'/fonts/noto-sans-{weight}.woff')[0] == 200)
        finally:
            for process in processes:
                process.terminate()
            for process in processes:
                try:
                    process.wait(timeout=10)
                except subprocess.TimeoutExpired:
                    process.kill()
                    process.wait()

report = {
 'recorded_at': datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'checkpoint': subprocess.check_output(['git','rev-parse','--short','HEAD'],cwd=root,text=True).strip(),
 'scope': 'Real HTTP requests against isolated SQLite/FastAPI and the production Vite preview; separate-process maintainer CLI.',
 'exclusions': ['No browser rendering or interactions','No downloaded PNG or screenshot inspection','No runtime performance measurements','No upstream Wikipedia availability check'],
 'real_queue_modified': False,
 'checks': checks,
}
(root/'docs/design/release-smoke.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'passed': sum(c['passed'] for c in checks),'total':len(checks),'artifact':'docs/design/release-smoke.json','temporary_servers_stopped':True}))
