import { useState } from 'react'
import { api } from '../api/client'

export default function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setErr('')
    setMsg('')
    setBusy(true)
    try {
      const { data } = await api.post('/api/contact', { name, email, message })
      setMsg(data.message || 'Sent.')
      setMessage('')
    } catch (e2) {
      setErr(e2.response?.data?.message || e2.response?.data?.errors?.[0]?.msg || 'Failed to send')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-3xl font-bold text-slate-900">Contact us</h1>
      <p className="mt-2 text-slate-600">Name, email, and message are persisted for your team to follow up.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {msg && <p className="text-sm text-teal-800">{msg}</p>}
        {err && <p className="text-sm text-red-700">{err}</p>}
        <div>
          <label className="text-sm font-medium text-slate-700" htmlFor="cname">
            Name
          </label>
          <input
            id="cname"
            required
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700" htmlFor="cemail">
            Email
          </label>
          <input
            id="cemail"
            type="email"
            required
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700" htmlFor="cmsg">
            Message
          </label>
          <textarea
            id="cmsg"
            required
            rows={5}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-teal-600 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
        >
          {busy ? 'Sending…' : 'Send message'}
        </button>
      </form>
    </div>
  )
}
