# ==================================
# DYGSOM Fraud Dashboard - Dockerfile
# ==================================
# Multi-stage build for production-ready Next.js app

# ----------------------------------
# Stage 1: Dependencies
# ----------------------------------
FROM node:20-alpine AS deps
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# ----------------------------------
# Stage 2: Builder
# ----------------------------------
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies)
RUN npm ci

# Copy source code
COPY . .

# Set build-time environment variables for production
ARG NEXT_PUBLIC_API_BASE_URL=https://api.dygsom.pe
ARG NEXT_PUBLIC_APP_NAME="DYGSOM Fraud Dashboard"
ARG NEXT_PUBLIC_APP_VERSION=1.0.0
ARG NEXT_PUBLIC_ENVIRONMENT=production
ARG NEXT_PUBLIC_API_TIMEOUT=30000
ARG NEXT_PUBLIC_TOKEN_STORAGE_KEY=dygsom_auth_token
ARG NEXT_PUBLIC_TOKEN_EXPIRY_HOURS=24
ARG NEXT_PUBLIC_ENABLE_ANALYTICS=true
ARG NEXT_PUBLIC_ENABLE_LOGGING=true
ARG NEXT_PUBLIC_LOG_LEVEL=info
ARG NEXT_PUBLIC_LOG_TO_CONSOLE=false
ARG NEXT_PUBLIC_ITEMS_PER_PAGE=20
ARG NEXT_PUBLIC_CHART_REFRESH_INTERVAL=30

# CRITICAL: Set ALL environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME
ENV NEXT_PUBLIC_APP_VERSION=$NEXT_PUBLIC_APP_VERSION
ENV NEXT_PUBLIC_ENVIRONMENT=$NEXT_PUBLIC_ENVIRONMENT
ENV NEXT_PUBLIC_API_TIMEOUT=$NEXT_PUBLIC_API_TIMEOUT
ENV NEXT_PUBLIC_TOKEN_STORAGE_KEY=$NEXT_PUBLIC_TOKEN_STORAGE_KEY
ENV NEXT_PUBLIC_TOKEN_EXPIRY_HOURS=$NEXT_PUBLIC_TOKEN_EXPIRY_HOURS
ENV NEXT_PUBLIC_ENABLE_ANALYTICS=$NEXT_PUBLIC_ENABLE_ANALYTICS
ENV NEXT_PUBLIC_ENABLE_LOGGING=$NEXT_PUBLIC_ENABLE_LOGGING
ENV NEXT_PUBLIC_LOG_LEVEL=$NEXT_PUBLIC_LOG_LEVEL
ENV NEXT_PUBLIC_LOG_TO_CONSOLE=$NEXT_PUBLIC_LOG_TO_CONSOLE
ENV NEXT_PUBLIC_ITEMS_PER_PAGE=$NEXT_PUBLIC_ITEMS_PER_PAGE
ENV NEXT_PUBLIC_CHART_REFRESH_INTERVAL=$NEXT_PUBLIC_CHART_REFRESH_INTERVAL

# Build Next.js application
RUN npm run build

# ----------------------------------
# Stage 3: Runner
# ----------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public

# Copy the standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set correct permissions
RUN chown -R nextjs:nodejs /app

# Set port
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start Next.js - Use the server.js from standalone output
CMD ["node", "./server.js"]
