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
COPY ../../package.json /app/
COPY ../../bun.lockb /app/
COPY ../../tsconfig.json /app/

# Copy package.json files
COPY . /app/packages/api/
COPY ../db/package.json /app/packages/db/
COPY ../utils/package.json /app/packages/utils/

# Install dependencies
RUN bun install

# Copy source code
COPY ../db /app/packages/db/
COPY ../utils /app/packages/utils/

# Build packages
RUN cd /app/packages/db && bun run build
RUN cd /app/packages/utils && bun run build
RUN cd /app/packages/api && bun run build

# Set working directory to api package
WORKDIR /app/packages/api

# Start the API
CMD ["bun", "run", "start"] 