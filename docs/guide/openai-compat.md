# OpenAI 兼容 API 使用指南

本项目已内置 OpenAI 兼容格式支持，无需额外代理（如 LiteLLM）即可直接对接 OpenAI、DeepSeek、OpenRouter、Ollama 等任意 OpenAI 兼容 API。

## 原理

```
claude-code-haha ──Anthropic协议──▶ 内置转换层 ──OpenAI Chat Completions──▶ 目标 API
                                    (Anthropic↔OpenAI)
```

代码在 `fetch` 层面拦截 Anthropic Messages API 请求，自动转换为 OpenAI Chat Completions 格式，并将响应转回 Anthropic 格式。对上层代码完全透明。

## 快速开始

### 1. 配置环境变量

```bash
# 使用 OpenAI 官方 API
export OPENAI_COMPAT_API_KEY=sk-your-openai-key

# 或使用 DeepSeek
export OPENAI_COMPAT_API_KEY=sk-your-deepseek-key
export OPENAI_COMPAT_BASE_URL=https://api.deepseek.com/v1
export OPENAI_COMPAT_MODEL=deepseek-chat

# 或使用 OpenRouter
export OPENAI_COMPAT_API_KEY=sk-or-v1-your-key
export OPENAI_COMPAT_BASE_URL=https://openrouter.ai/api/v1
export OPENAI_COMPAT_MODEL=openai/gpt-4o
```

### 2. 启动

```bash
./bin/claude-haha
```

## 环境变量说明

| 变量 | 必填 | 说明 |
|------|------|------|
| `OPENAI_COMPAT_API_KEY` | 是 | OpenAI 兼容 API 的 Key |
| `OPENAI_COMPAT_BASE_URL` | 否 | 基础 URL，默认 `https://api.openai.com/v1` |
| `OPENAI_COMPAT_MODEL` | 否 | 指定模型名称，默认使用原 Anthropic 模型名 |
| `OPENAI_API_KEY` | 备选 | 可作为 `OPENAI_COMPAT_API_KEY` 的别名 |

## 支持的提供商

| 提供商 | 配置示例 |
|--------|----------|
| **OpenAI** | `OPENAI_COMPAT_API_KEY=sk-xxx` |
| **DeepSeek** | `OPENAI_COMPAT_API_KEY=sk-xxx`<br>`OPENAI_COMPAT_BASE_URL=https://api.deepseek.com/v1`<br>`OPENAI_COMPAT_MODEL=deepseek-chat` |
| **OpenRouter** | `OPENAI_COMPAT_API_KEY=sk-or-v1-xxx`<br>`OPENAI_COMPAT_BASE_URL=https://openrouter.ai/api/v1` |
| **Ollama** | `OPENAI_COMPAT_API_KEY=ollama`<br>`OPENAI_COMPAT_BASE_URL=http://localhost:11434/v1` |
| **Azure OpenAI** | `OPENAI_COMPAT_API_KEY=your-azure-key`<br>`OPENAI_COMPAT_BASE_URL=https://your-resource.openai.azure.com/openai/deployments/your-deployment` |
| **任何兼容服务** | 设置对应的 `BASE_URL` 和 `API_KEY` 即可 |

## 模型映射

默认情况下，系统会将 Anthropic 模型名直接传递给 OpenAI 兼容端点。如果目标服务不支持这些名称，可通过 `OPENAI_COMPAT_MODEL` 强制指定。

示例：
```bash
# 强制所有请求使用 gpt-4o
export OPENAI_COMPAT_MODEL=gpt-4o
```

## 与现有配置的关系

- 如果同时配置了 `OPENAI_COMPAT_API_KEY` 和 `ANTHROPIC_API_KEY`，优先使用 OpenAI 兼容模式
- 如果配置了 `CLAUDE_CODE_USE_BEDROCK` / `CLAUDE_CODE_USE_VERTEX` 等，优先使用对应云服务
- OpenAI OAuth（Codex）模式优先级高于 OpenAI 兼容模式

## 注意事项

1. **工具调用兼容性**：大部分 OpenAI 兼容服务支持 function calling，但某些本地模型可能不支持
2. **Thinking/Reasoning**：Anthropic 的 thinking 参数会被转换为 `reasoning_effort`，非所有模型支持
3. **Prompt Caching**：OpenAI 兼容 API 不支持 Anthropic 的 prompt caching，相关参数会被自动丢弃
4. **Beta 特性**：Anthropic 专有 beta 特性（如 advisor、cache editing）在第三方模型上不可用

## 故障排查

### 请求返回 401
检查 `OPENAI_COMPAT_API_KEY` 是否正确设置。

### 模型不存在错误
设置 `OPENAI_COMPAT_MODEL` 为目标服务支持的模型名称。

### 工具调用失败
某些 OpenAI 兼容服务对 tools 格式要求严格。确保使用能力较强的模型（如 GPT-4o、Claude 等）。

### 查看调试日志
```bash
DEBUG=1 ./bin/claude-haha
```
