# Loki Autonomous Telegram Agent 24/7 Cloud Container
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install uv for high-speed package management
RUN pip install --no-cache-dir uv

# Clone and install WunderCorp Loki Agent
WORKDIR /app
RUN git clone --depth 1 https://github.com/wundercorp/loki.git /app/loki-agent
WORKDIR /app/loki-agent
RUN uv pip install --system -e .

# Setup runtime working directory
WORKDIR /workspace
ENV LOKI_HOME=/root/.loki
ENV PYTHONPATH=/app/loki-agent
ENV PYTHONUNBUFFERED=1

# Entrypoint to launch gateway
CMD ["python3", "-m", "loki_cli.main", "gateway", "run"]
