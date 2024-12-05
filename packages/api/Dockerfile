# Use Node 23.3.0 as base
FROM node:23.3.0-slim

WORKDIR /app

# Install required packages including curl for bun installation
RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    git \
    python3 \
    python3-pip \
    make \
    g++ \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install bun
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"

# Copy root workspace files
COPY package.json .
COPY bun.lockb .
COPY turbo.json .
COPY tsconfig.json .

# Copy workspace packages
COPY packages/api ./packages/api
COPY packages/db ./packages/db
COPY packages/utils ./packages/utils

# Install dependencies
RUN bun install

# Build packages using root script
RUN bun run railway:build:api

# Set working directory to api package
WORKDIR /app/packages/api

# Start the API
CMD ["bun", "run", "start"] 