/**
 * OpenAI-compatible API fetch interceptor.
 *
 * Intercepts Anthropic Messages API requests and transparently converts them
 * to OpenAI Chat Completions format. Responses are converted back to
 * Anthropic Messages format so the rest of the codebase is unaware.
 *
 * Usage:
 *   Set OPENAI_COMPAT_API_KEY and OPENAI_COMPAT_BASE_URL (optional, defaults to OpenAI).
 *   Set ANTHROPIC_BASE_URL to any value so the provider is not firstParty.
 *   The existing ANTHROPIC_AUTH_TOKEN or ANTHROPIC_API_KEY can also be used as fallback.
 */

import type { ClientOptions } from '@anthropic-ai/sdk'
import { randomUUID } from 'crypto'
import { anthropicToOpenaiChat } from '../../server/proxy/transform/anthropicToOpenaiChat.js'
import { openaiChatStreamToAnthropic } from '../../server/proxy/streaming/openaiChatStreamToAnthropic.js'
import type { AnthropicRequest } from '../../server/proxy/transform/types.js'
import { logForDebugging } from '../../utils/debug.js'
import { getProxyFetchOptions } from '../../utils/proxy.js'

const DEFAULT_OPENAI_COMPAT_BASE_URL = 'https://api.openai.com/v1'

function getOpenAICompatBaseUrl(): string {
  const envUrl = process.env.OPENAI_COMPAT_BASE_URL?.trim()
  if (envUrl) {
    // Normalize: ensure no trailing slash and append /chat/completions later
    return envUrl.replace(/\/$/, '')
  }
  return DEFAULT_OPENAI_COMPAT_BASE_URL
}

function getOpenAICompatApiKey(): string | null {
  return (
    process.env.OPENAI_COMPAT_API_KEY?.trim() ||
    process.env.OPENAI_API_KEY?.trim() ||
    process.env.ANTHROPIC_AUTH_TOKEN?.trim() ||
    process.env.ANTHROPIC_API_KEY?.trim() ||
    null
  )
}

function getOpenAICompatModel(originalModel: string): string {
  const envModel = process.env.OPENAI_COMPAT_MODEL?.trim()
  if (envModel) return envModel
  return originalModel
}

export function shouldUseOpenAICompat(): boolean {
  return !!getOpenAICompatApiKey()
}

async function readAnthropicBody(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<AnthropicRequest> {
  const directBody = init?.body

  if (typeof directBody === 'string') {
    return JSON.parse(directBody) as AnthropicRequest
  }

  if (directBody instanceof Uint8Array || directBody instanceof ArrayBuffer) {
    return JSON.parse(Buffer.from(directBody).toString('utf8')) as AnthropicRequest
  }

  if (input instanceof Request) {
    return (await input.clone().json()) as AnthropicRequest
  }

  throw new Error('Unable to read Anthropic request body for OpenAI-compatible transformation')
}

export function buildOpenAICompatFetch(
  fetchOverride: ClientOptions['fetch'],
  source: string | undefined,
): ClientOptions['fetch'] {
  const inner = fetchOverride ?? globalThis.fetch
  const baseUrl = getOpenAICompatBaseUrl()
  const apiKey = getOpenAICompatApiKey()

  return async (input, init) => {
    const url = input instanceof Request ? new URL(input.url) : new URL(String(input))

    // Only intercept /v1/messages
    if (!url.pathname.endsWith('/v1/messages')) {
      return inner(input, init)
    }

    const originalBody = await readAnthropicBody(input, init)
    const mappedModel = getOpenAICompatModel(originalBody.model)

    // Transform Anthropic → OpenAI Chat Completions
    const transformedBody = anthropicToOpenaiChat({
      ...originalBody,
      model: mappedModel,
    })

    // Always use streaming to Anthropic SDK; we can convert back if needed.
    const upstreamBody = {
      ...transformedBody,
      stream: true,
    }

    if (!apiKey) {
      return Response.json(
        {
          type: 'error',
          error: {
            type: 'authentication_error',
            message: 'OpenAI-compatible API key is missing. Set OPENAI_COMPAT_API_KEY or OPENAI_API_KEY.',
          },
        },
        { status: 401 },
      )
    }

    const headers = new Headers()
    headers.set('Content-Type', 'application/json')
    headers.set('Authorization', `Bearer ${apiKey}`)

    logForDebugging(
      `[API REQUEST] ${url.pathname} remapped_to=OpenAI/ChatCompletions model=${mappedModel} source=${source ?? 'unknown'} request_id=${randomUUID()}`,
    )

    const proxyOptions = getProxyFetchOptions({ forAnthropicAPI: true })
    const upstream = await inner(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(upstreamBody),
      signal: init?.signal,
      ...proxyOptions,
    })

    if (!upstream.ok) {
      const errorText = await upstream.text().catch(() => '')
      return Response.json(
        {
          type: 'error',
          error: {
            type: 'api_error',
            message: `OpenAI-compatible upstream returned HTTP ${upstream.status}: ${errorText.slice(0, 500)}`,
          },
        },
        { status: upstream.status },
      )
    }

    if (!upstream.body) {
      return Response.json(
        {
          type: 'error',
          error: {
            type: 'api_error',
            message: 'OpenAI-compatible upstream returned no body',
          },
        },
        { status: 502 },
      )
    }

    return new Response(
      openaiChatStreamToAnthropic(upstream.body, mappedModel),
      {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      },
    )
  }
}
