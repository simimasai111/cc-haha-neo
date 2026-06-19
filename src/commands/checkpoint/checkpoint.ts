import type { LocalCommandCall } from '../../commands.js'
import {
  createBranch,
  createCheckpoint,
  formatCheckpointDetail,
  formatCheckpointList,
  listCheckpoints,
  checkoutCheckpoint,
} from '../../services/session/versionControl.js'

export const call: LocalCommandCall = async (args, context) => {
  const parts = args.trim().split(/\s+/).filter(Boolean)
  const subcommand = parts[0] ?? 'save'

  const messages = context.getAppState().messages

  switch (subcommand) {
    case 'save': {
      const name = parts.slice(1).join(' ') || undefined
      const checkpoint = await createCheckpoint(messages, name)
      return {
        type: 'text',
        value: `Saved checkpoint ${checkpoint.id}: "${checkpoint.name}" (${checkpoint.messageCount} messages)`,
      }
    }

    case 'list': {
      const { store, checkpoints } = await listCheckpoints()
      return { type: 'text', value: formatCheckpointList(store, checkpoints) }
    }

    case 'info': {
      const id = parts[1]
      if (!id) {
        return { type: 'text', value: 'Usage: /checkpoint info <id>' }
      }
      const { checkpoints } = await listCheckpoints()
      const found = checkpoints.find(c => c.id === id)
      return {
        type: 'text',
        value: found ? formatCheckpointDetail(found) : `Checkpoint "${id}" not found.`,
      }
    }

    case 'branch': {
      const branchName = parts[1]
      if (!branchName) {
        return { type: 'text', value: 'Usage: /checkpoint branch <name>' }
      }
      const checkpoint = await createBranch(messages, branchName)
      return {
        type: 'text',
        value: `Created branch "${branchName}" at checkpoint ${checkpoint.id} (${checkpoint.messageCount} messages)`,
      }
    }

    case 'checkout': {
      const id = parts[1]
      if (!id) {
        return { type: 'text', value: 'Usage: /checkpoint checkout <id>' }
      }
      const checkpoint = await checkoutCheckpoint(id)
      if (!checkpoint) {
        return { type: 'text', value: `Checkpoint "${id}" not found.` }
      }
      context.setMessages(() => checkpoint.messages)
      return {
        type: 'text',
        value: `Restored checkpoint ${checkpoint.id}: "${checkpoint.name}" (${checkpoint.messageCount} messages)`,
      }
    }

    default: {
      return {
        type: 'text',
        value:
          'Usage: /checkpoint [save [name]|list|info <id>|branch <name>|checkout <id>]',
      }
    }
  }
}
