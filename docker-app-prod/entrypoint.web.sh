#!/usr/bin/env sh
node migrations/migrate.js

service nginx start && \
npm run start:prod
