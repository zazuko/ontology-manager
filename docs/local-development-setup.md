---
title: Local Development Setup
nav_order: 200
has_children: false
has_toc: true
---

# Local Development Setup

**Trifid doesn't support Node >12, for this reason the Ontology Manager requires Node 12.**

Requirements: you will need Docker and [docker-compose](https://docs.docker.com/compose/).

The schema/vocabulary/ontology itself is stored as [N-Triples](https://en.wikipedia.org/wiki/N-Triples) in a [GitHub](https://github.com/) repository. OAuth credentials & a Personal Access Token are required to set up the Ontology Manager.

The development setup lets you run a local instance of the ontology manager that connects to a remote GitHub repository. It is the best way to develop.

## 1. Get OAuth Credentials

1. Create an OAuth app: <https://github.com/settings/applications/new>
1. Homepage / Callback : `http://localhost:3000/`

(Keep these values, you can always reuse them locally.)

## 2. Get a Personal Access Token

1. Generate a token (Scopes `repo, user:email`): <https://github.com/settings/tokens/new>

(Keep this value, you can always reuse it locally.)

## 3. Fill in Env Vars

1. Copy the example env file [`./.env.example`](./.env.example) to [`./.env`](./.env):
    `cp .env.example .env`
2. Set variables `OAUTH_` and `GITHUB_` to the values from step 1. resp. 2.

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

**Note:** some of these env vars will be used to create a postgres database for your project and set it up with the correct
roles etc. Some others will be inserted into this database as initial config in `editor_schema.config`.  
For this reason, if during development you need to change one of these values: `OAUTH_CLIENT_ID`, `OAUTH_CLIENT_SECRET`, `GITHUB_PERSONAL_ACCESS_TOKEN` without having access to the admin panel, deleting the database is the easiest option: `make reset up`.

## 4. Run the Dev Server

1. `npm ci`
1. Run the project:
    * Database:
        * `make up` (If the database is booting up for the first time, you'll see migrations being retried until DB is up and they get applied.)
    * Dev server + watch: `npm run dev`

Whenever you feel like it:

* Deleting the DB to start over:
    * `make reset`
