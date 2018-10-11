#!/usr/bin/env sh
set -euo pipefail

node migrations/migrate.js

npm run start:prod
