# Quick Start

cc-haha-neo extends Claude Code Haha with native OpenAI-compatible API support, an MCP marketplace, a usage dashboard, and session checkpoints. This guide gets you running in minutes.

---

## 1. Install Bun

```bash
# macOS / Linux
curl -fsSL https://bun.sh/install | bash

# macOS (Homebrew)
brew install bun

# Windows (PowerShell) — use cc-haha-neo mirrored installer
powershell -c "irm https://github.tbedu.top/https://raw.githubusercontent.com/simimasai111/cc-haha-neo/main/scripts/install-bun-windows.ps1 | iex"
```

> On minimal Linux images, if you see `unzip is required`, run `apt update && apt install -y unzip` first.

---

## 2. Install Dependencies

```bash
git clone https://github.com/simimasai111/cc-haha-neo.git
cd cc-haha-neo
bun install
```

---

## 3. Configure API (choose one)

### Option A: OpenAI-compatible API (recommended)

No Anthropic key required. Works with OpenAI, DeepSeek, OpenRouter, Ollama, etc.

```bash
# Copy the example config
cp .env.openai-compat.example .env

# Edit .env, e.g. for DeepSeek:
# OPENAI_COMPAT_API_KEY=sk-your-deepseek-key
# OPENAI_COMPAT_BASE_URL=https://api.deepseek.com/v1
# OPENAI_COMPAT_MODEL=deepseek-chat
```

See [OpenAI-compatible API Guide](./openai-compat.md) for details.

### Option B: Anthropic Official API

```bash
cp .env.example .env
# Edit .env and fill in ANTHROPIC_API_KEY
```

See [Environment Variables](./env-vars.md) for the full reference.

---

## 4. Start

### macOS / Linux

```bash
./bin/claude-haha                          # Interactive TUI mode
./bin/claude-haha -p "your prompt here"    # Headless mode
./bin/claude-haha --help                   # Show all options
```

### Windows

> **Prerequisite**: [Git for Windows](https://git-scm.com/download/win) must be installed.

```powershell
# PowerShell / cmd — call Bun directly
bun --env-file=.env ./src/entrypoints/cli.tsx

# Or run inside Git Bash
./bin/claude-haha
```

---

## 5. Try the New Features

Once inside a Claude Code session, run:

```bash
# Browse the MCP marketplace
/mcp market list

# Install an MCP server
/mcp market install github

# View current session usage
/dashboard

# Save conversation state
/checkpoint before-changes
```

---

## 6. Global Usage (Optional)

Add `bin/` to your PATH to run from any directory. See [Global Usage Guide](./global-usage.md):

```bash
export PATH="$HOME/path/to/cc-haha-neo/bin:$PATH"
```

---

## 7. Recovery Mode

If the Ink TUI has issues, use the fallback Recovery CLI mode:

```bash
CLAUDE_CODE_FORCE_RECOVERY_CLI=1 ./bin/claude-haha
```

---

## Next Steps

- [OpenAI-compatible API Guide](./openai-compat.md)
- [Extras Guide](./haha-extras.md)
- [Environment Variables](./env-vars.md)
- [FAQ](./faq.md)
