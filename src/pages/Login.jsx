import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/dashboard'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(email, password)
      navigate(from || '/dashboard', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
      <p className="mt-1 text-sm text-slate-600">
        No account?{' '}
        <Link to="/register" className="font-medium text-teal-700 hover:underline">
          Sign up
        </Link>
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}
        <div>
          <label className="text-sm font-medium text-slate-700" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-teal-600 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
        >
          {busy ? 'Signing in…' : 'Log in'}
        </button>
      </form>
      <p className="mt-4 text-xs text-slate-500">
        Demo: <code className="rounded bg-slate-100 px-1">demo@travelbook.com</code> /{' '}
        <code className="rounded bg-slate-100 px-1">Password123</code>
      </p>
    </div>
  )
}
