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
COPY packages/utils/package.json ./packages/utils/
COPY packages/circuits/package.json ./packages/circuits/

# Create necessary directories
RUN mkdir -p apps/eliza/src packages/db/src packages/utils/src packages/circuits/src

# Install bun
RUN curl -fsSL https://bun.sh/install | bash

# Install dependencies
RUN /root/.bun/bin/bun install

# Copy source code
COPY tsconfig.json .
COPY apps/eliza apps/eliza
COPY packages/db packages/db
COPY packages/utils packages/utils
COPY packages/circuits packages/circuits

# Build packages
RUN cd packages/utils && /root/.bun/bin/bun run build
RUN cd packages/db && /root/.bun/bin/bun run build
RUN cd apps/eliza && /root/.bun/bin/bun run build

# Set working directory to eliza app
WORKDIR /app/apps/eliza

# Start the app
CMD ["node", "--experimental-modules", "--es-module-specifier-resolution=node", "dist/index.js"]