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

ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.json ./
COPY apps ./apps
COPY packages ./packages

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @workspace/wa-cloud-api build
RUN pnpm --filter @workspace/shared build
RUN pnpm --filter @workspace/db exec tsup
RUN pnpm --filter whatsapp-service build
RUN pnpm --filter whatsapp-service deploy --prod /prod/whatsapp-service

FROM node:24-alpine AS runner

ENV NODE_ENV=production
ENV PORT=4000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

WORKDIR /app

COPY --from=builder --chown=nextjs:nodejs /prod/whatsapp-service ./

USER nextjs

EXPOSE 4000

CMD ["node", "dist/index.js"]
