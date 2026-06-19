import type { Command } from '../../commands.js'

const checkpoint = {
  type: 'local',
  name: 'checkpoint',
  aliases: ['cp'],
  description: 'Save, list, branch, or restore conversation checkpoints',
  argumentHint: '[save [name]|list|info <id>|branch <name>|checkout <id>]',
  supportsNonInteractive: false,
  load: () => import('./checkpoint.js'),
} satisfies Command

export default checkpoint
