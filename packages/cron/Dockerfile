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

# Copy only the necessary packages
COPY packages/cron ./packages/cron
COPY packages/db ./packages/db
COPY packages/utils ./packages/utils
COPY packages/circuits ./packages/circuits

# Install dependencies
RUN bun install

# Build packages in correct order
RUN bun run railway:build:cron

# Set working directory to cron package
WORKDIR /app/packages/cron

# Run the update-merkle-tree script using the built version
CMD ["node", "--experimental-modules", "--es-module-specifier-resolution=node", "dist/index.js"] 