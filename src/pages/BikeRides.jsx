import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function BikeRides() {
  const { isAuthenticated } = useAuth()
  const [bikes, setBikes] = useState([])
  const [destinationId, setDestinationId] = useState('')
  const [bikeId, setBikeId] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('09:00')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await api.get('/api/bike/bikes')
        if (!cancelled) setBikes(data.items || [])
      } catch (e) {
        if (!cancelled) setErr(e.response?.data?.message || 'Failed to load bike listings')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const destinations = useMemo(() => {
    const map = new Map()
    for (const b of bikes) {
      const d = b.destination
      if (d?._id && !map.has(d._id)) map.set(d._id, d)
    }
    return [...map.values()]
  }, [bikes])

  const filteredBikes = useMemo(() => {
    return bikes.filter((b) => (destinationId ? b.destination?._id === destinationId : true))
  }, [bikes, destinationId])

  const selectedBike = useMemo(() => bikes.find((b) => b._id === bikeId) || null, [bikes, bikeId])

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) return
    setErr('')
    setMsg('')
    setBusy(true)
    try {
      await api.post('/api/bike/bookings', { destinationId, bikeId, date, time })
      setMsg('Bike ride requested. An admin will approve or cancel it.')
      setBikeId('')
    } catch (e2) {
      setErr(e2.response?.data?.message || e2.response?.data?.errors?.[0]?.msg || 'Booking failed')
    } finally {
      setBusy(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
        <p className="text-slate-800">Please log in to book bike rides.</p>
        <Link to="/login" className="mt-4 inline-block font-semibold text-teal-700 hover:underline">
          Go to login
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">🏍️ Bike ride booking</h1>
        <p className="mt-1 text-slate-600">Pick a destination, a bike, and a time slot. Pricing is shown before booking.</p>
      </div>

      {msg ? (
        <div className="rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-900" role="status">
          {msg}
        </div>
      ) : null}
      {err ? (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {err}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">Destination</label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={destinationId}
              onChange={(e) => {
                setDestinationId(e.target.value)
                setBikeId('')
              }}
              required
            >
              <option value="">Select destination</option>
              {destinations.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Bike</label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={bikeId}
              onChange={(e) => setBikeId(e.target.value)}
              required
              disabled={!destinationId}
            >
              <option value="">Select bike</option>
              {filteredBikes.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.title} ({b.bikeType}) — ₹{b.price}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">Date</label>
            <input
              type="date"
              required
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Time</label>
            <input
              type="time"
              required
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-xl bg-slate-50 p-4 text-sm">
          <p className="font-semibold text-slate-800">Pricing</p>
          <p className="mt-1 text-slate-700">
            {selectedBike ? (
              <>
                {selectedBike.title} — <span className="font-semibold">₹{selectedBike.price}</span> per ride slot
              </>
            ) : (
              'Select a bike to see price.'
            )}
          </p>
        </div>

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-teal-600 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
        >
          {busy ? 'Submitting…' : 'Request booking'}
        </button>
      </form>
    </div>
  )
}

