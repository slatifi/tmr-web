FROM node:24-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS deps
WORKDIR /usr/src/app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY /packages/shared-types/package.json ./packages/shared-types/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile


FROM base AS builder
WORKDIR /usr/src/app
COPY --from=deps /usr/src/app /usr/src/app
COPY . /usr/src/app
RUN find . -path './apps/*/.env' -type f -delete
RUN pnpm run -r build
RUN pnpm deploy --filter=web --prod /prod/web
RUN pnpm deploy --filter=api --prod /prod/api


FROM base AS web
COPY --from=builder /prod/web /usr/src/app
WORKDIR /usr/src/app
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "build"]


FROM base AS api
COPY --from=builder /prod/api /usr/src/app
WORKDIR /usr/src/app
# install openssl, set permissions, generate prisma client
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y openssl
RUN chmod +x ./entrypoint.sh
RUN pnpx prisma generate client
EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]
