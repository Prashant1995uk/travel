import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'

export default function Destinations() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await api.get('/api/destinations', { params: { limit: 50 } })
        if (!cancelled) setItems(data.items || [])
      } catch (e) {
        if (!cancelled) setErr(e.response?.data?.message || 'Failed to load destinations')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) return <p className="text-slate-500">Loading destinations…</p>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Destinations</h1>
        <p className="mt-1 text-slate-600">Explore places with featured photos and videos.</p>
      </div>
      {err && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {err}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((d) => (
          <Link
            key={d._id}
            to={`/destinations/${d._id}`}
            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow"
          >
            <div className="aspect-[16/10] bg-slate-100">
              {d.featuredPhotos?.[0] ? (
                <img
                  src={d.featuredPhotos[0]}
                  alt={d.name}
                  className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                  loading="lazy"
                />
              ) : null}
            </div>
            <div className="p-4">
              <p className="text-lg font-semibold text-slate-900">{d.name}</p>
              <p className="text-sm text-slate-600">
                {[d.city, d.country].filter(Boolean).join(', ') || '—'}
              </p>
              {d.description ? <p className="mt-2 line-clamp-2 text-sm text-slate-700">{d.description}</p> : null}
            </div>
          </Link>
        ))}
      </div>
      {!items.length && !err ? <p className="text-slate-500">No destinations yet.</p> : null}
    </div>
  )
}

