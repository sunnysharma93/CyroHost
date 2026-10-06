#!/bin/sh
# Replace the running images, then confirm health. On failure, restore the previous image tags.
# This script does not delete volumes and does not print the server .env file.
set -eu

BACKEND_IMAGE=${1:?backend image required}
FRONTEND_IMAGE=${2:?frontend image required}
ROOT=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
cd "$ROOT"

if [ ! -f .env ]; then
  echo "Missing $ROOT/.env. Create it on the server before the first deploy." >&2
  exit 1
fi

cp -p .env .env.previous-images

set_kv() {
  key=$1
  value=$2
  tmp=.env.tmp.$$
  awk -v k="$key" -v v="$value" '
    BEGIN { found = 0 }
    index($0, k "=") == 1 { print k "=" v; found = 1; next }
    { print }
    END { if (!found) print k "=" v }
  ' .env > "$tmp"
  mv "$tmp" .env
}

set_kv CYROHOST_BACKEND_IMAGE "$BACKEND_IMAGE"
set_kv CYROHOST_FRONTEND_IMAGE "$FRONTEND_IMAGE"

backend_port=$(awk -F= '$1=="BACKEND_PUBLISH_PORT" {print $2}' .env)
frontend_port=$(awk -F= '$1=="FRONTEND_PUBLISH_PORT" {print $2}' .env)
[ -n "$backend_port" ] || backend_port=8080
[ -n "$frontend_port" ] || frontend_port=3000

restore() {
  cp -p .env.previous-images .env
  docker compose -f docker-compose.prod.yml up -d --remove-orphans --no-build || true
}

if ! docker compose -f docker-compose.prod.yml pull; then
  echo "Image pull failed. The previous containers were left in place." >&2
  cp -p .env.previous-images .env
  exit 1
fi
if ! docker compose -f docker-compose.prod.yml up -d --remove-orphans --no-build; then
  echo "The new containers did not start. Restoring the previous image tags." >&2
  restore
  exit 1
fi

i=0
while [ "$i" -lt 30 ]; do
  if curl -fsS "http://127.0.0.1:${backend_port}/actuator/health/readiness" >/dev/null \
    && curl -fsS "http://127.0.0.1:${frontend_port}/" >/dev/null; then
    echo "CyroHost is responding."
    exit 0
  fi
  i=$((i + 1))
  sleep 2
done

echo "Health check failed. Restoring the previous image tags." >&2
cp -p .env.previous-images .env
docker compose -f docker-compose.prod.yml up -d --remove-orphans --no-build || true
exit 1
