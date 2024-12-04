FROM oven/bun:latest

WORKDIR /app

# Copy package files
COPY package.json bun.lockb turbo.json ./
COPY apps/eliza/package.json ./apps/eliza/
COPY packages/db/package.json ./packages/db/
COPY packages/utils/package.json ./packages/utils/

# Install dependencies
RUN bun install

# Copy source code
COPY packages/db ./packages/db
COPY packages/utils ./packages/utils
COPY apps/eliza ./apps/eliza

# Build packages
RUN bun run build

# Set working directory to eliza app
WORKDIR /app/apps/eliza

# Start the server
CMD ["bun", "run", "dev"] 