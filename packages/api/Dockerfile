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

# Copy root workspace files first
COPY package.json bun.lockb ./
COPY apps/eliza/package.json ./apps/eliza/
COPY packages/db/package.json ./packages/db/
COPY packages/utils/package.json ./packages/utils/

# Install dependencies
RUN bun install

# Now copy the source code
COPY tsconfig.json .
COPY apps/eliza ./apps/eliza
COPY packages/db ./packages/db
COPY packages/utils ./packages/utils

# Build packages in the same order as our railway:build script
RUN bun run railway:build

# Set working directory to api package
WORKDIR /app/packages/api

# Start the API
CMD ["bun", "run", "start"] 