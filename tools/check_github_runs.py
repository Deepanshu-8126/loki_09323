# -*- coding: utf-8 -*-
import sys
import json
import urllib.request
import urllib.error

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

url = 'https://api.github.com/repos/Deepanshu-8126/loki_09323/actions/runs?per_page=5'
req = urllib.request.Request(url, headers={'User-Agent': 'LokiAuditor/1.0', 'Accept': 'application/vnd.github.v3+json'})

print("========================================================")
print("🌐 GITHUB ACTIONS LIVE WORKFLOW STATUS CHECK")
print("========================================================")

try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        runs = data.get('workflow_runs', [])
        print(f"Total Workflow Runs: {len(runs)}\n")
        for i, r in enumerate(runs, 1):
            run_id = r.get('id')
            status = r.get('status')
            conclusion = r.get('conclusion')
            commit_msg = r.get('head_commit', {}).get('message', '').split('\n')[0]
            created_at = r.get('created_at')
            html_url = r.get('html_url')
            
            icon = "🟢" if status == "in_progress" else "🟡" if status == "queued" else "✅" if conclusion == "success" else "❌" if conclusion == "failure" else "⚪"
            print(f"{icon} Run #{i}: ID {run_id}")
            print(f"   Status: {status.upper()} (Conclusion: {conclusion})")
            print(f"   Commit: {commit_msg}")
            print(f"   Created: {created_at}")
            print(f"   URL: {html_url}\n")
except Exception as e:
    print(f"⚠️ Error checking GitHub API: {e}")

print("========================================================")
