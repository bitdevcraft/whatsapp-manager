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
COPY packages ./packages

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @workspace/wa-cloud-api build:pkg

FROM base AS runner

ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/packages/db ./packages/db
COPY --from=builder /app/packages/wa-cloud-api/package.json ./packages/wa-cloud-api/package.json
COPY --from=builder /app/packages/wa-cloud-api/dist ./packages/wa-cloud-api/dist

CMD ["pnpm", "--filter", "@workspace/db", "db:migrate:deploy"]
