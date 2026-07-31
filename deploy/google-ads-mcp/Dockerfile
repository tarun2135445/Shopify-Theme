# Builds a self-contained image of the official Google Ads MCP server,
# installed straight from the upstream Git repo, for hosting as a REMOTE
# (streamable-http) MCP server — e.g. on Google Cloud Run — so it can be
# added to Claude as an account-level custom Connector.
#
# In remote mode the server is triggered by the presence of the OAuth env
# vars (GOOGLE_ADS_MCP_OAUTH_CLIENT_ID/_SECRET); it then listens on
# 0.0.0.0:$PORT and exposes the MCP endpoint at /mcp. Cloud Run injects $PORT.

FROM python:3.11-slim

# Bring in the uv package manager (used to install the project + deps fast).
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Install the published server from upstream. Pin to a tag/commit for repeatable
# builds if you prefer (e.g. ...google-ads-mcp.git@<commit>).
RUN uv pip install --system "git+https://github.com/googleads/google-ads-mcp.git"

# Cloud Run sets $PORT (default 8080); the server reads it and binds 0.0.0.0.
EXPOSE 8080

CMD ["google-ads-mcp"]
