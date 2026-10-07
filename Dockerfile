# Multi-stage Dockerfile for AetherOS (OpenDots) Sovereign Node
FROM node:22-alpine AS builder

WORKDIR /app

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy monorepo manifests
COPY package.json pnpm-workspace.yaml tsconfig.json vitest.workspace.ts ./
COPY packages/types/package.json ./packages/types/
COPY packages/core/package.json ./packages/core/
COPY packages/sandbox/package.json ./packages/sandbox/
COPY packages/gateway/package.json ./packages/gateway/
COPY packages/protocol/package.json ./packages/protocol/
COPY packages/memory/package.json ./packages/memory/
COPY packages/skills/package.json ./packages/skills/
COPY packages/cli/package.json ./packages/cli/
COPY packages/web/package.json ./packages/web/

# Install dependencies
RUN pnpm install --frozen-lockfile || pnpm install

# Copy source code
COPY packages/ ./packages/

# Build all packages
RUN pnpm run build

# Runner stage
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4099

RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy built artifacts from builder
COPY --from=builder /app ./

EXPOSE 4099 3000

# Default entrypoint launches AetherOS sovereign daemon
CMD ["node", "packages/cli/bin/aether.js", "start", "4099"]
