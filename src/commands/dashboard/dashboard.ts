import { mkdir } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import type { LocalCommandCall } from '../../commands.js'
import {
  formatTerminalDashboard,
  getDashboardData,
  saveHtmlDashboard,
} from '../../services/usage/dashboard.js'

export const call: LocalCommandCall = async args => {
  const data = getDashboardData()
  const showHtml = args.includes('--html') || args.includes('-h')

  if (showHtml) {
    const dir = join(tmpdir(), 'claude-code-dashboards')
    await mkdir(dir, { recursive: true })
    const filePath = join(dir, `usage-${Date.now()}.html`)
    await saveHtmlDashboard(data, filePath)
    return {
      type: 'text',
      value: `${formatTerminalDashboard(data)}\n\n📊 HTML dashboard saved to: ${filePath}`,
    }
  }

  return { type: 'text', value: formatTerminalDashboard(data) }
}
