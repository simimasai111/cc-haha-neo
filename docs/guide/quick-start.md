# 快速开始

cc-haha-neo 在 Claude Code Haha 的基础上增加了原生 OpenAI 兼容 API、MCP 工具市场、用量仪表盘和会话版本控制。本指南带你最快跑起来。

---

## 1. 安装 Bun

```bash
# macOS / Linux
curl -fsSL https://bun.sh/install | bash

# macOS (Homebrew)
brew install bun

# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"
```

> 精简版 Linux 如提示 `unzip is required`，先运行 `apt update && apt install -y unzip`

---

## 2. 安装依赖

```bash
git clone https://github.com/simimasai111/cc-haha-neo.git
cd cc-haha-neo
bun install
```

---

## 3. 配置 API（二选一）

### 方式 A：OpenAI 兼容 API（推荐）

无需 Anthropic Key，直接对接 OpenAI、DeepSeek、OpenRouter 等。

```bash
# 复制示例配置文件
cp .env.openai-compat.example .env

# 编辑 .env，例如使用 DeepSeek：
# OPENAI_COMPAT_API_KEY=sk-your-deepseek-key
# OPENAI_COMPAT_BASE_URL=https://api.deepseek.com/v1
# OPENAI_COMPAT_MODEL=deepseek-chat
```

完整环境变量说明见 [OpenAI 兼容 API 指南](./openai-compat.md)。

### 方式 B：Anthropic 官方 API

```bash
cp .env.example .env
# 编辑 .env 填入 ANTHROPIC_API_KEY
```

完整环境变量说明见 [环境变量配置](./env-vars.md)。

---

## 4. 启动

### macOS / Linux

```bash
./bin/claude-haha                          # 交互 TUI 模式
./bin/claude-haha -p "your prompt here"    # 无头模式
./bin/claude-haha --help                   # 查看所有选项
```

### Windows

> **前置要求**：必须安装 [Git for Windows](https://git-scm.com/download/win)

```powershell
# PowerShell / cmd 直接调用 Bun
bun --env-file=.env ./src/entrypoints/cli.tsx

# 或在 Git Bash 中运行
./bin/claude-haha
```

---

## 5. 试试新功能

启动后，在 Claude Code 会话中输入：

```bash
# 查看 MCP 市场
/mcp market list

# 安装一个 MCP 工具
/mcp market install github

# 查看当前会话用量
/dashboard

# 保存对话状态
/checkpoint before-changes
```

---

## 6. 全局使用（可选）

将 `bin/` 加入 PATH 后可在任意目录启动，详见 [全局使用指南](./global-usage.md)：

```bash
export PATH="$HOME/path/to/cc-haha-neo/bin:$PATH"
```

---

## 7. 降级模式

如果 Ink TUI 出现问题，可以使用降级 Recovery CLI 模式：

```bash
CLAUDE_CODE_FORCE_RECOVERY_CLI=1 ./bin/claude-haha
```

---

## 下一步

- [OpenAI 兼容 API 配置](./openai-compat.md)
- [增强功能指南](./haha-extras.md)
- [环境变量参考](./env-vars.md)
- [常见问题](./faq.md)
