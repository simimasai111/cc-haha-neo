# OpenAI-compatible API

cc-haha-neo includes native OpenAI-compatible API support, allowing you to connect to OpenAI, DeepSeek, OpenRouter, Ollama, Azure OpenAI, or any other compatible endpoint without an extra proxy.

## How it works

Requests to the Anthropic Messages API are intercepted at the `fetch` layer and transparently converted to OpenAI Chat Completions format. The upstream SSE stream is converted back to Anthropic-style SSE, so the rest of the codebase is unaware of the switch.

## Quick start

```bash
# OpenAI official
export OPENAI_COMPAT_API_KEY=sk-your-openai-key
export OPENAI_COMPAT_MODEL=gpt-4o
./bin/claude-haha

# DeepSeek
export OPENAI_COMPAT_API_KEY=sk-your-deepseek-key
export OPENAI_COMPAT_BASE_URL=https://api.deepseek.com/v1
export OPENAI_COMPAT_MODEL=deepseek-chat
./bin/claude-haha

# OpenRouter
export OPENAI_COMPAT_API_KEY=sk-or-v1-your-key
export OPENAI_COMPAT_BASE_URL=https://openrouter.ai/api/v1
export OPENAI_COMPAT_MODEL=openai/gpt-4o
./bin/claude-haha

# Ollama local
export OPENAI_COMPAT_API_KEY=ollama
export OPENAI_COMPAT_BASE_URL=http://localhost:11434/v1
export OPENAI_COMPAT_MODEL=llama3.1
./bin/claude-haha
```

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_COMPAT_API_KEY` | Yes | API key for the compatible endpoint |
| `OPENAI_COMPAT_BASE_URL` | No | Base URL, defaults to `https://api.openai.com/v1` |
| `OPENAI_COMPAT_MODEL` | No | Override model name sent to the endpoint |
| `OPENAI_API_KEY` | Fallback | Alias for `OPENAI_COMPAT_API_KEY` |

## Notes

- Tool calling works with most compatible providers, but some local models may not support it.
- Anthropic prompt caching is dropped when using OpenAI-compatible endpoints.
- Set `DEBUG=1` to see the transformed requests.

## Related files

- `src/services/openaiCompat/fetch.ts`
- `src/services/api/client.ts`
- `src/utils/model/providers.ts`
