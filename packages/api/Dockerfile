# Use Node 23.3.0 as base (keeping consistent with eliza)
FROM node:23.3.0-slim

WORKDIR /app

# Install required packages
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
COPY ../../package.json .
COPY ../../bun.lockb .
COPY ../../turbo.json .
COPY ../../tsconfig.json .

# Copy required packages
COPY . ./packages/api
COPY ../db ./packages/db
COPY ../utils ./packages/utils
COPY ../circuits ./packages/circuits

# Install dependencies
RUN bun install

# Build packages
RUN cd packages/db && bun run build
RUN cd packages/utils && bun run build
RUN cd packages/api && bun run build

# Set working directory to api package
WORKDIR /app/packages/api

# Expose the port your API runs on
EXPOSE 3000

# Start the API
CMD ["bun", "run", "start"] 