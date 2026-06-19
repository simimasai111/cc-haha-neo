# cc-haha-neo Extras

This guide covers the three main enhancements added on top of Claude Code Haha:

1. [MCP Marketplace](#1-mcp-marketplace)
2. [Usage & Cost Dashboard](#2-usage--cost-dashboard)
3. [Session Version Control](#3-session-version-control)

---

## 1. MCP Marketplace

Install popular MCP servers without manually editing `.mcp.json`.

```bash
/mcp market list
/mcp market search git
/mcp market info github
/mcp market install github
/mcp market install filesystem -s local -e ALLOWED_PATHS=/home/user/project
```

### Built-in servers

| Name | Category | Required env |
|------|----------|--------------|
| `filesystem` | Core | `ALLOWED_PATHS` |
| `github` | Developer Tools | `GITHUB_PERSONAL_ACCESS_TOKEN` |
| `git` | Developer Tools | None |
| `fetch` | Web | None |
| `brave-search` | Web | `BRAVE_API_KEY` |
| `memory` | Memory | None |
| `sqlite` | Database | None |
| `postgres` | Database | `DATABASE_URL` |
| `puppeteer` | Browser | None |
| `sequentialthinking` | Productivity | None |
| `slack` | Communication | `SLACK_BOT_TOKEN`, `SLACK_TEAM_ID` |
| `time` | Utility | None |

---

## 2. Usage & Cost Dashboard

```bash
/dashboard          # terminal dashboard
/dashboard --html   # also generate an HTML report
```

The dashboard shows:

- Total cost and API/wall duration
- Input/output/cache tokens
- Code changes (lines added/removed)
- Cost breakdown by model

---

## 3. Session Version Control

Save and restore conversation snapshots.

```bash
/checkpoint [name]              # save current conversation
/checkpoint list                # list checkpoints
/checkpoint info <id>           # show checkpoint details
/checkpoint branch <name>       # create a branch
/checkpoint checkout <id>       # restore a checkpoint
```

Checkpoints are stored in `~/.claude/session-checkpoints/<session-id>.json`.

---

## Combined workflow

```bash
/mcp market install github
/checkpoint before-changes
/dashboard
/checkpoint branch experiment-a
/checkpoint checkout before-changes
```
