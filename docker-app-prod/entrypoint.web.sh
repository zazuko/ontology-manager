#!/bin/bash
set -euo pipefail

node migrations/migrate.js

npm run start
