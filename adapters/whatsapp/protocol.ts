import * as crypto from 'node:crypto'
import * as path from 'node:path'
import {
  clearWhatsAppAuth,
  closeWhatsAppSocket,
  createWhatsAppSocket,
  isWhatsAppLoggedOut,
  waitForWhatsAppCredsSave,
  type WhatsAppSocket,
} from './session.js'

export type WhatsAppLoginStartResult = {
  sessionKey: string
  qr?: string
  message: string
}

export type WhatsAppLoginPollResult =
  | {
      connected: true
      accountJid: string
      authDir: string
      message: string
    }
  | {
      connected: false
      status: 'waiting' | 'expired' | 'error'
      qr?: string
      message: string
    }

type LoginSession = {
  authDir: string
  sock: WhatsAppSocket
  qr?: string
  connected: boolean
  accountJid?: string
  error?: string
  createdAt: number
}

const LOGIN_TTL_MS = 2 * 60 * 1000
const WAIT_FOR_QR_MS = 20_000
const sessions = new Map<string, LoginSession>()

export async function startWhatsAppLoginWithQr(options: {
  authDir: string
  force?: boolean
}): Promise<WhatsAppLoginStartResult> {
  cleanupExpiredSessions()
  const authDir = path.resolve(options.authDir)
  if (options.force) {
    closeSessionsForAuthDir(authDir)
    clearWhatsAppAuth(authDir)
  }

  const sessionKey = crypto.randomUUID()
  const session: LoginSession = {
    authDir,
    sock: undefined as unknown as WhatsAppSocket,
    connected: false,
    createdAt: Date.now(),
  }
  const qrPromise = waitForQr(session)
  const sock = await createWhatsAppSocket({
    authDir,
    onQr: (qr) => {
      session.qr = qr
    },
  })
  session.sock = sock
  sessions.set(sessionKey, session)

  sock.ev.on('connection.update', async (update) => {
    if (update.qr) {
      session.qr = update.qr
    }
    if (update.connection === 'open') {
      await waitForWhatsAppCredsSave(authDir)
      session.connected = true
      session.accountJid = sock.user?.id ?? ''
    }
    if (update.connection === 'close') {
      if (isWhatsAppLoggedOut(update.lastDisconnect?.error)) {
        session.error = 'WhatsApp session logged out. Please scan again.'
      } else if (!session.connected) {
        session.error = 'WhatsApp login connection closed. Please retry.'
      }
    }
  })

  await qrPromise
  return {
    sessionKey,
    qr: session.qr,
    message: session.qr
      ? 'Scan this QR in WhatsApp > Linked devices.'
      : 'Waiting for WhatsApp QR code...',
  }
}

export async function pollWhatsAppLoginWithQr(options: {
  sessionKey: string
}): Promise<WhatsAppLoginPollResult> {
  cleanupExpiredSessions()
  const session = sessions.get(options.sessionKey)
  if (!session) {
    return {
      connected: false,
      status: 'expired',
      message: 'WhatsApp login session expired. Generate a new QR code.',
    }
  }

  if (session.connected) {
    await waitForWhatsAppCredsSave(session.authDir)
    const accountJid = session.accountJid || session.sock.user?.id || ''
    closeWhatsAppSocket(session.sock, 'WhatsApp login complete')
    sessions.delete(options.sessionKey)
    return {
      connected: true,
      accountJid,
      authDir: session.authDir,
      message: 'WhatsApp linked successfully.',
    }
  }

  if (session.error) {
    closeWhatsAppSocket(session.sock, 'WhatsApp login error')
    sessions.delete(options.sessionKey)
    return {
      connected: false,
      status: 'error',
      message: session.error,
    }
  }

  return {
    connected: false,
    status: 'waiting',
    qr: session.qr,
    message: session.qr
      ? 'Waiting for WhatsApp scan confirmation...'
      : 'Waiting for WhatsApp QR code...',
  }
}

export async function logoutWhatsAppAuth(authDir: string): Promise<void> {
  closeSessionsForAuthDir(path.resolve(authDir))
  clearWhatsAppAuth(authDir)
}

function waitForQr(session: LoginSession): Promise<void> {
  return new Promise((resolve) => {
    const started = Date.now()
    const timer = setInterval(() => {
      if (session.qr || session.connected || Date.now() - started > WAIT_FOR_QR_MS) {
        clearInterval(timer)
        resolve()
      }
    }, 250)
  })
}

function cleanupExpiredSessions(): void {
  const now = Date.now()
  for (const [sessionKey, session] of sessions) {
    if (now - session.createdAt <= LOGIN_TTL_MS) continue
    closeWhatsAppSocket(session.sock, 'WhatsApp login expired')
    sessions.delete(sessionKey)
  }
}

function closeSessionsForAuthDir(authDir: string): void {
  for (const [sessionKey, session] of sessions) {
    if (path.resolve(session.authDir) !== authDir) continue
    closeWhatsAppSocket(session.sock, 'WhatsApp login superseded')
    sessions.delete(sessionKey)
  }
}
