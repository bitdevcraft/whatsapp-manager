# syntax=docker.io/docker/dockerfile:1

FROM node:24-alpine AS base

RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@10.12.1 --activate

WORKDIR /app

FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY apps/whatsapp-service/package.json ./apps/whatsapp-service/package.json
COPY packages/auth/package.json ./packages/auth/package.json
COPY packages/db/package.json ./packages/db/package.json
COPY packages/eslint-config/package.json ./packages/eslint-config/package.json
COPY packages/meta-ads-api/package.json ./packages/meta-ads-api/package.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/typescript-config/package.json ./packages/typescript-config/package.json
COPY packages/ui/package.json ./packages/ui/package.json
COPY packages/wa-cloud-api/package.json ./packages/wa-cloud-api/package.json

RUN pnpm install --frozen-lockfile

FROM base AS builder

ARG BASE_URL=http://localhost:3001
ARG NEXT_PUBLIC_FACEBOOK_APP_ID=build-time-facebook-app-id
ARG NEXT_PUBLIC_FACEBOOK_CONFIG_ID=build-time-facebook-config-id
ARG NEXT_PUBLIC_WEB_URL=http://localhost:3001
ARG NEXT_PUBLIC_WEB_SOCKET=http://localhost:3001

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build-time values baked into the Next.js bundle.
ENV BASE_URL=${BASE_URL}
ENV NEXT_PUBLIC_FACEBOOK_APP_ID=${NEXT_PUBLIC_FACEBOOK_APP_ID}
ENV NEXT_PUBLIC_FACEBOOK_CONFIG_ID=${NEXT_PUBLIC_FACEBOOK_CONFIG_ID}
ENV NEXT_PUBLIC_WEB_URL=${NEXT_PUBLIC_WEB_URL}
ENV NEXT_PUBLIC_WEB_SOCKET=${NEXT_PUBLIC_WEB_SOCKET}

# Build-time placeholders required by Next.js page-data collection.
ENV WEB_SOCKET=http://localhost:4000
ENV ENCRYPTION_KEY=build-time-encryption-key
ENV DATABASE_URL=postgresql://app_user:app_user@localhost:5432/app_db
ENV REDIS_HOST=localhost
ENV REDIS_PORT=6379
ENV WHATSAPP_API_ACCESS_TOKEN=build-time-whatsapp-token
ENV WHATSAPP_PHONE_NUMBER_ID=1234567890
ENV WHATSAPP_BUSINESS_ACCOUNT_ID=1234567890
ENV WHATSAPP_WEBHOOK_SECRET=build-time-webhook-secret
ENV WHATSAPP_API_VERSION=v22.0
ENV M4D_APP_ID=build-time-meta-app-id
ENV META_CLIENT_SECRET=build-time-meta-client-secret
ENV META_BUSINESS_ID=1234567890
ENV STRIPE_SECRET_KEY=sk_test_build_time
ENV STRIPE_WEBHOOK_SECRET=whsec_build_time
ENV AUTH_SECRET=build-time-auth-secret
ENV DEBUG=false
ENV AWS_REGION=us-east-1
ENV AWS_BUCKET_NAME=build-time-bucket
ENV AWS_ACCESS_KEY_ID=build-time-access-key
ENV AWS_SECRET_ACCESS_KEY=build-time-secret-key
ENV RESEND_API_KEY=re_build_time

COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.json ./
COPY apps ./apps
COPY packages ./packages

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @workspace/wa-cloud-api build:pkg
RUN pnpm --filter @workspace/shared build:pkg
RUN pnpm --filter @workspace/db exec tsup
RUN pnpm --filter @workspace/auth build:pkg
RUN pnpm --filter web build

FROM base AS runner

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3001
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs

EXPOSE 3001

CMD ["node", "apps/web/server.js"]
