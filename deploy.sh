#!/bin/sh
set -e

docker-compose run --rm generator
git add rss.xml
git commit -m "Update rss.xml"
git push
