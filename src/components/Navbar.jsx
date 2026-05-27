import { Link, NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-teal-700 text-white' : 'text-slate-700 hover:bg-slate-100'
  }`

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const [siteName, setSiteName] = useState('Nature Touch')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await api.get('/api/settings/public')
        if (!cancelled && data?.siteName) setSiteName(data.siteName)
      } catch {
        /* ignore */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="text-lg font-semibold tracking-tight text-teal-800">
          {siteName}
        </Link>
        <nav className="flex flex-wrap items-center gap-1">
          <NavLink to="/" end className={linkClass}>
            Home
          </NavLink>
          <NavLink to="/destinations" className={linkClass}>
            Destinations
          </NavLink>
          <NavLink to="/book" className={linkClass}>
            Book trip
          </NavLink>
          <NavLink to="/bike-rides" className={linkClass}>
            Bike rides
          </NavLink>
          <NavLink to="/hotels" className={linkClass}>
            Hotels
          </NavLink>
          <NavLink to="/map" className={linkClass}>
            Map & route
          </NavLink>
          <NavLink to="/gallery" className={linkClass}>
            Gallery
          </NavLink>
          <NavLink to="/feedback" className={linkClass}>
            Reviews
          </NavLink>
          <NavLink to="/contact" className={linkClass}>
            Contact
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/dashboard" className={linkClass}>
              My trips
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" className={linkClass}>
              Admin
            </NavLink>
          )}
        </nav>
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <span className="hidden text-sm text-slate-600 sm:inline">{user?.name}</span>
              <button
                type="button"
                onClick={logout}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-teal-800 hover:bg-teal-50"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
