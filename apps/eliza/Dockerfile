FROM node:23.3.0-slim

WORKDIR /app

# Install curl and other required packages
RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json bun.lockb ./
COPY apps/eliza/package.json ./apps/eliza/
COPY packages/db/package.json ./packages/db/

# Install bun
RUN curl -fsSL https://bun.sh/install | bash

# Install dependencies
RUN /root/.bun/bin/bun install

# Copy source code
COPY . .

# Build packages
RUN /root/.bun/bin/bun run railway:build

# Set working directory to eliza app
WORKDIR /app/apps/eliza

# Start the app
CMD ["node", "--experimental-modules", "--es-module-specifier-resolution=node", "dist/index.js"]