import { describe, expect, it, mock } from 'bun:test'
import { buildOpenAICompatFetch, shouldUseOpenAICompat } from './fetch.js'

describe('shouldUseOpenAICompat', () => {
  it('returns false when no API key is set', () => {
    delete process.env.OPENAI_COMPAT_API_KEY
    delete process.env.OPENAI_API_KEY
    delete process.env.ANTHROPIC_AUTH_TOKEN
    delete process.env.ANTHROPIC_API_KEY
    expect(shouldUseOpenAICompat()).toBe(false)
  })

  it('returns true when OPENAI_COMPAT_API_KEY is set', () => {
    process.env.OPENAI_COMPAT_API_KEY = 'sk-test'
    expect(shouldUseOpenAICompat()).toBe(true)
    delete process.env.OPENAI_COMPAT_API_KEY
  })

  it('returns true when OPENAI_API_KEY is set', () => {
    process.env.OPENAI_API_KEY = 'sk-test'
    expect(shouldUseOpenAICompat()).toBe(true)
    delete process.env.OPENAI_API_KEY
  })

  it('returns true when ANTHROPIC_AUTH_TOKEN is set', () => {
    process.env.ANTHROPIC_AUTH_TOKEN = 'sk-test'
    expect(shouldUseOpenAICompat()).toBe(true)
    delete process.env.ANTHROPIC_AUTH_TOKEN
  })
})

describe('buildOpenAICompatFetch', () => {
  it('passes through non-messages requests', async () => {
    const innerFetch = mock(() =>
      Promise.resolve(new Response('ok', { status: 200 })),
    )
    const fetch = buildOpenAICompatFetch(innerFetch as unknown as typeof fetch, 'test')

    const response = await fetch('https://example.com/other', { method: 'GET' })
    expect(response.status).toBe(200)
    expect(innerFetch).toHaveBeenCalledTimes(1)
  })

  it('returns 401 when API key is missing', async () => {
    const originalKey = process.env.OPENAI_COMPAT_API_KEY
    delete process.env.OPENAI_COMPAT_API_KEY
    delete process.env.OPENAI_API_KEY
    delete process.env.ANTHROPIC_AUTH_TOKEN
    delete process.env.ANTHROPIC_API_KEY

    const innerFetch = mock(() => Promise.resolve(new Response('ok')))
    const fetch = buildOpenAICompatFetch(innerFetch as unknown as typeof fetch, 'test')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      body: JSON.stringify({
        model: 'claude-sonnet',
        max_tokens: 1024,
        messages: [{ role: 'user', content: 'hello' }],
      }),
    })

    expect(response.status).toBe(401)
    expect(innerFetch).toHaveBeenCalledTimes(0)

    if (originalKey) process.env.OPENAI_COMPAT_API_KEY = originalKey
  })

  it('transforms Anthropic request to OpenAI Chat Completions', async () => {
    process.env.OPENAI_COMPAT_API_KEY = 'sk-test-key'

    const innerFetch = mock((url: string, init: RequestInit) => {
      // Verify the request is sent to OpenAI Chat Completions endpoint
      expect(url).toContain('/chat/completions')

      const body = JSON.parse(init.body as string)
      expect(body.model).toBe('claude-sonnet')
      expect(body.messages).toBeDefined()
      expect(body.messages[0].role).toBe('user')
      expect(body.stream).toBe(true)

      // Return a minimal SSE stream
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(
            encoder.encode(
              'data: {"id":"test","object":"chat.completion.chunk","created":1,"model":"gpt-4","choices":[{"index":0,"delta":{"role":"assistant","content":"Hi"},"finish_reason":null}]}\n\n',
            ),
          )
          controller.enqueue(encoder.encode('data: {"id":"test","object":"chat.completion.chunk","created":1,"model":"gpt-4","choices":[{"index":0,"delta":{"content":" there"},"finish_reason":"stop"}]}\n\n'))
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        },
      })

      return Promise.resolve(
        new Response(stream, {
          headers: { 'Content-Type': 'text/event-stream' },
        }),
      )
    })

    const fetch = buildOpenAICompatFetch(innerFetch as unknown as typeof fetch, 'test')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      body: JSON.stringify({
        model: 'claude-sonnet',
        max_tokens: 1024,
        messages: [{ role: 'user', content: 'hello' }],
      }),
    })

    expect(response.status).toBe(200)
    expect(innerFetch).toHaveBeenCalledTimes(1)

    // Read the transformed stream
    const reader = response.body!.getReader()
    const decoder = new TextDecoder()
    let chunks = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks += decoder.decode(value)
    }

    // Should contain Anthropic-format SSE events
    expect(chunks).toContain('event: message_start')
    expect(chunks).toContain('event: content_block_start')
    expect(chunks).toContain('event: content_block_delta')
    expect(chunks).toContain('Hi')
    expect(chunks).toContain('message_stop')

    delete process.env.OPENAI_COMPAT_API_KEY
  })
})
