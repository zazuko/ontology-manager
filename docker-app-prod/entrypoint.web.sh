#!/bin/bash
set -euo pipefail

node setup/migrate.js

npm run build

npm run start
