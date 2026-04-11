#!/bin/sh
set -e
# Prefer versioned migrations when present (commit prisma/migrations in git).
if [ -f prisma/migrations/migration_lock.toml ]; then
  npx prisma migrate deploy
else
  echo "api: no prisma/migrations — applying schema with db push (add migrations with: prisma migrate dev)"
  npx prisma db push
fi
exec npx ts-node --project tsconfig.app.json index.ts
