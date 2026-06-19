# cc-haha-neo

<p align="center">
  <img src="docs/images/app-icon.png" alt="cc-haha-neo" width="180">
</p>

<div align="center">

[![License](https://img.shields.io/github/license/simimasai111/cc-haha-neo)](https://github.com/simimasai111/cc-haha-neo/blob/main/LICENSE)
[![OpenAI Compatible](https://img.shields.io/badge/OpenAI-Compatible-412991?style=flat&logo=openai)](docs/guide/openai-compat.md)
[![MCP Market](https://img.shields.io/badge/MCP-Marketplace-FF6F00?style=flat)](docs/guide/haha-extras.md#mcp-工具市场一键接入)

</div>

**cc-haha-neo** 是基于 [Claude Code Haha](https://github.com/NanmiCoder/cc-haha) 的魔改版本，核心目标是让 Claude Code 更加开放、可扩展、可观测：

- ✅ **原生 OpenAI 兼容 API**：无需代理，直接对接 OpenAI / DeepSeek / OpenRouter / Ollama / Azure 等任意兼容服务。
- ✅ **MCP 工具市场**：内置 12+ 热门 MCP server，一条命令即可安装。
- ✅ **API 用量 / 成本仪表盘**：终端可视化 + HTML 报告，实时掌握花了多少、用了多少 token。
- ✅ **会话版本控制**：给对话打 checkpoint、开分支、随时 checkout 回退。

> 原项目是基于 2026-03-31 从 Anthropic npm registry 泄露的 Claude Code 源码修复而来。本仓库在此基础上做二次增强，仅供学习研究。

---

## 快速开始

### 1. 克隆并安装

```bash
git clone https://github.com/simimasai111/cc-haha-neo.git
cd cc-haha-neo
bun install
```

### 2. 配置 OpenAI 兼容 API（推荐）

```bash
# 使用 OpenAI 官方
cp .env.openai-compat.example .env
# 编辑 .env，填入 OPENAI_COMPAT_API_KEY 等信息
```

### 3. 启动

```bash
./bin/claude-haha
```

---

## 核心功能

### 🔌 OpenAI 兼容 API

在 `fetch` 层拦截 Anthropic Messages 请求，自动转换为 OpenAI Chat Completions 格式，并把响应转回 Anthropic 格式。上层代码完全无感知。

```bash
# 使用 DeepSeek
export OPENAI_COMPAT_API_KEY=sk-your-deepseek-key
export OPENAI_COMPAT_BASE_URL=https://api.deepseek.com/v1
export OPENAI_COMPAT_MODEL=deepseek-chat

./bin/claude-haha
```

更多配置见 [OpenAI 兼容 API 指南](docs/guide/openai-compat.md)。

### 🛒 MCP 工具市场

无需手动写 `.mcp.json`，热门 MCP server 一键接入。

```bash
/mcp market list
/mcp market install github
/mcp market install filesystem -e ALLOWED_PATHS=/home/user/project
```

内置服务包括：GitHub、Filesystem、Brave Search、PostgreSQL、SQLite、Puppeteer、Slack、Memory、Sequential Thinking 等。

详见 [增强功能指南](docs/guide/haha-extras.md)。

### 📊 API 用量 / 成本仪表盘

实时查看当前会话的成本、token、时长、代码改动。

```bash
/dashboard          # 终端可视化
/dashboard --html   # 同时生成 HTML 报告
```

### 🌿 会话版本控制

像 git 一样管理对话状态。

```bash
/checkpoint before-big-refactor
/checkpoint list
/checkpoint branch experiment-a
/checkpoint checkout abc123
```

---

## 文档导航

| 文档 | 说明 |
|------|------|
| [OpenAI 兼容 API 指南](docs/guide/openai-compat.md) | 如何接入 OpenAI / DeepSeek / OpenRouter / Ollama 等 |
| [增强功能指南](docs/guide/haha-extras.md) | MCP 市场、仪表盘、会话版本控制完整用法 |
| [环境变量](docs/guide/env-vars.md) | 完整环境变量参考 |
| [第三方模型](docs/guide/third-party-models.md) | 原项目的第三方模型接入方式 |
| [桌面端](docs/desktop/) | Electron 桌面客户端文档 |
| [常见问题](docs/guide/faq.md) | 常见错误排查 |
| [CHANGELOG](CHANGELOG.md) | 版本更新记录 |

---

## 技术栈

| 类别 | 技术 |
|------|------|
| 语言 | TypeScript |
| 运行时 | [Bun](https://bun.sh) |
| 终端 UI | React + [Ink](https://github.com/vadimdemedes/ink) |
| 桌面 APP | Electron + React + Vite |
| CLI 解析 | Commander.js |
| 协议 | Anthropic Messages / OpenAI Chat Completions / MCP / LSP |

---

## 与原仓库的关系

```
NanmiCoder/cc-haha  ──▶  simimasai111/cc-haha-neo
                              + OpenAI-compatible adapter
                              + MCP marketplace
                              + Usage dashboard
                              + Session checkpoints
```

本仓库会保持原项目主体功能不变，仅在 CLI 增强层做加法，方便随时同步上游更新。

---

## Disclaimer

本仓库基于 2026-03-31 从 Anthropic npm registry 泄露的 Claude Code 源码。所有原始源码版权归 [Anthropic](https://www.anthropic.com) 所有。本项目仅供学习和研究用途，请勿用于商业或违反 Anthropic 服务条款的场景。
