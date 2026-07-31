# Google Ads MCP as a Claude account-level Connector

The committed [`.mcp.json`](../.mcp.json) registers the Google Ads MCP server as a
**local (stdio) server for Claude Code**. That kind of server runs inside the
Claude Code execution environment and shows up under `/mcp` in Claude Code — it
does **not** appear in the claude.ai **Connectors** settings page.

To make it appear in the **Connectors** section (an account-level custom
connector), the server must run as a **remote HTTP server on a public HTTPS URL**
with OAuth. This guide deploys it to **Google Cloud Run** and adds it to Claude.

> Requires a Claude plan that supports custom connectors (Pro/Max/Team/Enterprise),
> and a Google Cloud project with billing enabled.

## How the remote mode works

When `GOOGLE_ADS_MCP_OAUTH_CLIENT_ID` and `GOOGLE_ADS_MCP_OAUTH_CLIENT_SECRET`
are set, the server automatically switches from `stdio` to `streamable-http`,
binds `0.0.0.0:$PORT`, and serves the MCP endpoint at **`/mcp`**. It uses
FastMCP's Google OAuth proxy, so each user logs in with Google (scopes include
`https://www.googleapis.com/auth/adwords`). The OAuth callback path is
**`/auth/callback`**.

## Step 0 — Prerequisites

1. **Google Ads developer token** — Google Ads UI → Tools → API Center.
   (A fresh token only sees *test* accounts until Google grants Basic access.)
2. **Google Cloud project** with billing, and the **Google Ads API enabled**.
3. **`gcloud` CLI** installed and authenticated (`gcloud auth login`).

## Step 1 — Create an OAuth 2.0 Client

In Google Cloud Console → **APIs & Services**:

1. **OAuth consent screen**: configure it (External is fine), and under
   *Data access / scopes* add `.../auth/adwords`, `userinfo.email`,
   `userinfo.profile`, `openid`. If the app is in "Testing", add your Google
   account under **Test users**.
2. **Credentials → Create credentials → OAuth client ID → Web application**.
   Save the **Client ID** and **Client secret**.
   - You'll add the redirect URI in Step 3 (you need the Cloud Run URL first).

## Step 2 — Deploy to Cloud Run

From this repo:

```bash
GOOGLE_PROJECT_ID=your-gcp-project \
GOOGLE_ADS_DEVELOPER_TOKEN=your-developer-token \
GOOGLE_ADS_MCP_OAUTH_CLIENT_ID=xxxx.apps.googleusercontent.com \
GOOGLE_ADS_MCP_OAUTH_CLIENT_SECRET=your-client-secret \
./deploy/google-ads-mcp/deploy.sh
```

The script enables the needed APIs, builds the [Dockerfile](../deploy/google-ads-mcp/Dockerfile)
(which installs the server from the upstream repo), deploys to Cloud Run, then
sets `GOOGLE_ADS_MCP_BASE_URL` to the assigned URL. It prints:

- the **connector URL**: `https://<service>-<hash>-<region>.run.app/mcp`
- the **redirect URI** to register: `https://<...>.run.app/auth/callback`

> Prefer the manual commands? See the upstream README "Deployment to Google Cloud
> Platform" section — `gcloud builds submit` + `gcloud run deploy` with
> `--set-env-vars=...,FASTMCP_HOST=0.0.0.0`.

## Step 3 — Register the redirect URI

Back in **Credentials → your OAuth client → Authorized redirect URIs**, add the
exact callback URL the script printed:

```
https://<your-cloud-run-url>.run.app/auth/callback
```

Save. (Without this, the OAuth login will fail with a redirect_uri mismatch.)

## Step 4 — Add the custom Connector in Claude

1. claude.ai → **Settings → Connectors → Add custom connector**.
2. Paste the **`/mcp`** URL: `https://<your-cloud-run-url>.run.app/mcp`.
3. Save, then **Connect / authenticate** — you'll be sent through Google sign-in
   (the OAuth proxy). Approve the requested Google Ads scope.
4. The `google-ads` tools are now available in your Claude chats.

## Security notes

- The service is deployed `--allow-unauthenticated` at the network layer, but the
  MCP layer is protected by the OAuth proxy — callers must complete Google login.
- Anyone you let authenticate can query Google Ads data the developer token +
  their Google account can reach. Restrict OAuth consent-screen test users (or
  publish carefully) accordingly.
- Consider pinning the Dockerfile install to a specific upstream commit for
  reproducible builds.

## Cost / teardown

Cloud Run scales to zero when idle, so cost is minimal. To remove everything:

```bash
gcloud run services delete google-ads-mcp --region us-central1
```
