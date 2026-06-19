# cc-haha-neo 增强功能指南

本文档介绍 cc-haha-neo 在 Claude Code Haha 基础上新增的三个实用功能：

1. [MCP 工具市场一键接入](#1-mcp-工具市场一键接入)
2. [API 用量 / 成本仪表盘](#2-api-用量--成本仪表盘)
3. [会话版本控制](#3-会话版本控制)

---

## 1. MCP 工具市场一键接入

cc-haha-neo 内置 MCP Server Marketplace，无需手动编辑 `.mcp.json`，一条命令即可安装热门 MCP server。

### 命令速查

```bash
# 列出所有可安装的服务
/mcp market list

# 搜索服务
/mcp market search git

# 查看详情
/mcp market info github

# 一键安装
/mcp market install github

# 指定作用域和额外环境变量
/mcp market install filesystem -s local -e ALLOWED_PATHS=/home/user/project
```

### 参数说明

| 参数 | 说明 |
|------|------|
| `-s, --scope` | 配置作用域：`local`（默认）、`user`、`project` |
| `-e, --env` | 额外环境变量，格式 `KEY=value` |

### 内置服务列表

| 名称 | 类别 | 说明 | 必需环境变量 |
|------|------|------|--------------|
| `filesystem` | Core | 安全文件读写 | `ALLOWED_PATHS` |
| `github` | Developer Tools | GitHub API 集成 | `GITHUB_PERSONAL_ACCESS_TOKEN` |
| `git` | Developer Tools | Git 仓库检查 | 无 |
| `fetch` | Web | 网页抓取转 Markdown | 无 |
| `brave-search` | Web | Brave 搜索 | `BRAVE_API_KEY` |
| `memory` | Memory | 持久记忆图存储 | 无 |
| `sqlite` | Database | SQLite 安全访问 | 无 |
| `postgres` | Database | PostgreSQL 只读检查 | `DATABASE_URL` |
| `puppeteer` | Browser | 浏览器自动化 | 无 |
| `sequentialthinking` | Productivity | 结构化思考工具 | 无 |
| `slack` | Communication | Slack 工作区集成 | `SLACK_BOT_TOKEN`, `SLACK_TEAM_ID` |
| `time` | Utility | 时间和时区转换 | 无 |

### 安装示例

```bash
# 安装 GitHub MCP
export GITHUB_PERSONAL_ACCESS_TOKEN=ghp_xxx
/mcp market install github

# 安装文件系统 MCP，限制访问路径
/mcp market install filesystem -e ALLOWED_PATHS=/home/user/project

# 安装 Brave 搜索
export BRAVE_API_KEY=BSxxx
/mcp market install brave-search
```

### 自定义市场

内置市场写在 `src/services/mcp/market.ts` 的 `BUILTIN_MCP_MARKET` 数组中。你可以直接修改源码添加自己的 MCP server。

---

## 2. API 用量 / 成本仪表盘

`/dashboard` 命令提供当前会话的用量可视化，帮助实时掌握 API 成本和 token 消耗。

### 命令速查

```bash
/dashboard          # 终端仪表盘
/dashboard --html   # 同时生成 HTML 报告
```

### 终端输出示例

```
╔════════════════════════════════════════════════════════════╗
║              CLAUDE CODE USAGE DASHBOARD                   ║
╠════════════════════════════════════════════════════════════╣
║ Total cost:        $0.1234                                           ║
║ API duration:      45s                                               ║
║ Wall duration:     1m 0s                                             ║
║ Code changes:      120 added / 30 removed                            ║
║ Input tokens:      10.0k                                             ║
║ Output tokens:     5.0k                                              ║
║ Cache read:        2.0k                                              ║
║ Cache creation:    1.0k                                              ║
╚════════════════════════════════════════════════════════════╝

Usage by model:
Sonnet 4.6           ████████████████████ $0.1000 | 8.0k in / 4.0k out
Haiku 4.5            █████░░░░░░░░░░░░░░░ $0.0234 | 2.0k in / 1.0k out
```

### HTML 报告

`/dashboard --html` 会在系统临时目录生成一个独立的 HTML 文件，包含：

- 总成本、时长、token 数卡片
- 按模型成本条形图
- 模型用量明细表格

生成后命令会返回文件路径，直接用浏览器打开即可。

### 数据来源

仪表盘数据来自 `src/cost-tracker.ts` 中的 `getSessionUsageSnapshot()`，因此同时兼容：

- Anthropic 官方 API
- OpenAI 兼容 API
- Bedrock / Vertex / Azure 等第三方提供商

### 自定义

如需扩展仪表盘字段或样式，修改：

- `src/services/usage/dashboard.ts`：数据格式化和 HTML 生成
- `src/commands/dashboard/dashboard.ts`：命令入口

---

## 3. 会话版本控制

像 git 一样给对话打 checkpoint、创建分支、随时回退到任意状态。

### 命令速查

```bash
/checkpoint [name]              # 保存当前对话状态
/checkpoint list                # 列出所有 checkpoints
/checkpoint info <id>           # 查看详情
/checkpoint branch <name>       # 创建分支
/checkpoint checkout <id>       # 恢复到某个 checkpoint
```

### 使用示例

```bash
# 开始大重构前保存
/checkpoint before-refactor

# 尝试一个实验性方案
/checkpoint branch experiment-a

# 后悔了，回到之前
/checkpoint checkout before-refactor
```

### 数据存储

Checkpoints 保存在：

```
~/.claude/session-checkpoints/<session-id>.json
```

每个 checkpoint 包含：

- `id`：短 UUID
- `name`：自定义或自动生成名称
- `branch`：所属分支
- `createdAt`：创建时间
- `messageCount`：消息数量
- `messages`：完整消息快照

### 与源码的关系

- `src/services/session/versionControl.ts`：核心 API
- `src/commands/checkpoint/`：命令入口

---

## 组合工作流

```bash
# 1. 安装需要的 MCP 工具
/mcp market install github
/mcp market install filesystem -e ALLOWED_PATHS=/home/user/project

# 2. 工作前保存一个 checkpoint
/checkpoint before-changes

# 3. 工作一段时间后查看成本
/dashboard

# 4. 想尝试不同方案，开分支
/checkpoint branch experiment-a

# 5. 不满意就切回之前的状态
/checkpoint checkout before-changes
```

---

## 故障排查

### MCP 安装后未生效

- 检查环境变量是否已设置
- 使用 `/mcp info <name>` 查看配置
- 使用 `/mcp reconnect <name>` 重新连接

### 仪表盘显示 $0.00

- 某些第三方模型没有完整的价格映射
- 原项目的 `src/utils/modelCost.ts` 只维护了一部分模型价格
- 不影响实际 API 调用，只是成本估算不完整

### 会话 checkpoint 找不到

- 确认当前 session id 没有变化
- checkpoint 按 session id 存储，新会话看不到旧会话的 checkpoint
- 这是设计如此，避免跨会话污染
