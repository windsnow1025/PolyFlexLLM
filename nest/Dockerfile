# https://pnpm.io/docker

FROM node:22-alpine AS base
ENV CI=true
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

FROM base AS build
COPY pnpm-lock.yaml /app
RUN pnpm fetch

COPY package.json pnpm-workspace.yaml /app/
RUN pnpm install --offline

COPY . /app
RUN pnpm run build

FROM base AS prod

COPY pnpm-lock.yaml /app
RUN pnpm fetch --prod

COPY package.json pnpm-workspace.yaml /app/
RUN pnpm install --offline --prod

FROM base
COPY --from=prod /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
COPY --from=build /app/package.json /app
EXPOSE 3000
CMD [ "node", "dist/src/main" ]
