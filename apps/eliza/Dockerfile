FROM oven/bun:1.0.25 as builder

WORKDIR /app

# Set platform for native dependencies
ENV PLATFORM=linux
ENV ARCH=x64

# First, copy the root workspace files
COPY package.json bun.lockb turbo.json ./
COPY apps/eliza/package.json ./apps/eliza/
COPY packages/db/package.json ./packages/db/
COPY packages/utils/package.json ./packages/utils/
COPY packages/circuits/package.json ./packages/circuits/

# Install dependencies with platform-specific flags
RUN bun install --platform=linux --arch=x64

# Copy source code
COPY packages/db ./packages/db
COPY packages/utils ./packages/utils
COPY packages/circuits ./packages/circuits
COPY apps/eliza ./apps/eliza

# Build the eliza app
WORKDIR /app/apps/eliza
RUN bun run build

# Production image
FROM oven/bun:1.0.25

WORKDIR /app

# Copy built files and dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/eliza ./apps/eliza

WORKDIR /app/apps/eliza

# Start the server
CMD ["bun", "run", "dev"]