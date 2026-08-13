# Changelog
All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Integrated official Stripe MCP server into `.kilo/kilo.json`
  - Injected `@stripe/mcp-server` under `mcpServers` block via `npx`
  - Secured API authentication using `env:STRIPE_SECRET_KEY` mapping to prevent token leaks
  - Verified configuration schema syntax compliance using `review_code.py`
- Enabled Stripe Analyst agent (`stripe_sync_agent.py`) to leverage native protocol schemas for real-time balance queries and customer record reconciliation.

### Fixed
- Stabilized environment path routing across isolated Python 3.9/3.10 worktree dependencies.
