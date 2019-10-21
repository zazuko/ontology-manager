FROM node:12-alpine as base

ARG SENTRY_DSN
ARG CUSTOMER_NAME
ARG SENTRY_AUTH_TOKEN
ARG SENTRY_URL
ARG SENTRY_ORG
ARG SENTRY_PROJECT

WORKDIR /app
COPY package.json package-lock.json ./

ENV CYPRESS_INSTALL_BINARY=0
RUN npm ci

ENV NODE_ENV=production

COPY . .

ENV BUILDING_WITHOUT_PG_ACCESS=yes
RUN npm run build -- --modern=server
# delete source maps for client
RUN rm .nuxt/dist/client/*.map

FROM node:12-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --production

COPY . .

COPY --from=base /app/.nuxt/ ./nuxt_original

ENV NODE_ENV=production
ENV NUXT_HOST=0.0.0.0

CMD ./entrypoint.sh
