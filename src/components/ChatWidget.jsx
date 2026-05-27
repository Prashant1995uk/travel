import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { api, getSocketUrl } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function ChatWidget() {
  const { token, user } = useAuth()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [connected, setConnected] = useState(false)
  const socketRef = useRef(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await api.get('/api/messages', { params: { limit: 40 } })
        if (!cancelled) setMessages(data.items || [])
      } catch {
        /* ignore */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
      return
    }
    const s = io(getSocketUrl(), {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      auth: token ? { token } : {},
    })
    socketRef.current = s
    s.on('connect', () => setConnected(true))
    s.on('disconnect', () => setConnected(false))
    s.on('chat:message', (msg) => {
      setMessages((m) => [...m, msg])
    })
    return () => {
      s.disconnect()
      socketRef.current = null
    }
  }, [open, token])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const send = () => {
    const t = text.trim()
    if (!t || !socketRef.current) return
    socketRef.current.emit('chat:message', { text: t, senderName: user?.name || 'Guest' })
    setText('')
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-40 rounded-full bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-teal-700"
        aria-expanded={open}
      >
        {open ? 'Close chat' : 'Support chat'}
      </button>
      {open && (
        <div className="fixed bottom-24 right-6 z-40 flex w-[min(100vw-2rem,22rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-100 bg-teal-50 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-teal-900">Live support</p>
              <p className="text-xs text-teal-700">
                {connected ? 'Connected' : 'Connecting…'}
              </p>
            </div>
          </div>
          <div className="h-64 space-y-2 overflow-y-auto px-3 py-2 text-sm">
            {messages.length === 0 && (
              <p className="text-slate-500">Say hello — messages sync in real time.</p>
            )}
            {messages.map((m) => (
              <div key={m.id || `${m.createdAt}-${m.text}`} className="rounded-lg bg-slate-50 px-3 py-2">
                <p className="text-xs font-medium text-teal-800">{m.senderName}</p>
                <p className="text-slate-800">{m.text}</p>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="flex gap-2 border-t border-slate-100 p-2">
            <input
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500"
              placeholder="Type a message…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
            />
            <button
              type="button"
              onClick={send}
              className="rounded-lg bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  )
}
