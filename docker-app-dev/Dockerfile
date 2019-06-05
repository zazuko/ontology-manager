FROM node:12-stretch as build-stage
RUN npm install --global npm@6.9.0

ENV NODE_ENV=production
ENV BUILDING_WITHOUT_PG_ACCESS=yes

ARG CUSTOMER_NAME
ARG POSTGRESQL_PASSWORD
ARG POSTGRESQL_HOST
ARG POSTGRESQL_ROLE_POSTGRAPHILE_PASSWORD
ARG POSTGRAPHILE_TOKEN_SECRET
ARG DEBUG

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app/
RUN node -v && npm -v && npm ci --production

# Build app
RUN npm run build -- --modern=server

ENV BUILDING_WITHOUT_PG_ACCESS=
ENV HOST 0.0.0.0
EXPOSE 3000

ENTRYPOINT [ "/usr/src/app/docker-app-dev/entrypoint.web.sh"]
