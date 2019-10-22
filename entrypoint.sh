#!/bin/sh
DEFAULT_DESIGN=zazuko
EDITOR_STYLE="${EDITOR_STYLE:-$DEFAULT_DESIGN}"

node setup/migrate
echo "STARTING EDITOR WITH DESIGN $EDITOR_STYLE"
ln -s .nuxt_$EDITOR_STYLE .nuxt_original
node setup/replace-vars
exec npm start
