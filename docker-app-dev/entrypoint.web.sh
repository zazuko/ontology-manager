#!/bin/bash
set -euo pipefail

export NODE_ENV=production

node setup/migrate.js

# # npm run dev
# if [ ! -f .built ]; then
#   # npm run build -- --modern=server
#   npm run build

#   touch .built
# fi

npm run prod
