import type { Command } from '../../commands.js'

const dashboard = {
  type: 'local',
  name: 'dashboard',
  description: 'Show a rich usage and cost dashboard',
  supportsNonInteractive: true,
  load: () => import('./dashboard.js'),
} satisfies Command

export default dashboard
