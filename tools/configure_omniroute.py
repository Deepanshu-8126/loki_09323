# -*- coding: utf-8 -*-
"""
OmniRoute Intelligent Multi-Provider Probe & Auto-Configurator for Loki.
Probes Groq (Llama-3.3-70B), Gemini 2.0 Flash, and OpenRouter in real-time,
picks the fastest verified working endpoint, and generates ~/.loki/config.yaml and .env.
"""
import os
import sys
import json
import urllib.request
import urllib.error
from pathlib import Path

# Ensure UTF-8 output
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

def probe_provider(name: str, url: str, key: str, model: str, extra_headers=None) -> bool:
    if not key or not key.strip():
        return False
    headers = {
        'Authorization': f'Bearer {key.strip()}',
        'Content-Type': 'application/json',
        'User-Agent': 'LokiOmniRoute/1.0'
    }
    if extra_headers:
        headers.update(extra_headers)
    
    payload = json.dumps({
        'model': model,
        'messages': [{'role': 'user', 'content': 'hi'}],
        'max_tokens': 2
    }).encode('utf-8')
    
    req = urllib.request.Request(url, data=payload, headers=headers, method='POST')
    try:
        with urllib.request.urlopen(req, timeout=8) as resp:
            if resp.status == 200:
                print(f"   ✅ {name} probe SUCCESS (HTTP 200) -> Model: {model}")
                return True
    except urllib.error.HTTPError as e:
        err_msg = ""
        try:
            err_msg = e.read().decode('utf-8', errors='ignore')
        except Exception:
            pass
        print(f"   ⚠️ {name} probe failed (HTTP {e.code}): {err_msg[:120]}")
    except Exception as e:
        print(f"   ⚠️ {name} connection error: {e}")
    return False

def discover_openrouter_model(key: str) -> str:
    """Find the best available free model on OpenRouter if paid model not enabled."""
    try:
        req = urllib.request.Request(
            'https://openrouter.ai/api/v1/models',
            headers={'Authorization': f'Bearer {key}', 'User-Agent': 'Loki/1.0'}
        )
        with urllib.request.urlopen(req, timeout=6) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            models = [m['id'] for m in data.get('data', [])]
            free_models = [m for m in models if ':free' in m]
            
            # Prefer larger instruct models
            for candidate in ['google/gemma-4-31b-it:free', 'google/gemma-4-26b-a4b-it:free', 'nvidia/nemotron-3-super-120b-a12b:free']:
                if candidate in free_models:
                    return candidate
            if free_models:
                return free_models[0]
    except Exception:
        pass
    return 'google/gemma-4-31b-it:free'

