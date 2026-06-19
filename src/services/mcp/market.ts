/**
 * MCP Server Marketplace
 *
 * Built-in registry of popular MCP servers that can be installed with a single
 * command. Each entry knows its transport type, command/URL, default args, and
 * required env vars.
 */

import { addMcpConfig } from './config.js'
import type { ConfigScope, McpServerConfig } from './types.js'

export type MarketServer = {
  name: string
  description: string
  category: string
  homepage?: string
  transport: 'stdio' | 'sse' | 'http'
  command: string
  args: string[]
  env?: Record<string, string>
  headers?: Record<string, string>
  requiresEnv?: string[]
  tags?: string[]
}

export const BUILTIN_MCP_MARKET: MarketServer[] = [
  {
    name: 'filesystem',
    description: 'Secure filesystem access for reading/writing files',
    category: 'Core',
    transport: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem'],
    requiresEnv: ['ALLOWED_PATHS'],
    tags: ['filesystem', 'core', 'official'],
  },
  {
    name: 'github',
    description: 'GitHub API integration for issues, PRs, repos and searches',
    category: 'Developer Tools',
    homepage: 'https://github.com/modelcontextprotocol/servers/tree/main/src/github',
    transport: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-github'],
    requiresEnv: ['GITHUB_PERSONAL_ACCESS_TOKEN'],
    tags: ['github', 'api', 'official'],
  },
  {
    name: 'git',
    description: 'Read-only Git repository inspection tools',
    category: 'Developer Tools',
    transport: 'stdio',
    command: 'uvx',
    args: ['mcp-server-git', '--repository', '.'],
    tags: ['git', 'vcs', 'community'],
  },
  {
    name: 'fetch',
    description: 'Fetch and convert web pages to Markdown',
    category: 'Web',
    transport: 'stdio',
    command: 'uvx',
    args: ['mcp-server-fetch'],
    tags: ['web', 'fetch', 'community'],
  },
  {
    name: 'brave-search',
    description: 'Web search via Brave Search API',
    category: 'Web',
    transport: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-brave-search'],
    requiresEnv: ['BRAVE_API_KEY'],
    tags: ['search', 'web', 'official'],
  },
  {
    name: 'memory',
    description: 'Persistent memory/graph knowledge store',
    category: 'Memory',
    transport: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-memory'],
    tags: ['memory', 'knowledge', 'official'],
  },
  {
    name: 'sqlite',
    description: 'SQLite database access with safety controls',
    category: 'Database',
    transport: 'stdio',
    command: 'uvx',
    args: ['mcp-server-sqlite', '--db-path', './mcp.db'],
    tags: ['sqlite', 'database', 'community'],
  },
  {
    name: 'postgres',
    description: 'PostgreSQL read-only inspection tools',
    category: 'Database',
    transport: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-postgres'],
    requiresEnv: ['DATABASE_URL'],
    tags: ['postgres', 'database', 'official'],
  },
  {
    name: 'puppeteer',
    description: 'Browser automation and web scraping',
    category: 'Browser',
    transport: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-puppeteer'],
    tags: ['browser', 'automation', 'official'],
  },
  {
    name: 'sequentialthinking',
    description: 'Dynamic thinking tool for structured problem solving',
    category: 'Productivity',
    transport: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-sequential-thinking'],
    tags: ['thinking', 'productivity', 'official'],
  },
  {
    name: 'slack',
    description: 'Slack workspace integration',
    category: 'Communication',
    transport: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-slack'],
    requiresEnv: ['SLACK_BOT_TOKEN', 'SLACK_TEAM_ID'],
    tags: ['slack', 'communication', 'official'],
  },
  {
    name: 'time',
    description: 'Current time and timezone conversion',
    category: 'Utility',
    transport: 'stdio',
    command: 'uvx',
    args: ['mcp-server-time'],
    tags: ['time', 'utility', 'community'],
  },
]

export function listMarketServers(): MarketServer[] {
  return BUILTIN_MCP_MARKET
}

export function searchMarketServers(query: string): MarketServer[] {
  const q = query.toLowerCase()
  return BUILTIN_MCP_MARKET.filter(
    s =>
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.tags?.some(t => t.toLowerCase().includes(q)),
  )
}

export function getMarketServer(name: string): MarketServer | undefined {
  return BUILTIN_MCP_MARKET.find(
    s => s.name.toLowerCase() === name.toLowerCase(),
  )
}

export function formatMarketList(servers: MarketServer[]): string {
  if (servers.length === 0) return 'No MCP servers found.'

  const maxName = Math.max(...servers.map(s => s.name.length))
  const lines = servers.map(s => {
    const envHint = s.requiresEnv?.length
      ? ` (requires: ${s.requiresEnv.join(', ')})`
      : ''
    return `${s.name.padEnd(maxName)}  ${s.category.padEnd(16)} ${s.description}${envHint}`
  })
  return lines.join('\n')
}

export function formatMarketDetail(server: MarketServer): string {
  const lines = [
    `Name:        ${server.name}`,
    `Category:    ${server.category}`,
    `Description: ${server.description}`,
    server.homepage ? `Homepage:    ${server.homepage}` : '',
    `Transport:   ${server.transport}`,
    `Command:     ${server.command} ${server.args.join(' ')}`,
    server.requiresEnv?.length
      ? `Requires:    ${server.requiresEnv.join(', ')}`
      : '',
    server.tags?.length ? `Tags:        ${server.tags.join(', ')}` : '',
  ]
  return lines.filter(Boolean).join('\n')
}

/**
 * Install an MCP server from the built-in market.
 *
 * Expands env vars in args (e.g. $HOME) and prompts for required env vars if
 * they are not already set.
 */
export async function installMarketServer(
  name: string,
  options: {
    scope?: ConfigScope
    env?: Record<string, string>
    yes?: boolean
  } = {},
): Promise<string> {
  const server = getMarketServer(name)
  if (!server) {
    throw new Error(
      `MCP server "${name}" not found in marketplace. Run "/mcp market list" to see available servers.`,
    )
  }

  const scope = options.scope ?? 'local'
  const providedEnv = options.env ?? {}

  // Validate required env vars
  const missing: string[] = []
  for (const key of server.requiresEnv ?? []) {
    if (!process.env[key] && !providedEnv[key]) {
      missing.push(key)
    }
  }
  if (missing.length > 0) {
    throw new Error(
      `Cannot install "${server.name}". Missing required environment variables: ${missing.join(', ')}\n` +
        `Set them in your shell or pass with -e KEY=value.`,
    )
  }

  let config: McpServerConfig
  if (server.transport === 'stdio') {
    config = {
      type: 'stdio',
      command: server.command,
      args: server.args.map(arg =>
        arg.replace(/\$(\w+)/g, (_match, key) => process.env[key] ?? ''),
      ),
      env: { ...server.env, ...providedEnv },
    }
  } else if (server.transport === 'sse') {
    config = {
      type: 'sse',
      url: server.command,
      headers: server.headers,
    }
  } else {
    config = {
      type: 'http',
      url: server.command,
      headers: server.headers,
    }
  }

  await addMcpConfig(server.name, config, scope)

  const envNote =
    server.requiresEnv && server.requiresEnv.length > 0
      ? ` (env: ${server.requiresEnv.join(', ')})`
      : ''
  return `Installed MCP server "${server.name}" from marketplace${envNote}.`
}
