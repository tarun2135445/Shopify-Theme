# Google Ads MCP Server

This repo registers the official [Google Ads MCP server](https://github.com/googleads/google-ads-mcp)
for Claude Code via [`.mcp.json`](../.mcp.json). It exposes Google Ads tooling
(reporting, account/campaign data via GAQL, etc.) to Claude.

## How it's wired

The server is run on demand with `uvx` straight from the upstream Git repo — no
pre-install step is required:

```bash
uvx --from git+https://github.com/googleads/google-ads-mcp.git google-ads-mcp
```

> The upstream README documents `pipx`. `uvx` (from [uv](https://docs.astral.sh/uv/))
> is the functional equivalent and is what this config uses. If you prefer `pipx`,
> swap the `command`/`args` in `.mcp.json` for
> `pipx run --spec git+https://github.com/googleads/google-ads-mcp.git google-ads-mcp`.

Credentials are referenced as environment variables in `.mcp.json` (`${VAR:-}`),
so **no secrets are committed**. You provide the values in whatever environment
runs Claude Code.

## Required configuration

Set these before starting Claude Code (e.g. in your shell profile or the
environment's variables):

| Variable | Required | Purpose |
| --- | --- | --- |
| `GOOGLE_PROJECT_ID` | yes | Google Cloud project ID with the Google Ads API enabled |
| `GOOGLE_ADS_DEVELOPER_TOKEN` | yes | Google Ads API developer token (needs Explorer/production access) |
| `GOOGLE_APPLICATION_CREDENTIALS` | for ADC auth | Path to a service-account / ADC credentials JSON file |
| `GOOGLE_ADS_LOGIN_CUSTOMER_ID` | optional | Manager (MCC) account customer ID, if accessing accounts via a manager |

### Authentication options

1. **Application Default Credentials (ADC)** — set `GOOGLE_APPLICATION_CREDENTIALS`
   to the path of your credentials JSON (used by the committed config).
2. **OAuth proxy** — instead of `GOOGLE_APPLICATION_CREDENTIALS`, set
   `GOOGLE_ADS_MCP_OAUTH_CLIENT_ID` and `GOOGLE_ADS_MCP_OAUTH_CLIENT_SECRET`
   (and optionally `GOOGLE_ADS_MCP_BASE_URL`, default `http://localhost:8080`).
   To use this path, add those vars to the `env` block in `.mcp.json`.

## Setup checklist

1. Enable the Google Ads API in your Google Cloud project.
2. Obtain a Google Ads API developer token with the required access level.
3. Create credentials (service account / ADC JSON, or OAuth client).
4. Export the environment variables above.
5. Start Claude Code in this repo and approve the `google-ads` MCP server when prompted.

## Verify

```bash
# Sanity check that the server builds and launches (Ctrl-C to stop):
uvx --from git+https://github.com/googleads/google-ads-mcp.git google-ads-mcp
```

In Claude Code, `/mcp` lists registered servers and their connection status.
