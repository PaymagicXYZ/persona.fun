FROM oven/bun:1.0.25

WORKDIR /app

# First, copy the root workspace files
COPY ../../package.json ../../bun.lockb ../../turbo.json ./

# Create necessary directories
RUN mkdir -p apps/eliza packages/db packages/utils packages/circuits

# Copy package files
COPY ./package.json ./apps/eliza/
COPY ../../packages/db/package.json ./packages/db/
COPY ../../packages/utils/package.json ./packages/utils/
COPY ../../packages/circuits/package.json ./packages/circuits/

# Install dependencies
RUN bun install

# Copy source code
COPY ../../packages/db ./packages/db
COPY ../../packages/utils ./packages/utils
COPY ../../packages/circuits ./packages/circuits
COPY ./ ./apps/eliza

# Build packages
RUN bun run build

# Set working directory to eliza app
WORKDIR /app/apps/eliza

# Start the server
CMD ["bun", "run", "dev"]