#!/bin/bash
set -euo pipefail

node setup/migrate.js

if [ ! -f .built ]; then
  npm run build && touch .built
fi

npm run start
