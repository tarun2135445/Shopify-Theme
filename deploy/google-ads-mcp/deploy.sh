#!/usr/bin/env bash
#
# Deploy the Google Ads MCP server to Google Cloud Run as a REMOTE
# (streamable-http) MCP server, then print the URL + OAuth redirect URI you
# need to add it to Claude as a custom Connector.
#
# Prerequisites:
#   - gcloud CLI installed and authenticated: `gcloud auth login`
#   - Billing enabled on the target Google Cloud project
#   - An OAuth 2.0 Client (Web application) created in that project
#     (Client ID + Secret). See docs/google-ads-mcp-remote-connector.md.
#   - A Google Ads API developer token.
#
# Usage:
#   GOOGLE_PROJECT_ID=my-proj \
#   GOOGLE_ADS_DEVELOPER_TOKEN=xxxx \
#   GOOGLE_ADS_MCP_OAUTH_CLIENT_ID=xxxx.apps.googleusercontent.com \
#   GOOGLE_ADS_MCP_OAUTH_CLIENT_SECRET=xxxx \
#   ./deploy.sh
#
# Optional:
#   REGION (default us-central1), SERVICE (default google-ads-mcp)

set -euo pipefail

REGION="${REGION:-us-central1}"
SERVICE="${SERVICE:-google-ads-mcp}"

require() {
  local name="$1"
  if [[ -z "${!name:-}" ]]; then
    echo "ERROR: environment variable '$name' is required." >&2
    exit 1
  fi
}

require GOOGLE_PROJECT_ID
require GOOGLE_ADS_DEVELOPER_TOKEN
require GOOGLE_ADS_MCP_OAUTH_CLIENT_ID
require GOOGLE_ADS_MCP_OAUTH_CLIENT_SECRET

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo ">> Setting active project: ${GOOGLE_PROJECT_ID}"
gcloud config set project "${GOOGLE_PROJECT_ID}" >/dev/null

echo ">> Enabling required APIs (run, cloudbuild, artifactregistry, googleads)"
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  googleads.googleapis.com

echo ">> Deploying ${SERVICE} to Cloud Run from source (${SCRIPT_DIR})"
# First pass: deploy. GOOGLE_ADS_MCP_BASE_URL is set in a second pass once the
# Cloud Run URL is known (chicken-and-egg: the URL is assigned on first deploy).
gcloud run deploy "${SERVICE}" \
  --source "${SCRIPT_DIR}" \
  --platform managed \
  --region "${REGION}" \
  --allow-unauthenticated \
  --set-env-vars="GOOGLE_PROJECT_ID=${GOOGLE_PROJECT_ID},GOOGLE_ADS_DEVELOPER_TOKEN=${GOOGLE_ADS_DEVELOPER_TOKEN},GOOGLE_ADS_MCP_OAUTH_CLIENT_ID=${GOOGLE_ADS_MCP_OAUTH_CLIENT_ID},GOOGLE_ADS_MCP_OAUTH_CLIENT_SECRET=${GOOGLE_ADS_MCP_OAUTH_CLIENT_SECRET},FASTMCP_HOST=0.0.0.0"

URL="$(gcloud run services describe "${SERVICE}" --region "${REGION}" --format='value(status.url)')"

echo ">> Setting GOOGLE_ADS_MCP_BASE_URL=${URL} and redeploying env"
gcloud run services update "${SERVICE}" \
  --region "${REGION}" \
  --update-env-vars="GOOGLE_ADS_MCP_BASE_URL=${URL}"

cat <<EOF

============================================================
 Deployed.

 MCP endpoint (use this as the custom Connector URL in Claude):
   ${URL}/mcp

 Add this EXACT redirect URI to your OAuth 2.0 Client in
 Google Cloud Console -> APIs & Services -> Credentials:
   ${URL}/auth/callback

 Then in Claude: Settings -> Connectors -> Add custom connector
 -> paste ${URL}/mcp -> authenticate with Google when prompted.
============================================================
EOF
