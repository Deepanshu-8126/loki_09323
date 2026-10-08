#!/bin/bash
set -e

echo "🚀 Starting 24/7 OmniRoute Cloud Engine..."
mkdir -p /root/.loki /root/.omniroute

# Configure OmniRoute env if provided
if [ -n "$GROQ_API_KEY" ]; then
  cat <<EOF > /root/.omniroute/.env
GROQ_API_KEY=$GROQ_API_KEY
EOF
fi

# Start OmniRoute in background on port 20128
omniroute serve --port 20128 --no-open &

echo "⏳ Waiting for OmniRoute to become ready..."
sleep 4

# Configure Loki config.yaml
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
    Execute instructions using the terminal and file tools. Always verify builds with 0 errors before completing.
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
  threshold: 0.35
  target_ratio: 0.15
  protect_last_n: 8
  protect_first_n: 2
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

# Lightweight HTTP Health Check Server on $PORT for Render keep-alive
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

echo "🤖 Starting 24/7 Telegram Gateway with 42-Agent Swarm..."
exec loki gateway run --accept-hooks
