import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { mkdir, rm } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import {
  createBranch,
  createCheckpoint,
  formatCheckpointList,
  loadCheckpointStore,
} from './versionControl.js'

const TEST_DIR = join(tmpdir(), 'cc-haha-version-control-test')

describe('Session Version Control', () => {
  beforeEach(async () => {
    await rm(TEST_DIR, { recursive: true, force: true })
    await mkdir(TEST_DIR, { recursive: true })
    process.env.CLAUDE_CONFIG_DIR = TEST_DIR
  })

  afterEach(async () => {
    await rm(TEST_DIR, { recursive: true, force: true })
    delete process.env.CLAUDE_CONFIG_DIR
  })

  it('creates a checkpoint', async () => {
    const messages = [{ role: 'user', content: 'hello' }] as any[]
    const cp = await createCheckpoint(messages, 'test-checkpoint')
    expect(cp.name).toBe('test-checkpoint')
    expect(cp.messageCount).toBe(1)
    expect(cp.id).toBeDefined()

    const store = await loadCheckpointStore()
    expect(store.checkpoints).toHaveLength(1)
  })

  it('creates a branch', async () => {
    const messages = [{ role: 'assistant', content: 'hi' }] as any[]
    const cp = await createBranch(messages, 'feature-x')
    expect(cp.branch).toBe('feature-x')
    expect(cp.name).toContain('feature-x')

    const store = await loadCheckpointStore()
    expect(store.currentBranch).toBe('feature-x')
  })

  it('formats checkpoint list', async () => {
    const messages = [{ role: 'user', content: 'hello' }] as any[]
    await createCheckpoint(messages, 'first')
    await createCheckpoint(messages, 'second')
    const { store, checkpoints } = await loadCheckpointStore().then(s => ({
      store: s,
      checkpoints: [...s.checkpoints].reverse(),
    }))
    const text = formatCheckpointList(store, checkpoints)
    expect(text).toContain('first')
    expect(text).toContain('second')
    expect(text).toContain('main')
  })
})
