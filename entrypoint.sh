#!/bin/sh
DEFAULT_THEME=zazuko
EDITOR_THEME="${EDITOR_THEME:-$DEFAULT_THEME}"

node setup/migrate
echo "STARTING EDITOR WITH THEME $EDITOR_THEME"
cp -r artifacts/nuxt_$EDITOR_THEME nuxt_original
node setup/replace-vars
exec npm start
