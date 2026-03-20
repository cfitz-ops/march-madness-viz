#!/bin/bash
# deploy.sh — Fork Ghost DB and trigger Vercel rebuild
# Usage: ./deploy.sh
#
# Required environment variables (set in .env.local or export):
#   GHOST_PRIMARY_ID    - Primary Ghost DB service ID
#   VERCEL_DEPLOY_HOOK  - Vercel deploy hook URL
#   VERCEL_TOKEN        - Vercel API token (for env var updates)
#   VERCEL_PROJECT_ID   - Vercel project ID

set -euo pipefail

GHOST_CLI="${GHOST_CLI:-/Users/coreyfitz/.local/bin/ghost}"

echo "==> Forking Ghost DB..."
FORK_OUTPUT=$($GHOST_CLI fork "$GHOST_PRIMARY_ID")
FORK_CONNECTION_STRING=$(echo "$FORK_OUTPUT" | grep -oE 'postgresql://[^ ]+')

if [ -z "$FORK_CONNECTION_STRING" ]; then
  echo "ERROR: Could not extract connection string from fork output"
  echo "Raw output: $FORK_OUTPUT"
  exit 1
fi

echo "==> Updating Vercel environment variable..."
vercel env rm GHOST_CONNECTION_STRING production -y 2>/dev/null || true
echo "$FORK_CONNECTION_STRING" | vercel env add GHOST_CONNECTION_STRING production

echo "==> Triggering Vercel rebuild..."
curl -s -X POST "$VERCEL_DEPLOY_HOOK"

echo "==> Done. Vercel is rebuilding with the new fork."
