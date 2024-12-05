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

# Create necessary directories
RUN mkdir -p packages/api packages/db packages/utils packages/circuits

# Copy root workspace files
COPY ../../package.json /app/
COPY ../../bun.lockb /app/
COPY ../../turbo.json /app/
COPY ../../tsconfig.json /app/

# Copy required packages
COPY . /app/packages/api/
COPY ../db/ /app/packages/db/
COPY ../utils/ /app/packages/utils/
COPY ../circuits/ /app/packages/circuits/

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