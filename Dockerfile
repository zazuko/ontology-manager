FROM node:12-alpine as base

ARG SENTRY_DSN
ARG CUSTOMER_NAME
ARG SENTRY_AUTH_TOKEN
ARG SENTRY_URL
ARG SENTRY_ORG
ARG SENTRY_PROJECT

RUN apk add --no-cache bash python3 make g++ git
RUN npm install -g npm@6.13.7

WORKDIR /app
COPY package.json package-lock.json ./

ENV CYPRESS_INSTALL_BINARY=0
RUN npm ci

ENV NODE_ENV=production

COPY . .

ENV BUILDING_WITHOUT_PG_ACCESS=yes
RUN bash /app/build.sh

FROM node:12-alpine
RUN npm install -g npm@6.13.7

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --production --no-optional

COPY . .

COPY --from=base /app/artifacts/ ./artifacts

ENV NODE_ENV=production
ENV NUXT_HOST=0.0.0.0

CMD ./entrypoint.sh
