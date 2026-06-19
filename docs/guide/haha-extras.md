# cc-haha 增强功能使用指南

本文档介绍三个新增好玩又实用的功能：

1. **MCP 工具市场一键接入**
2. **API 用量 / 成本仪表盘**
3. **会话版本控制**

---

## 1. MCP 工具市场一键接入

无需手动配置 `.mcp.json`，内置热门 MCP server 一键安装。

### 命令

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

### 内置服务

| 名称 | 类别 | 说明 |
|------|------|------|
| `filesystem` | Core | 文件读写访问 |
| `github` | Developer Tools | GitHub API 集成 |
| `git` | Developer Tools | Git 仓库检查 |
| `fetch` | Web | 网页抓取转 Markdown |
| `brave-search` | Web | Brave 搜索 |
| `memory` | Memory | 持久记忆图存储 |
| `sqlite` | Database | SQLite 安全访问 |
| `postgres` | Database | PostgreSQL 只读检查 |
| `puppeteer` | Browser | 浏览器自动化 |
| `sequentialthinking` | Productivity | 结构化思考工具 |
| `slack` | Communication | Slack 工作区集成 |
| `time` | Utility | 时间和时区转换 |

---

## 2. API 用量 / 成本仪表盘

在终端中以可视化方式查看当前会话的成本、token、时长等数据。

### 命令

```bash
# 终端仪表盘
/dashboard

# 同时生成 HTML 报告
/dashboard --html
```

### 示例输出

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
╚════════════════════════════════════════════════════════════╝

Usage by model:
Sonnet 4.6           ████████████████████ $0.1000 | 8.0k in / 4.0k out
Haiku 4.5            █████░░░░░░░░░░░░░░░ $0.0234 | 2.0k in / 1.0k out
```

---

## 3. 会话版本控制

像 git 一样给对话打 checkpoint、开分支、随时回退。

### 命令

```bash
# 保存当前对话状态
/checkpoint
/checkpoint before-big-refactor

# 列出所有 checkpoints
/checkpoint list

# 查看详情
/checkpoint info abc123

# 创建分支
/checkpoint branch feature-x

# 恢复到某个 checkpoint
/checkpoint checkout abc123
```

### 存储位置

Checkpoints 保存在 `~/.claude/session-checkpoints/<session-id>.json` 中，不会丢失。

---

## 组合使用示例

```bash
# 1. 安装需要的 MCP 工具
/mcp market install github
/mcp market install filesystem

# 2. 开始工作前保存一个 checkpoint
/checkpoint before-changes

# 3. 工作一段时间后查看成本
/dashboard

# 4. 如果想尝试不同方案，开分支
/checkpoint branch experiment-a

# 5. 不满意就切回之前的状态
/checkpoint checkout before-changes
```
