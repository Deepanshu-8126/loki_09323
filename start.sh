#!/bin/bash
set -e

echo "🚀 Starting 24/7 OmniRoute + Loki Autonomous Cloud Engine..."
mkdir -p /root/.loki /root/.omniroute

# Configure OmniRoute env
cat <<EOF > /root/.omniroute/.env
STORAGE_ENCRYPTION_KEY=3474e4c57a92da157acc17c1f13cd77a8dce909dc9f4048a83dd9d55bcae6675
OMNIROUTE_CHAT_MAX_HEAVY_IN_FLIGHT=64
OMNIROUTE_CHAT_ADMISSION_QUEUE_MS=120000
OMNIROUTE_CHAT_ADMISSION_HEALTHY_HEADROOM=64
OMNIROUTE_CHAT_ADMISSION_MAX_QUEUED_BYTES=268435456
OMNIROUTE_CHAT_HEAVY_ESTIMATED_TOKENS=500000
OMNIROUTE_CHAT_ADMISSION_HEAP_SHED_RATIO=0.98
EOF

# Start OmniRoute in background on port 20128
omniroute serve --port 20128 --no-open &

echo "⏳ Waiting for OmniRoute to initialize..."
sleep 5

# Auto-seed providers
node /workspace/seed_omniroute.js || true

# Configure Loki config.yaml with Smart Compaction & Multi-Model Fallback
cat <<EOF > /root/.loki/config.yaml
database:
  journal_mode: wal
model:
  default: gemini-3.7-flash
  provider: custom
  base_url: http://localhost:20128/v1
  api_key: "omniroute"
  context_length: 1048576
custom_providers:
  - name: "omniroute"
    base_url: "http://localhost:20128/v1"
    api_key: "omniroute"
    model: "gemini-3.7-flash"
  - name: "omniroute-fallback"
    base_url: "http://localhost:20128/v1"
    api_key: "omniroute"
    model: "gemini/gemini-flash-latest"
platform_toolsets:
  cli:
    - terminal
    - file
  telegram:
    - terminal
    - file
agent:
  system_prompt: |
    You are the Supreme Hermes 42-Agent Autonomous Swarm Factory.
    Execute instructions accurately. Always verify builds with 0 errors.
  disabled_toolsets:
    - browser
    - computer_use
    - vision
    - video
    - video_gen
    - image_gen
    - typesafe
    - x_search
    - webmcp
    - link-wallet
    - homeassistant
    - spotify
    - discord
    - discord_admin
    - yuanbao
    - session_search
    - connections
    - clarify
    - cronjob
    - kanban
    - memory
    - code_execution
compression:
  enabled: true
  threshold: 0.20
  target_ratio: 0.10
  protect_last_n: 4
  protect_first_n: 2
  proactive_prune_tokens: 1024
  proactive_prune_min_result_chars: 2000
  proactive_prune_min_reclaim_tokens: 512
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
          - "${TELEGRAM_ALLOWED_USERS:-6486771356}"
EOF

# Configure Loki .env
cat <<EOF > /root/.loki/.env
OPENAI_API_KEY=omniroute
OPENAI_BASE_URL=http://localhost:20128/v1
CUSTOM_API_KEY=omniroute
CUSTOM_BASE_URL=http://localhost:20128/v1
LOKI_MODEL=gemini-3.7-flash
TELEGRAM_BOT_TOKEN=\${TELEGRAM_BOT_TOKEN}
TELEGRAM_ALLOWED_USERS=\${TELEGRAM_ALLOWED_USERS:-6486771356,Dkx}
TELEGRAM_HOME_CHANNEL=\${TELEGRAM_HOME_CHANNEL:-6486771356}
GATEWAY_ALLOW_ALL_USERS=true
TELEGRAM_ALLOW_ALL_USERS=true
EOF

# HTTP Keep-Alive listener on $PORT for Render health checks
python3 -c "
import http.server, socketserver, os, threading

PORT = int(os.environ.get('PORT', 10000))
class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/plain')
        self.end_headers()
        self.wfile.write(b'OmniRoute + Loki 24/7 Swarm Gateway is LIVE!')

httpd = socketserver.TCPServer(('', PORT), Handler)
threading.Thread(target=httpd.serve_forever, daemon=True).start()
print(f'✅ Health check listener active on port {PORT}')
"

echo "🤖 Starting 24/7 Telegram Gateway with OmniRoute Multi-Model Engine..."
exec loki gateway run --accept-hooks
