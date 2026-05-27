import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function HotelDetail() {
  const { id } = useParams()
  const { isAuthenticated, user } = useAuth()
  const [hotel, setHotel] = useState(null)
  const [err, setErr] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(2)
  const [guestName, setGuestName] = useState(user?.name || '')
  const [guestEmail, setGuestEmail] = useState(user?.email || '')
  const [guestPhone, setGuestPhone] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await api.get(`/api/hotels/${id}`)
        if (!cancelled) setHotel(data)
      } catch (e) {
        if (!cancelled) setErr(e.response?.data?.message || 'Hotel not found')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    if (user) {
      setGuestName(user.name)
      setGuestEmail(user.email)
    }
  }, [user])

  const onBook = async (e) => {
    e.preventDefault()
    setMsg('')
    setBusy(true)
    try {
      await api.post('/api/hotel-bookings', {
        hotelId: id,
        checkIn,
        checkOut,
        guests,
        guestName,
        guestEmail,
        guestPhone,
      })
      setMsg('Hotel stay booked. See My trips.')
    } catch (e2) {
      setMsg(e2.response?.data?.message || e2.response?.data?.errors?.[0]?.msg || 'Booking failed')
    } finally {
      setBusy(false)
    }
  }

  if (err) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-red-800">
        {err}{' '}
        <Link to="/hotels" className="font-semibold underline">
          Back to hotels
        </Link>
      </div>
    )
  }
  if (!hotel) {
    return <p className="text-slate-500">Loading…</p>
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">{hotel.name}</h1>
        <p className="mt-1 text-slate-600">{hotel.location}</p>
        <p className="mt-2 text-lg">
          <span className="font-semibold text-teal-800">₹{hotel.pricePerNight}</span>
          <span className="text-slate-500"> / night</span>
          <span className="ml-3 text-amber-600">★ {hotel.rating}</span>
        </p>
        {hotel.description && <p className="mt-4 text-slate-700">{hotel.description}</p>}
        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {(hotel.images || []).map((src) => (
            <img key={src} src={src} alt="" className="aspect-video rounded-lg object-cover" />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Book this hotel</h2>
        {!isAuthenticated ? (
          <p className="mt-4 text-sm text-slate-600">
            <Link to="/login" className="font-semibold text-teal-700 hover:underline">
              Log in
            </Link>{' '}
            to reserve your dates.
          </p>
        ) : (
          <form onSubmit={onBook} className="mt-4 space-y-3">
            {msg && (
              <div
                className={`rounded-lg px-3 py-2 text-sm ${
                  msg.includes('failed') || msg.includes('Invalid')
                    ? 'bg-red-50 text-red-800'
                    : 'bg-teal-50 text-teal-900'
                }`}
              >
                {msg}
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-slate-600">Check-in</label>
                <input
                  type="date"
                  required
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Check-out</label>
                <input
                  type="date"
                  required
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Guests</label>
              <input
                type="number"
                min={1}
                required
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
              />
            </div>
            <input
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Guest name"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
            />
            <input
              type="email"
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
            />
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Phone"
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
            />
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-teal-600 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
            >
              {busy ? 'Booking…' : 'Confirm stay'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
