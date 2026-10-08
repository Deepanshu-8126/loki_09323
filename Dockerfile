# Loki + OmniRoute 24/7 Autonomous Cloud Daemon
FROM python:3.11-slim

# Install system build dependencies + Node.js 22 LTS
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    ca-certificates \
    procps \
    build-essential \
    python3-dev \
    make \
    g++ \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install OmniRoute globally with native build toolchain
RUN npm install -g omniroute --force

# Install Loki Agent & Telegram dependencies
ENV LOKI_NIX_BUILD=1
RUN pip install --no-cache-dir \
    "git+https://github.com/wundercorp/loki.git" \
    "python-telegram-bot[webhooks]>=21.0" \
    aiohttp \
    httpx \
    openai

# Setup workspace
WORKDIR /workspace
COPY . /workspace

# Copy startup script
RUN chmod +x /workspace/start.sh

ENV PORT=10000
ENV PYTHONUNBUFFERED=1

EXPOSE 10000 20128

CMD ["/workspace/start.sh"]
