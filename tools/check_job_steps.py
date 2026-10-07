# -*- coding: utf-8 -*-
import sys
import json
import urllib.request
import urllib.error

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

url = 'https://api.github.com/repos/Deepanshu-8126/loki_09323/actions/runs/37621786154/jobs'
req = urllib.request.Request(url, headers={'User-Agent': 'LokiAuditor/1.0', 'Accept': 'application/vnd.github.v3+json'})

try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        for j in data.get('jobs', []):
            job_name = j.get('name')
            status = j.get('status')
            conclusion = j.get('conclusion')
            print(f"Job: {job_name} | Status: {status} | Conclusion: {conclusion}")
            for s in j.get('steps', []):
                s_name = s.get('name')
                s_status = s.get('status')
                s_conclusion = s.get('conclusion')
                print(f"   Step: {s_name} | Status: {s_status} | Conclusion: {s_conclusion}")
except Exception as e:
    print(f"Error: {e}")
