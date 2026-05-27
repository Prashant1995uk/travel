import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'

export default function Hotels() {
  const [draft, setDraft] = useState({ q: '', minPrice: '', maxPrice: '', minRating: '' })
  const [filters, setFilters] = useState({ q: '', minPrice: '', maxPrice: '', minRating: '' })
  const [page, setPage] = useState(1)
  const [data, setData] = useState({ items: [], pages: 1 })
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setErr('')
      try {
        const params = { page, limit: 9 }
        if (filters.q.trim()) params.q = filters.q.trim()
        if (filters.minPrice !== '') params.minPrice = filters.minPrice
        if (filters.maxPrice !== '') params.maxPrice = filters.maxPrice
        if (filters.minRating !== '') params.minRating = filters.minRating
        const { data: d } = await api.get('/api/hotels', { params })
        if (!cancelled) setData(d)
      } catch (e) {
        if (!cancelled) setErr(e.response?.data?.message || 'Failed to load hotels')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [page, filters])

  const search = (e) => {
    e.preventDefault()
    setFilters({ ...draft })
    setPage(1)
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">Hotels</h1>
      <p className="mt-2 text-slate-600">Search, filter by price and rating, then book a stay.</p>

      <form
        onSubmit={search}
        className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:flex-wrap md:items-end"
      >
        <div className="min-w-[200px] flex-1">
          <label className="text-xs font-medium text-slate-600">Search</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Name, city, location"
            value={draft.q}
            onChange={(e) => setDraft((d) => ({ ...d, q: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Min ₹</label>
          <input
            type="number"
            min="0"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm md:w-28"
            value={draft.minPrice}
            onChange={(e) => setDraft((d) => ({ ...d, minPrice: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Max ₹</label>
          <input
            type="number"
            min="0"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm md:w-28"
            value={draft.maxPrice}
            onChange={(e) => setDraft((d) => ({ ...d, maxPrice: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Min rating</label>
          <input
            type="number"
            min="0"
            max="5"
            step="0.1"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm md:w-28"
            value={draft.minRating}
            onChange={(e) => setDraft((d) => ({ ...d, minRating: e.target.value }))}
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
        >
          Apply
        </button>
      </form>

      {err && <p className="mt-4 text-sm text-red-600">{err}</p>}
      {loading ? (
        <p className="mt-8 text-slate-500">Loading hotels…</p>
      ) : (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((h) => (
            <li
              key={h._id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="aspect-[4/3] bg-slate-100">
                {h.images?.[0] ? (
                  <img src={h.images[0]} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-400">No image</div>
                )}
              </div>
              <div className="p-4">
                <h2 className="font-semibold text-slate-900">{h.name}</h2>
                <p className="text-sm text-slate-600">{h.location}</p>
                <p className="mt-2 text-sm">
                  <span className="font-medium text-teal-800">₹{h.pricePerNight}</span>
                  <span className="text-slate-500"> / night</span>
                  <span className="ml-2 text-amber-600">★ {h.rating?.toFixed?.(1) ?? h.rating}</span>
                </p>
                <Link
                  to={`/hotels/${h._id}`}
                  className="mt-3 inline-block text-sm font-semibold text-teal-700 hover:underline"
                >
                  View & book →
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}

      {data.pages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-slate-200 px-3 py-1 text-sm disabled:opacity-40"
          >
            Previous
          </button>
          <span className="px-2 py-1 text-sm text-slate-600">
            Page {page} of {data.pages}
          </span>
          <button
            type="button"
            disabled={page >= data.pages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-slate-200 px-3 py-1 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
