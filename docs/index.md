---
layout: home

hero:
  name: cc-haha-neo
  text: 更开放的 Claude Code
  tagline: 原生 OpenAI 兼容 API + MCP 工具市场 + 用量仪表盘 + 会话版本控制
  image:
    src: /images/logo-horizontal.png
    alt: cc-haha-neo
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/quick-start
    - theme: alt
      text: OpenAI 兼容 API
      link: /guide/openai-compat
    - theme: alt
      text: GitHub
      link: https://github.com/simimasai111/cc-haha-neo

features:
  - icon: "🔌"
    title: 原生 OpenAI 兼容 API
    details: 在 fetch 层透明转换 Anthropic 协议，支持 OpenAI / DeepSeek / OpenRouter / Ollama / Azure 等任意兼容端点
    link: /guide/openai-compat
  - icon: "🛒"
    title: MCP 工具市场
    details: 内置 12+ 热门 MCP server，GitHub、Filesystem、Brave Search、PostgreSQL 等一键安装
    link: /guide/haha-extras#mcp-工具市场一键接入
  - icon: "📊"
    title: 用量 / 成本仪表盘
    details: 终端可视化 + HTML 报告，实时掌握当前会话成本、token、时长和代码改动
    link: /guide/haha-extras#api-用量--成本仪表盘
  - icon: "🌿"
    title: 会话版本控制
    details: 像 git 一样给对话打 checkpoint、开分支、随时 checkout 回退
    link: /guide/haha-extras#会话版本控制
  - icon: "🖥"
    title: 完整 TUI 交互
    details: 与官方 Claude Code 一致的 Ink 终端界面，支持 --print 无头模式
  - icon: "🧠"
    title: 记忆系统
    details: 跨会话持久化记忆，自动提取、智能检索、AutoDream 做梦整合
    link: /memory/
  - icon: "🤖"
    title: 多 Agent 系统
    details: 多代理编排、并行任务执行、Teams 协作、Worktree 隔离
    link: /agent/
  - icon: "🧩"
    title: Skills 系统
    details: 可扩展能力插件、自定义工作流、条件激活
    link: /skills/01-usage-guide
  - icon: "💬"
    title: IM 接入
    details: 在桌面端 webapp 配置 Telegram / 飞书，并通过独立 adapter 进程远程对话 Claude Code
    link: /im/
  - icon: "🐍"
    title: Computer Use
    details: 桌面控制功能 — 截屏、鼠标、键盘操作（Python Bridge 实现）
    link: /features/computer-use
  - icon: "🖥"
    title: 桌面端
    details: 基于 Electron + React 的图形化客户端，多标签、多会话、IM 适配器接入，支持 macOS、Windows 和 Linux
    link: /desktop/
---
