#!/bin/sh
set -e

docker-compose run --rm generator

read -p "Commit and push? " commit

if [ "${commit}" = "y" ]; then
  git add -p
  git commit -m "Update feed.xml"
  git push
fi
