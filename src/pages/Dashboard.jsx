import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'

export default function Dashboard() {
  const [transport, setTransport] = useState({ items: [] })
  const [stays, setStays] = useState({ items: [] })
  const [bikeBookings, setBikeBookings] = useState({ items: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [b, h] = await Promise.all([
          api.get('/api/bookings', { params: { limit: 20 } }),
          api.get('/api/hotel-bookings', { params: { limit: 20 } }),
        ])
        if (!cancelled) {
          setTransport(b.data)
          setStays(h.data)
        }
        const bb = await api.get('/api/bike/bookings', { params: { limit: 20 } })
        if (!cancelled) setBikeBookings(bb.data)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const cancelTransport = async (id) => {
    if (!confirm('Cancel this booking?')) return
    await api.patch(`/api/bookings/${id}/cancel`)
    const { data } = await api.get('/api/bookings', { params: { limit: 20 } })
    setTransport(data)
  }

  if (loading) {
    return <p className="text-slate-500">Loading your trips…</p>
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My trips</h1>
          <p className="mt-1 text-slate-600">Transport and hotel reservations tied to your account.</p>
        </div>
        <Link
          to="/book"
          className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
        >
          New transport booking
        </Link>
      </div>

      <section>
        <h2 className="text-xl font-semibold text-slate-900">Bus, flight & car</h2>
        <ul className="mt-4 space-y-3">
          {transport.items?.length ? (
            transport.items.map((b) => (
              <li
                key={b._id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div>
                  <p className="font-medium capitalize text-slate-900">{b.bookingType}</p>
                  <p className="text-sm text-slate-600">
                    {b.source} → {b.destination}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(b.date).toLocaleDateString()} {b.time} · ₹{b.price} · {b.status}
                  </p>
                </div>
                {b.status !== 'cancelled' && (
                  <button
                    type="button"
                    onClick={() => cancelTransport(b._id)}
                    className="text-sm font-medium text-red-600 hover:underline"
                  >
                    Cancel
                  </button>
                )}
              </li>
            ))
          ) : (
            <p className="text-slate-500">No transport bookings yet.</p>
          )}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-900">Hotel stays</h2>
        <ul className="mt-4 space-y-3">
          {stays.items?.length ? (
            stays.items.map((b) => (
              <li key={b._id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="font-medium text-slate-900">{b.hotel?.name}</p>
                <p className="text-sm text-slate-600">{b.hotel?.location}</p>
                <p className="text-xs text-slate-500">
                  {new Date(b.checkIn).toLocaleDateString()} – {new Date(b.checkOut).toLocaleDateString()} ·{' '}
                  {b.guests} guests · ₹{b.totalPrice} · {b.status}
                </p>
              </li>
            ))
          ) : (
            <p className="text-slate-500">No hotel stays yet.</p>
          )}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-900">Bike rides</h2>
        <ul className="mt-4 space-y-3">
          {bikeBookings.items?.length ? (
            bikeBookings.items.map((b) => (
              <li key={b._id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="font-medium text-slate-900">{b.bike?.title}</p>
                <p className="text-sm text-slate-600">{b.destination?.name}</p>
                <p className="text-xs text-slate-500">
                  {new Date(b.date).toLocaleDateString()} {b.time} · ₹{b.price} · {b.status}
                </p>
              </li>
            ))
          ) : (
            <p className="text-slate-500">No bike rides yet.</p>
          )}
        </ul>
      </section>
    </div>
  )
}
