#!/usr/bin/env sh

node migrations/migrate.js

npm run start:prod
