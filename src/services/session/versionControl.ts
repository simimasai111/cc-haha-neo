/**
 * Session version control.
 *
 * Provides lightweight git-style checkpoints/branches for the current
 * conversation. Checkpoints are stored as JSON files keyed by session id.
 */

import { mkdir, readFile, writeFile } from 'fs/promises'
import { randomUUID } from 'crypto'
import { join } from 'path'
import { getClaudeConfigHomeDir } from '../../utils/envUtils.js'
import { getSessionId } from '../../bootstrap/state.js'
import type { Message } from '../../types/message.js'

export type Checkpoint = {
  id: string
  name: string
  branch?: string
  createdAt: number
  messageCount: number
  messages: Message[]
}

export type CheckpointStore = {
  sessionId: string
  currentBranch: string
  checkpoints: Checkpoint[]
}

function getStorePath(): string {
  const base = join(getClaudeConfigHomeDir(), 'session-checkpoints')
  const sessionId = getSessionId()
  return join(base, `${sessionId}.json`)
}

async function ensureStoreDir(): Promise<void> {
  const dir = join(getClaudeConfigHomeDir(), 'session-checkpoints')
  await mkdir(dir, { recursive: true })
}

export async function loadCheckpointStore(): Promise<CheckpointStore> {
  const path = getStorePath()
  try {
    const raw = await readFile(path, 'utf-8')
    return JSON.parse(raw) as CheckpointStore
  } catch (e) {
    const code = (e as NodeJS.ErrnoException).code
    if (code === 'ENOENT') {
      return {
        sessionId: getSessionId(),
        currentBranch: 'main',
        checkpoints: [],
      }
    }
    throw e
  }
}

async function saveCheckpointStore(store: CheckpointStore): Promise<void> {
  await ensureStoreDir()
  await writeFile(getStorePath(), JSON.stringify(store, null, 2), 'utf-8')
}

export async function createCheckpoint(
  messages: Message[],
  name?: string,
  branch?: string,
): Promise<Checkpoint> {
  const store = await loadCheckpointStore()
  const checkpoint: Checkpoint = {
    id: randomUUID().slice(0, 8),
    name: name?.trim() || `checkpoint-${store.checkpoints.length + 1}`,
    branch: branch ?? store.currentBranch,
    createdAt: Date.now(),
    messageCount: messages.length,
    messages,
  }
  store.checkpoints.push(checkpoint)
  await saveCheckpointStore(store)
  return checkpoint
}

export async function createBranch(
  messages: Message[],
  branchName: string,
): Promise<Checkpoint> {
  const store = await loadCheckpointStore()
  store.currentBranch = branchName
  const checkpoint: Checkpoint = {
    id: randomUUID().slice(0, 8),
    name: `branch: ${branchName}`,
    branch: branchName,
    createdAt: Date.now(),
    messageCount: messages.length,
    messages,
  }
  store.checkpoints.push(checkpoint)
  await saveCheckpointStore(store)
  return checkpoint
}

export async function checkoutCheckpoint(
  checkpointId: string,
): Promise<Checkpoint | null> {
  const store = await loadCheckpointStore()
  const checkpoint = store.checkpoints.find(c => c.id === checkpointId)
  if (!checkpoint) return null
  if (checkpoint.branch) {
    store.currentBranch = checkpoint.branch
  }
  await saveCheckpointStore(store)
  return checkpoint
}

export async function listCheckpoints(): Promise<{
  store: CheckpointStore
  checkpoints: Checkpoint[]
}> {
  const store = await loadCheckpointStore()
  return { store, checkpoints: [...store.checkpoints].reverse() }
}

export function formatCheckpointList(
  store: CheckpointStore,
  checkpoints: Checkpoint[],
): string {
  if (checkpoints.length === 0) {
    return `No checkpoints for session ${store.sessionId.slice(0, 8)}.\nUse /checkpoint [name] to save the current conversation.`
  }

  const maxId = Math.max(...checkpoints.map(c => c.id.length))
  const lines = [
    `Session: ${store.sessionId.slice(0, 8)} | Branch: ${store.currentBranch}`,
    '',
    `${'ID'.padEnd(maxId)}  Name                          Branch     Messages  Time`,
    `${'-'.repeat(maxId)}  ----------------------------- ---------- --------  ----------------`,
  ]

  for (const c of checkpoints) {
    const date = new Date(c.createdAt).toLocaleString()
    lines.push(
      `${c.id.padEnd(maxId)}  ${c.name.padEnd(30)} ${(c.branch ?? '-').padEnd(10)} ${String(c.messageCount).padStart(6)}  ${date}`,
    )
  }

  return lines.join('\n')
}

export function formatCheckpointDetail(checkpoint: Checkpoint): string {
  return [
    `ID:       ${checkpoint.id}`,
    `Name:     ${checkpoint.name}`,
    `Branch:   ${checkpoint.branch ?? '-'}`,
    `Messages: ${checkpoint.messageCount}`,
    `Created:  ${new Date(checkpoint.createdAt).toLocaleString()}`,
  ].join('\n')
}
