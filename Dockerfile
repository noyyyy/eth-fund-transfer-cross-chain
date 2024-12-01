# Build stage
FROM node:20-alpine AS builder

WORKDIR /app/packages/server

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace config files
COPY pnpm-workspace.yaml /app/
COPY pnpm-lock.yaml /app/
COPY package.json /app/

# Copy package files
COPY packages/server/package.json ./
COPY packages/server/prisma ./prisma/

# Install dependencies
RUN cd /app && pnpm install --frozen-lockfile

# Copy source code
COPY packages/server .

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN pnpm build

# Production stage
FROM node:20-alpine

WORKDIR /app/packages/server

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy necessary files from builder
COPY --from=builder /app/packages/server/dist ./dist
COPY --from=builder /app/packages/server/node_modules ./node_modules
COPY --from=builder /app/packages/server/package.json ./
COPY --from=builder /app/packages/server/prisma ./prisma

# Expose the port the app runs on
EXPOSE 5001

# Set environment variables
ENV NODE_ENV=production

# Start the application
CMD ["node", "dist/main"]

