import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function Feedback() {
  const { isAuthenticated, user } = useAuth()
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [list, setList] = useState([])
  const [busy, setBusy] = useState(false)

  const load = async () => {
    try {
      const { data } = await api.get('/api/feedback', { params: { limit: 20 } })
      setList(data.items || [])
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    if (user) {
      setName(user.name)
      setEmail(user.email)
    }
  }, [user])

  const onSubmit = async (e) => {
    e.preventDefault()
    setErr('')
    setMsg('')
    setBusy(true)
    try {
      const body = { rating: Number(rating), comment, category: 'general' }
      if (!isAuthenticated) {
        body.name = name
        body.email = email
      }
      await api.post('/api/feedback', body)
      setMsg('Thanks — your review was saved.')
      setComment('')
      await load()
    } catch (e2) {
      setErr(e2.response?.data?.message || e2.response?.data?.errors?.[0]?.msg || 'Could not submit')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Reviews & feedback</h1>
        <p className="mt-2 text-slate-600">Ratings and comments are stored in MongoDB.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {msg && <p className="text-sm text-teal-800">{msg}</p>}
          {err && <p className="text-sm text-red-700">{err}</p>}
          {!isAuthenticated && (
            <>
              <input
                required
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                type="email"
                required
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </>
          )}
          <div>
            <label className="text-sm font-medium text-slate-700">Rating</label>
            <input
              type="range"
              min={1}
              max={5}
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="mt-2 w-full"
            />
            <p className="text-sm text-slate-600">{rating} / 5</p>
          </div>
          <textarea
            required
            rows={4}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Tell us about your experience"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-teal-600 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
          >
            {busy ? 'Sending…' : 'Submit feedback'}
          </button>
        </form>
      </div>
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Recent reviews</h2>
        <ul className="mt-4 space-y-3">
          {list.map((f) => (
            <li key={f._id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-amber-600">★ {f.rating}/5</p>
              <p className="mt-1 text-slate-800">{f.comment}</p>
              <p className="mt-2 text-xs text-slate-500">
                {(f.user?.name || f.name || 'Guest') +
                  ' · ' +
                  new Date(f.createdAt).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
