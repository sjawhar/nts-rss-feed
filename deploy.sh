#!/bin/sh
set -e

docker-compose run --rm generator
git add feed.xml
git commit -m "Update feed.xml"
git push
