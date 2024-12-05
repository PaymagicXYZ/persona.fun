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

# Create workspace structure
RUN mkdir -p packages/api packages/db packages/utils

# Copy root workspace files
COPY ../../package.json ./
COPY ../../bun.lockb ./
COPY ../../tsconfig.json ./

# Copy package files
COPY . ./packages/api/
COPY ../db/package.json ./packages/db/
COPY ../utils/package.json ./packages/utils/

# Install dependencies
RUN bun install

# Copy source code
COPY ../db/src ./packages/db/src
COPY ../utils/src ./packages/utils/src

# Build packages
RUN cd packages/db && bun run build
RUN cd packages/utils && bun run build
RUN cd packages/api && bun run build

# Set working directory to api package
WORKDIR /app/packages/api

# Start the API
CMD ["bun", "run", "start"] 