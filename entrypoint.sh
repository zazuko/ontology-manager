#!/bin/sh

node setup/migrate
node setup/replace-vars
exec npm start
