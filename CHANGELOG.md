# Changelog

## [Unreleased]

### Added

- **OpenAI-compatible API adapter**: Intercept Anthropic Messages API requests at the fetch layer and transparently convert them to OpenAI Chat Completions format. Supports OpenAI, DeepSeek, OpenRouter, Ollama, Azure OpenAI, and any other compatible endpoint.
- **MCP Marketplace**: Built-in registry of 12+ popular MCP servers. Install tools like GitHub, Filesystem, Brave Search, PostgreSQL, SQLite, Puppeteer, Slack, Memory, and Sequential Thinking with a single command.
- **Usage & cost dashboard**: New `/dashboard` command displays a terminal-based usage summary and can export a standalone HTML report.
- **Session version control**: New `/checkpoint` command family for saving, branching, listing, and restoring conversation snapshots.
- Tests for all new modules: OpenAI-compatible fetch, MCP market, usage dashboard, and session checkpoints.
- New documentation: `docs/guide/openai-compat.md`, `docs/guide/haha-extras.md`, and `.env.openai-compat.example`.

### Changed

- Rewrote `README.md` to focus on cc-haha-neo enhancements and quick-start guides.

### Notes

- This fork keeps the original Claude Code Haha core unchanged and adds features only at the CLI/service layer, making it easier to sync upstream updates.
