import { describe, expect, it } from 'bun:test'
import {
  formatTerminalDashboard,
  generateHtmlDashboard,
  type DashboardData,
} from './dashboard.js'

const MOCK_DATA: DashboardData = {
  totalCostUSD: 0.1234,
  costDisplay: '$0.1234',
  hasUnknownModelCost: false,
  totalAPIDuration: 45000,
  totalDuration: 60000,
  totalLinesAdded: 120,
  totalLinesRemoved: 30,
  totalInputTokens: 10000,
  totalOutputTokens: 5000,
  totalCacheReadInputTokens: 2000,
  totalCacheCreationInputTokens: 1000,
  totalWebSearchRequests: 3,
  models: [
    {
      model: 'claude-sonnet-4-6',
      displayName: 'Sonnet 4.6',
      inputTokens: 8000,
      outputTokens: 4000,
      cacheReadInputTokens: 1500,
      cacheCreationInputTokens: 800,
      webSearchRequests: 2,
      costUSD: 0.1,
      costDisplay: '$0.1000',
      contextWindow: 200000,
      maxOutputTokens: 8192,
    },
    {
      model: 'claude-haiku-4-5',
      displayName: 'Haiku 4.5',
      inputTokens: 2000,
      outputTokens: 1000,
      cacheReadInputTokens: 500,
      cacheCreationInputTokens: 200,
      webSearchRequests: 1,
      costUSD: 0.0234,
      costDisplay: '$0.0234',
      contextWindow: 200000,
      maxOutputTokens: 4096,
    },
  ],
}

describe('Usage Dashboard', () => {
  it('formats terminal dashboard', () => {
    const text = formatTerminalDashboard(MOCK_DATA)
    expect(text).toContain('CLAUDE CODE USAGE DASHBOARD')
    expect(text).toContain('$0.1234')
    expect(text).toContain('Sonnet 4.6')
    expect(text).toContain('Haiku 4.5')
    expect(text).toContain('10.0k')
    expect(text).toContain('5.0k')
  })

  it('generates HTML dashboard', () => {
    const html = generateHtmlDashboard(MOCK_DATA)
    expect(html).toContain('<title>Claude Code Usage Dashboard</title>')
    expect(html).toContain('$0.1234')
    expect(html).toContain('Sonnet 4.6')
    expect(html).toContain('Haiku 4.5')
    expect(html).toContain('10.0k')
    expect(html).toContain('<table>')
    expect(html).toContain('bar-fill')
  })

  it('handles empty model usage', () => {
    const empty: DashboardData = {
      ...MOCK_DATA,
      models: [],
      totalCostUSD: 0,
      costDisplay: '$0.0000',
    }
    const text = formatTerminalDashboard(empty)
    expect(text).toContain('$0.0000')
    expect(text).not.toContain('Usage by model')
  })
})
