# OpenAI 兼容 API 使用指南

cc-haha-neo 内置原生 OpenAI 兼容 API 支持，无需额外代理（如 LiteLLM）即可直接对接 OpenAI、DeepSeek、OpenRouter、Ollama 等任意 OpenAI 兼容服务。

## 原理

```
Claude Code CLI ──Anthropic Messages──▶  fetch 拦截层
                                          │
                                          ▼
                                   Anthropic ↔ OpenAI 转换
                                          │
                                          ▼
                                OpenAI Chat Completions ──▶ 目标 API
```

代码在 `src/services/openaiCompat/fetch.ts` 中拦截 Anthropic Messages API 请求，调用已有的代理转换层：

- `anthropicToOpenaiChat`：把 Anthropic 请求体转成 OpenAI Chat Completions 格式
- `openaiChatStreamToAnthropic`：把 OpenAI SSE 流转回 Anthropic SSE 格式

因此对上层代码完全透明，Claude Code SDK 以为自己在和 Anthropic 对话。

## 快速开始

### 使用 OpenAI 官方 API

```bash
export OPENAI_COMPAT_API_KEY=sk-your-openai-key
export OPENAI_COMPAT_MODEL=gpt-4o
./bin/claude-haha
```

### 使用 DeepSeek

```bash
export OPENAI_COMPAT_API_KEY=sk-your-deepseek-key
export OPENAI_COMPAT_BASE_URL=https://api.deepseek.com/v1
export OPENAI_COMPAT_MODEL=deepseek-chat
./bin/claude-haha
```

### 使用 OpenRouter

```bash
export OPENAI_COMPAT_API_KEY=sk-or-v1-your-key
export OPENAI_COMPAT_BASE_URL=https://openrouter.ai/api/v1
export OPENAI_COMPAT_MODEL=openai/gpt-4o
./bin/claude-haha
```

### 使用本地 Ollama

```bash
export OPENAI_COMPAT_API_KEY=ollama
export OPENAI_COMPAT_BASE_URL=http://localhost:11434/v1
export OPENAI_COMPAT_MODEL=llama3.1
./bin/claude-haha
```

## 环境变量

| 变量 | 必填 | 说明 |
|------|------|------|
| `OPENAI_COMPAT_API_KEY` | 是 | OpenAI 兼容 API 的 Key |
| `OPENAI_COMPAT_BASE_URL` | 否 | 基础 URL，默认 `https://api.openai.com/v1` |
| `OPENAI_COMPAT_MODEL` | 否 | 指定模型名称，默认使用原 Anthropic 模型名 |
| `OPENAI_API_KEY` | 备选 | 可作为 `OPENAI_COMPAT_API_KEY` 的别名 |

> 如果没有设置 `OPENAI_COMPAT_API_KEY`，系统会按 `OPENAI_API_KEY` → `ANTHROPIC_AUTH_TOKEN` → `ANTHROPIC_API_KEY` 的顺序尝试获取 Key。

## 支持的提供商

| 提供商 | 配置示例 |
|--------|----------|
| **OpenAI** | `OPENAI_COMPAT_API_KEY=sk-xxx` |
| **DeepSeek** | `OPENAI_COMPAT_API_KEY=sk-xxx`<br>`OPENAI_COMPAT_BASE_URL=https://api.deepseek.com/v1`<br>`OPENAI_COMPAT_MODEL=deepseek-chat` |
| **OpenRouter** | `OPENAI_COMPAT_API_KEY=sk-or-v1-xxx`<br>`OPENAI_COMPAT_BASE_URL=https://openrouter.ai/api/v1` |
| **Ollama** | `OPENAI_COMPAT_API_KEY=ollama`<br>`OPENAI_COMPAT_BASE_URL=http://localhost:11434/v1` |
| **Azure OpenAI** | `OPENAI_COMPAT_API_KEY=your-azure-key`<br>`OPENAI_COMPAT_BASE_URL=https://your-resource.openai.azure.com/openai/deployments/your-deployment` |
| **任意兼容服务** | 设置对应的 `BASE_URL` 和 `API_KEY` 即可 |

## 模型映射

默认情况下，系统会把 Anthropic 模型名直接透传给 OpenAI 兼容端点。如果目标服务不支持，可通过 `OPENAI_COMPAT_MODEL` 强制覆盖。

```bash
# 所有请求都使用 gpt-4o-mini
export OPENAI_COMPAT_MODEL=gpt-4o-mini
```

## 与现有配置的关系

| 配置 | 优先级 | 说明 |
|------|--------|------|
| 云服务开关（Bedrock/Vertex/Foundry/Azure） | 最高 | 显式启用时优先使用 |
| OpenAI OAuth（Codex） | 中高 | `OPENAI_CODEX_CLIENT_ID` 等 |
| OpenAI 兼容模式 | 中 | `OPENAI_COMPAT_API_KEY` |
| Anthropic 官方 | 低 | 默认 |

## 注意事项

1. **工具调用兼容性**：大部分 OpenAI 兼容服务支持 function calling，但某些本地模型可能不支持。
2. **Thinking/Reasoning**：Anthropic 的 thinking 参数会被转换，非所有模型支持。
3. **Prompt Caching**：OpenAI 兼容 API 不支持 Anthropic 的 prompt caching，相关参数会被自动丢弃。
4. **Beta 特性**：Anthropic 专有 beta 特性在第三方模型上不可用。

## 故障排查

### 请求返回 401

检查 `OPENAI_COMPAT_API_KEY` 是否正确设置。

### 模型不存在错误

设置 `OPENAI_COMPAT_MODEL` 为目标服务支持的模型名称。

### 工具调用失败

某些 OpenAI 兼容服务对 tools 格式要求严格。确保使用能力较强的模型。

### 查看调试日志

```bash
DEBUG=1 ./bin/claude-haha
```

## 相关文件

- `src/services/openaiCompat/fetch.ts`：核心拦截与转换逻辑
- `src/services/api/client.ts`：注入 OpenAI 兼容 fetch
- `src/utils/model/providers.ts`：provider 识别
- `src/services/openaiCompat/fetch.test.ts`：单元测试
