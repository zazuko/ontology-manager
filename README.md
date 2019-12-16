# Zazuko Ontology Manager

This is the open source repository of the [Zazuko Ontology Manager](https://zazuko.com/products/ontology-manager/). From our product page:

> The Zazuko Ontology Manager (ZOM) is a web application for serving, browsing and modeling RDF Schemas and Ontologies. It supports the full process of creating, publishing and extending an ontology. ZOM's user interface has been designed for teams of domain specialists working jointly on an ontology. No specific ontology modeling knowledge is required to use the editor. ZOM leverages GitHub to store the ontology, but carefully hides the complexity of serializing the schema into RDF triples from users of the editor.
> 
> We believe creating, editing, evolving an ontology is easiest done using a collaborative web platform designed specifically for this use case, allowing all actors to reach consensus gradually, using asynchronous proposals, discussions and votes.

Please consult the [product page](https://zazuko.com/products/ontology-manager/) & [this blog post](https://zazuko.com/blog/schema-manager-oss/) for details.


## Local Development Setup

The schema/vocabulary/ontology itself is stored as [N-Triples](https://en.wikipedia.org/wiki/N-Triples) in a [GitHub](https://github.com/) repository. OAuth credentials & a Personal Access Token are required to set up the Ontology Manager.

See [Architecture](#Architecture) for other requirements. 

### 1. Get OAuth Credentials

1. Create an OAuth app: <https://github.com/settings/applications/new>
1. Homepage / Callback : `http://localhost:3000/`

(Keep these values, you can always reuse them locally.)

### 2. Get a Personal Access Token

1. Generate a token (Scopes `repo, user:email`): <https://github.com/settings/tokens/new>

(Keep this value, you can always reuse it locally.)

### 3. Fill in Env Vars

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

### 4. Run the Dev Server

1. `npm install`
1. Run the project:
    * Database:
        * `make up` (If the database is booting up for the first time, you'll see migrations being retried until DB is up and they get applied.)
    * Dev server + watch: `npm run dev`

Whenever you feel like it:

* Deleting the DB to start over:
    * `make reset`

## Deployment

Run an editor container with the above env variables.

Extra runtime environment variable: `EDITOR_THEME=zazuko`. Valid values for `EDITOR_THEME` are any folder name in [`./assets/themes/`](./assets/themes/) that have a `theme.scss` in it.

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

## Tests

### 1 End-to-End

1. Run `npm run e2e:server`
2. When it's up, start `npm run e2e:open`

## Architecture

### Two Services

1. A Postgres Database
1. A web backend made of:
    * A Nuxt app, using Apollo as GraphQL client
    * A Nuxt Server Middleware that is trifid-core
    * A Nuxt Server Middleware implemented as an Express API
        * This is where the forge-specific functionality (GitHub, GitLab, …) is implemented
        * Configurable via `nuxt.config.js`
    * A Nuxt Server Middleware serving a GraphQL API backed by Postgres, schema generated by introspecting the pg schema

## Concepts and Implementation Overview

### Trifid

The [Trifid](https://github.com/zazuko/trifid-core) middleware is used to allow ontology content dereferencing, meaning that if `http://your.editor.com/schema/SomeObject` is an IRI in your ontology, you will be able to get N-Triples via content negotiation: `curl http://your.editor.com/schema/SomeObject -H 'Accept: application/n-triples'`.

### Proposals

* `thread.headline`: the PR title and proposal title used in proposals lists
    * Sample value: `Change property 'wheelCount'`
* `thread.iri`: the IRI of the object from which the proposal originated
    * Sample value: `http://example.com/schema/wheelCount`
* `thread.body`: the motivation for this proposal
    * Sample value: `wheelCount currently has no type although it should be an integer`
* `thread.thread_type`:
    * Value: `proposal`
* `thread.status`: a new proposal is always `open`, admins can then set it to one of: `resolved`, `rejected`, `hidden`
    * Sample value: `open`
* `thread.is_draft`: `TRUE` until the proposal author submits their proposal
    * Sample value: `FALSE`
* `thread.proposal_object`: the actual proposal content in a serialized format, cf. [`proposalSerializer`](https://github.com/zazuko/ontology-manager/blob/8097185ca9eabc34a70b9c78ec8c2c321abdee6a/plugins/libs/proposals.js#L114-L116) and [`proposalDeserializer`](https://github.com/zazuko/ontology-manager/blob/8097185ca9eabc34a70b9c78ec8c2c321abdee6a/plugins/libs/proposals.js#L118-L125)
* `thread.branch_name`:
    * Sample value: `2019-03-12T140521.151Z`

Proposals are handled by one of these two store modules depending on their type:

* [`store/class.js`](./store/class.js)
* [`store/prop.js`](./store/prop.js)

These store modules are responsible for loading a proposal from the DB, saving a proposal to the DB, etc.

### Threads

* A thread can either be a `discussion` or a `proposal`.
* A thread with `discussion` type is a conversation, messages belong to a thread.

## Resources

- https://github.com/Akryum/vue-apollo/blob/master/tests/demo/src/components/ChannelView.vue
- https://github.com/Akryum/vue-apollo/tree/master/tests/demo/src/graphql


## Helpful Tools

- Vue devtools extension [Chrome, Firefox](https://github.com/vuejs/vue-devtools#installation)
- Local GraphQL IDE: [Graph*i*QL `http://localhost:3000/graphiql`](http://localhost:3000/graphiql) (only available in dev mode)
- A postgres client (e.g. [Postico](https://eggerapps.at/postico/) for MacOS) to inspect schemas and data

## FAQ

### How to wipe a customer DB?

For customer `example_com`:
```sql
drop database example_com_db;
drop role example_com_role_postgraphile;
drop role example_com_role_anonymous;
drop role example_com_role_person;
```

### How to create a new theme?

To create a new theme, simply copy an existing theme and modify it:

1. `cp -r assets/themes/zazuko assets/themes/your-theme`
1. The scss main file/entrypoint is: `assets/themes/your-theme/theme.scss`
1. Configure nuxt to use your theme: `{ lang: 'scss', src: '@/assets/themes/your-theme/theme.scss' }` instead of `{ lang: 'scss', src: '@/assets/themes/zazuko/theme.scss' }`


## References

* GraphQL: https://graphql.org/learn/
* Postgraphile: https://www.graphile.org/postgraphile/introduction/
* Nuxt: https://nuxtjs.org/guide/installation
    * Apollo: https://github.com/nuxt-community/apollo-module
    * Auth: https://auth.nuxtjs.org/

## License

This software is released under the [GNU Affero General Public License](https://www.gnu.org/licenses/agpl-3.0.html), see [LICENSE](LICENSE) for details.
