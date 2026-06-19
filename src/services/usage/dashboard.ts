/**
 * Usage & cost dashboard service.
 *
 * Generates both terminal and HTML views from the current session's cost
 * state. The data is sourced from the existing cost tracker so this works
 * transparently for Anthropic, OpenAI-compatible, and third-party providers.
 */

import { getSessionUsageSnapshot, type SessionUsageSnapshot } from '../../cost-tracker.js'
import { formatDuration, formatNumber } from '../../utils/format.js'

export type DashboardData = SessionUsageSnapshot

export function getDashboardData(): DashboardData {
  return getSessionUsageSnapshot()
}

function horizontalBar(value: number, max: number, width = 20): string {
  if (max === 0) return '░'.repeat(width)
  const filled = Math.max(0, Math.min(width, Math.round((value / max) * width)))
  return '█'.repeat(filled) + '░'.repeat(width - filled)
}

export function formatTerminalDashboard(data: DashboardData): string {
  const lines: string[] = []
  lines.push('╔════════════════════════════════════════════════════════════╗')
  lines.push('║              CLAUDE CODE USAGE DASHBOARD                   ║')
  lines.push('╠════════════════════════════════════════════════════════════╣')
  lines.push(`║ Total cost:        ${data.costDisplay.padEnd(50)}║`)
  lines.push(`║ API duration:      ${formatDuration(data.totalAPIDuration).padEnd(50)}║`)
  lines.push(`║ Wall duration:     ${formatDuration(data.totalDuration).padEnd(50)}║`)
  lines.push(`║ Code changes:      ${`${data.totalLinesAdded} added / ${data.totalLinesRemoved} removed`.padEnd(50)}║`)
  lines.push(`║ Input tokens:      ${formatNumber(data.totalInputTokens).padEnd(50)}║`)
  lines.push(`║ Output tokens:     ${formatNumber(data.totalOutputTokens).padEnd(50)}║`)
  lines.push(`║ Cache read:        ${formatNumber(data.totalCacheReadInputTokens).padEnd(50)}║`)
  lines.push(`║ Cache creation:    ${formatNumber(data.totalCacheCreationInputTokens).padEnd(50)}║`)
  if (data.totalWebSearchRequests > 0) {
    lines.push(`║ Web searches:      ${formatNumber(data.totalWebSearchRequests).padEnd(50)}║`)
  }
  lines.push('╚════════════════════════════════════════════════════════════╝')

  if (data.models.length > 0) {
    lines.push('\nUsage by model:')
    const maxCost = Math.max(...data.models.map(m => m.costUSD))
    for (const m of data.models) {
      const bar = horizontalBar(m.costUSD, maxCost)
      lines.push(
        `${m.displayName.padEnd(20)} ${bar} ${m.costDisplay} | ` +
          `${formatNumber(m.inputTokens)} in / ${formatNumber(m.outputTokens)} out`,
      )
    }
  }

  if (data.hasUnknownModelCost) {
    lines.push(
      '\n⚠️  Some model costs are unknown; totals may be underestimated.',
    )
  }

  return lines.join('\n')
}

export function generateHtmlDashboard(data: DashboardData): string {
  const modelRows = data.models
    .map(
      m => `
    <tr>
      <td>${escapeHtml(m.displayName)}</td>
      <td>${formatNumber(m.inputTokens)}</td>
      <td>${formatNumber(m.outputTokens)}</td>
      <td>${formatNumber(m.cacheReadInputTokens)}</td>
      <td>${formatNumber(m.cacheCreationInputTokens)}</td>
      <td>${m.costDisplay}</td>
    </tr>`,
    )
    .join('')

  const maxCost = Math.max(...data.models.map(m => m.costUSD), 0.0001)
  const modelBars = data.models
    .map(
      m => {
        const pct = ((m.costUSD / maxCost) * 100).toFixed(1)
        return `
    <div class="bar-row">
      <div class="bar-label">${escapeHtml(m.displayName)}</div>
      <div class="bar-track">
        <div class="bar-fill" style="width: ${pct}%"></div>
      </div>
      <div class="bar-value">${m.costDisplay}</div>
    </div>`
      },
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Claude Code Usage Dashboard</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 2rem; }
    h1 { color: #38bdf8; margin-bottom: 0.5rem; }
    .subtitle { color: #94a3b8; margin-bottom: 2rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .card { background: #1e293b; border-radius: 12px; padding: 1.25rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); }
    .card-label { font-size: 0.875rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
    .card-value { font-size: 1.75rem; font-weight: 700; color: #f8fafc; margin-top: 0.5rem; }
    table { width: 100%; border-collapse: collapse; background: #1e293b; border-radius: 12px; overflow: hidden; margin-bottom: 2rem; }
    th, td { padding: 0.875rem 1rem; text-align: left; }
    th { background: #334155; color: #38bdf8; font-weight: 600; }
    tr:nth-child(even) { background: #253449; }
    .bar-row { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.75rem; }
    .bar-label { width: 140px; font-size: 0.9rem; }
    .bar-track { flex: 1; height: 20px; background: #334155; border-radius: 10px; overflow: hidden; }
    .bar-fill { height: 100%; background: linear-gradient(90deg, #38bdf8, #818cf8); border-radius: 10px; }
    .bar-value { width: 80px; text-align: right; font-weight: 600; }
    .warning { color: #fbbf24; margin-top: 1rem; }
  </style>
</head>
<body>
  <h1>Claude Code Usage Dashboard</h1>
  <div class="subtitle">Session snapshot generated at ${new Date().toLocaleString()}</div>

  <div class="grid">
    <div class="card">
      <div class="card-label">Total Cost</div>
      <div class="card-value">${data.costDisplay}</div>
    </div>
    <div class="card">
      <div class="card-label">API Duration</div>
      <div class="card-value">${formatDuration(data.totalAPIDuration)}</div>
    </div>
    <div class="card">
      <div class="card-label">Input Tokens</div>
      <div class="card-value">${formatNumber(data.totalInputTokens)}</div>
    </div>
    <div class="card">
      <div class="card-label">Output Tokens</div>
      <div class="card-value">${formatNumber(data.totalOutputTokens)}</div>
    </div>
    <div class="card">
      <div class="card-label">Cache Read</div>
      <div class="card-value">${formatNumber(data.totalCacheReadInputTokens)}</div>
    </div>
    <div class="card">
      <div class="card-label">Cache Write</div>
      <div class="card-value">${formatNumber(data.totalCacheCreationInputTokens)}</div>
    </div>
  </div>

  <h2>Cost by Model</h2>
  ${modelBars || '<p>No model usage yet.</p>'}

  <h2>Model Breakdown</h2>
  <table>
    <thead>
      <tr>
        <th>Model</th>
        <th>Input Tokens</th>
        <th>Output Tokens</th>
        <th>Cache Read</th>
        <th>Cache Write</th>
        <th>Cost</th>
      </tr>
    </thead>
    <tbody>
      ${modelRows || '<tr><td colspan="6">No model usage yet.</td></tr>'}
    </tbody>
  </table>

  ${data.hasUnknownModelCost ? '<div class="warning">⚠️ Some model costs are unknown; totals may be underestimated.</div>' : ''}
</body>
</html>`
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export async function saveHtmlDashboard(
  data: DashboardData,
  filePath: string,
): Promise<void> {
  const { writeFile } = await import('fs/promises')
  await writeFile(filePath, generateHtmlDashboard(data), 'utf-8')
}
