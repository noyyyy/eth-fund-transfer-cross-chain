FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace config files
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./

# Copy server files
COPY packages/server ./packages/server

# Install dependencies and build
RUN pnpm install --frozen-lockfile && \
    cd packages/server && \
    npx prisma generate && \
    pnpm build

WORKDIR /app/packages/server

# Expose the port the app runs on
EXPOSE 5001

# Set environment variables
ENV NODE_ENV=production

# Start the application
CMD ["node", "dist/main"]

