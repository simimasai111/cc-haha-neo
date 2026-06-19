import { describe, expect, it } from 'bun:test'
import {
  BUILTIN_MCP_MARKET,
  formatMarketList,
  getMarketServer,
  listMarketServers,
  searchMarketServers,
} from './market.js'

describe('MCP Market', () => {
  it('has built-in servers', () => {
    expect(BUILTIN_MCP_MARKET.length).toBeGreaterThan(0)
    expect(listMarketServers().length).toBe(BUILTIN_MCP_MARKET.length)
  })

  it('finds server by name case-insensitively', () => {
    expect(getMarketServer('GitHub')?.name).toBe('github')
    expect(getMarketServer('GITHUB')?.name).toBe('github')
    expect(getMarketServer('filesystem')?.name).toBe('filesystem')
  })

  it('returns undefined for unknown server', () => {
    expect(getMarketServer('unknown-server')).toBeUndefined()
  })

  it('searches by name, category and tags', () => {
    const byName = searchMarketServers('github')
    expect(byName.some(s => s.name === 'github')).toBe(true)

    const byCategory = searchMarketServers('database')
    expect(byCategory.length).toBeGreaterThan(0)

    const byTag = searchMarketServers('official')
    expect(byTag.length).toBeGreaterThan(0)
  })

  it('formats market list', () => {
    const list = formatMarketList(listMarketServers())
    expect(list).toContain('github')
    expect(list).toContain('filesystem')
    expect(list).not.toContain('No MCP servers found')
  })
})
