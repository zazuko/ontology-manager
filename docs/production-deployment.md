---
title: Deployment
nav_order: 250
has_children: false
has_toc: true
---

# Deployment

The Ontology Manager is typically deployed using Docker. For testing it can also be deployed locally.

Run an editor container with the following environment variables:
```sh
# customer namespace
## this should be a slug, so no space, no special characters etc
CUSTOMER_NAME=zazuko

# postgres config
POSTGRESQL_USER=postgres
POSTGRESQL_PASSWORD=make-this-secret
POSTGRESQL_DATABASE=postgres
POSTGRESQL_HOST=localhost

# secret seed for JWT - https://www.graphile.org/postgraphile/security/
POSTGRAPHILE_TOKEN_SECRET=this-is-secret-as-well

OAUTH_HOST=https://github.com/login/oauth
OAUTH_CLIENT_ID=
OAUTH_CLIENT_SECRET=
GITHUB_PERSONAL_ACCESS_TOKEN=

# optional variables
DEBUG=editor:*
# SENTRY_DSN=
```

Without further customization, the default theme will be used. You can set the theme used by the Ontology Manager at runtime using the following environment variable: `EDITOR_THEME=zazuko`. Valid values for `EDITOR_THEME` are any folder name in [`./assets/themes/`](./assets/themes/) that have a `theme.scss` in it.

### Local Deployment

Do this when you want to test the app locally under production settings, especially useful to test the initial setup / editor installation process.

1. Create an OAuth app: <https://github.com/settings/applications/new> using Homepage / Callback : `http://localhost:8000/`
    * only do this once and keep the `Client ID` and `Client Secret`, reusing these values works well.
1. Shut down the database and delete its content:
    * `make reset`
1. Build the local image:
    * `docker-compose build`
1. Start the local containers: (alternative: `make localup`)
    * `docker-compose up -d`
    * `docker-compose logs -f app nginx`
1. Go to <http://localhost:8000/install> (simple) or better yet: set `testdomain.com` to `127.0.0.1` in your hosts file and go to <http://testdomain.com:8000/install>

### Prod Deployment

Two containers: Postgres (probably already running to host other customers' editors) and the editor container.

The editor container needs the following env vars:

```sh
# customer name is a slug, schema-alod-ch, zazuko, dcf-org, …
CUSTOMER_NAME=zazuko
# This password needs to match the one set on the postgres container
POSTGRESQL_PASSWORD=make-this-secret
# `containername` if postgres is linked with the name `containername`
POSTGRESQL_HOST=db
# a token used as hash/salt, keep it secret for JWT security
POSTGRAPHILE_TOKEN_SECRET=this-is-secret-as-well
```

That's it. The remaining configuration is done using the installer (navigate to the container's `/install` once it's up).

#### healthcheck endpoint

`GET /api/health` should return HTTP200 with content `ok` as plain text.
