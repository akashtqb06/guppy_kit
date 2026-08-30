FROM mcr.microsoft.com/devcontainers/python:1-3.11-bookworm

# Fix potential expired yarn key issue and install PostgreSQL client / curl
RUN rm -f /etc/apt/sources.list.d/yarn.list \
    && apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends postgresql-client curl \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Install uv (Python package manager) globally
RUN curl -LsSf https://astral.sh/uv/install.sh | env UV_INSTALL_DIR="/usr/local/bin" sh

# Install Node.js 20 and pnpm
RUN su vscode -c "umask 0002 && . /usr/local/share/nvm/nvm.sh && nvm install 20 2>&1"
RUN su vscode -c "npm install -g pnpm"
