# Use Node 23.3.0 as base
FROM node:23.3.0-slim

WORKDIR /app

# Install required packages including curl for bun installation
RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    git \
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
COPY apps/eliza ./apps/eliza
COPY packages/db ./packages/db
COPY packages/utils ./packages/utils
COPY packages/circuits ./packages/circuits

# Install dependencies using bun (exactly as we do locally)
RUN bun install

# Build packages in the same order as our railway:build script
RUN bun run railway:build

# Set working directory to eliza app
WORKDIR /app/apps/eliza

# Use the same start command as in package.json
CMD ["node", "--experimental-modules", "--es-module-specifier-resolution=node", "dist/index.js"]