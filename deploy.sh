#!/bin/sh
set -e

docker-compose run --rm generator
git add feed.xml fixed-links.json
git commit -m "Update feed.xml"
git push