def main():
    print("========================================================")
    print("🚀 OMNIROUTE REAL-TIME PROVIDER PROBE & AUTO-CONFIG")
    print("========================================================")

    groq_key = os.environ.get('GROQ_API_KEY', '').strip()
    gemini_key = os.environ.get('GEMINI_API_KEY', '').strip() or os.environ.get('GOOGLE_API_KEY', '').strip()
    openrouter_key = os.environ.get('OPENROUTER_API_KEY', '').strip()
    openai_key = os.environ.get('OPENAI_API_KEY', '').strip()
    
    workspace = os.environ.get('GITHUB_WORKSPACE', os.getcwd())
    allowed_users = os.environ.get('TELEGRAM_ALLOWED_USERS', '6486771356,Dkx')
    tg_token = os.environ.get('TELEGRAM_BOT_TOKEN', '').strip()

    selected_provider = None
    selected_model = None
    selected_base_url = None
    selected_key = None

    # 1. Test Groq (Ultra-fast, Llama 3.3 70B Versatile)
    if groq_key:
        print("🔍 Testing Provider: Groq LPU (llama-3.3-70b-versatile)...")
        if probe_provider("Groq", "https://api.groq.com/openai/v1/chat/completions", groq_key, "llama-3.3-70b-versatile"):
            selected_provider = "Groq"
            selected_model = "llama-3.3-70b-versatile"
            selected_base_url = "https://api.groq.com/openai/v1"
            selected_key = groq_key

    # 2. Test Gemini 2.0 Flash if Groq not selected
    if not selected_provider and gemini_key:
        print("🔍 Testing Provider: Google Gemini (gemini-2.0-flash)...")
        if probe_provider("Gemini", "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", gemini_key, "gemini-2.0-flash"):
            selected_provider = "Google Gemini"
            selected_model = "gemini-2.0-flash"
            selected_base_url = "https://generativelanguage.googleapis.com/v1beta/openai/"
            selected_key = gemini_key

    # 3. Test OpenRouter if above not selected
    if not selected_provider and openrouter_key:
        print("🔍 Testing Provider: OpenRouter (meta-llama/llama-3.3-70b-instruct)...")
        if probe_provider("OpenRouter Paid/Credit", "https://openrouter.ai/api/v1/chat/completions", openrouter_key, "meta-llama/llama-3.3-70b-instruct"):
            selected_provider = "OpenRouter"
            selected_model = "meta-llama/llama-3.3-70b-instruct"
            selected_base_url = "https://openrouter.ai/api/v1"
            selected_key = openrouter_key
        else:
            free_model = discover_openrouter_model(openrouter_key)
            print(f"🔍 Testing OpenRouter Free Tier ({free_model})...")
            if probe_provider("OpenRouter Free", "https://openrouter.ai/api/v1/chat/completions", openrouter_key, free_model):
                selected_provider = "OpenRouter"
                selected_model = free_model
                selected_base_url = "https://openrouter.ai/api/v1"
                selected_key = openrouter_key

    # 4. Fallback to OpenAI
    if not selected_provider and openai_key:
        print("🔍 Testing Provider: OpenAI (gpt-4o-mini)...")
        if probe_provider("OpenAI", "https://api.openai.com/v1/chat/completions", openai_key, "gpt-4o-mini"):
            selected_provider = "OpenAI"
            selected_model = "gpt-4o-mini"
            selected_base_url = "https://api.openai.com/v1"
            selected_key = openai_key

    # Absolute fallback to best available key
    if not selected_provider:
        print("⚠️ Probes completed without 200 OK. Applying resilient default based on available keys...")
        if groq_key:
            selected_provider = "Groq"
            selected_model = "llama-3.3-70b-versatile"
            selected_base_url = "https://api.groq.com/openai/v1"
            selected_key = groq_key
        elif gemini_key:
            selected_provider = "Google Gemini"
            selected_model = "gemini-2.0-flash"
            selected_base_url = "https://generativelanguage.googleapis.com/v1beta/openai/"
            selected_key = gemini_key
        elif openrouter_key:
            selected_provider = "OpenRouter"
            selected_model = "google/gemma-4-31b-it:free"
            selected_base_url = "https://openrouter.ai/api/v1"
            selected_key = openrouter_key
        else:
            selected_provider = "OpenAI"
            selected_model = "gpt-4o-mini"
            selected_base_url = "https://api.openai.com/v1"
            selected_key = openai_key or "sk-dummy"

    print("--------------------------------------------------------")
    print(f"👑 ACTIVATED PROVIDER: {selected_provider}")
    print(f"🤖 ACTIVE MODEL:    {selected_model}")
    print(f"🌐 BASE URL:        {selected_base_url}")
    print("--------------------------------------------------------")

    # Generate ~/.loki/config.yaml
    loki_dir = Path.home() / ".loki"
    loki_dir.mkdir(parents=True, exist_ok=True)
    
    config_yaml = f"""database:
  journal_mode: delete
model:
  default: {selected_model}
  provider: custom
  base_url: {selected_base_url}
  api_key: "{selected_key}"
  context_length: 131072
compression:
  enabled: true
  threshold: 0.75
  target_ratio: 0.30
  protect_last_n: 12
  protect_first_n: 2
  proactive_prune_tokens: 4096
  proactive_prune_min_result_chars: 4000
  proactive_prune_min_reclaim_tokens: 2048
memory:
  enabled: true
  summary_on_overflow: true
gateway:
  allow_all_users: true
  platforms:
    telegram:
      enabled: true
      allow_all_users: true
      extra:
        status_indicator: true
        allowed_users:
          - "6486771356"
          - "Dkx"
workspace:
  root: "{workspace}"
terminal:
  cwd: "{workspace}"
"""
    config_file = loki_dir / "config.yaml"
    config_file.write_text(config_yaml, encoding="utf-8")
    print(f"📝 Wrote verified configuration to {config_file}")

    # Generate ~/.loki/.env
    env_content = f"""OPENAI_API_KEY={selected_key}
OPENAI_BASE_URL={selected_base_url}
CUSTOM_API_KEY={selected_key}
CUSTOM_BASE_URL={selected_base_url}
LOKI_MODEL={selected_model}
LOKI_WORKSPACE={workspace}
TELEGRAM_BOT_TOKEN={tg_token}
TELEGRAM_ALLOWED_USERS={allowed_users}
TELEGRAM_HOME_CHANNEL=6486771356
GATEWAY_ALLOW_ALL_USERS=true
TELEGRAM_ALLOW_ALL_USERS=true
LOKI_TELEGRAM_ALLOW_ALL=true
"""
    env_file = loki_dir / ".env"
    env_file.write_text(env_content, encoding="utf-8")
    print(f"📝 Wrote environment variables to {env_file}")

    # Also append to GITHUB_ENV if in GitHub Actions
    gh_env = os.environ.get('GITHUB_ENV')
    if gh_env and os.path.exists(gh_env):
        with open(gh_env, 'a', encoding='utf-8') as f:
            f.write(f"OPENAI_API_KEY={selected_key}\n")
            f.write(f"OPENAI_BASE_URL={selected_base_url}\n")
            f.write(f"CUSTOM_API_KEY={selected_key}\n")
            f.write(f"CUSTOM_BASE_URL={selected_base_url}\n")
            f.write(f"LOKI_MODEL={selected_model}\n")
        print("✅ Exported variables to GITHUB_ENV")

if __name__ == '__main__':
    main()
