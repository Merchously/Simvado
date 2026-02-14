#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma db push --skip-generate --accept-data-loss 2>&1 || echo "Migration warning: will retry on next restart"

echo "Starting application..."
exec node server.js
