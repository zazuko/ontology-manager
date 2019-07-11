#!/bin/sh

if [ "$1" == "migrate" ]; then
  node setup/migrate
fi

node setup/replace-vars
eval npm start
