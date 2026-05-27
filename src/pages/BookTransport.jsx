import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

const types = [
  { id: 'bus', label: 'Bus' },
  { id: 'flight', label: 'Flight' },
  { id: 'car', label: 'Car' },
]

export default function BookTransport() {
  const { isAuthenticated, user } = useAuth()
  const [bookingType, setBookingType] = useState('flight')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('10:00')
  const [source, setSource] = useState('')
  const [destination, setDestination] = useState('')
  const [price, setPrice] = useState('')
  const [passengerName, setPassengerName] = useState(user?.name || '')
  const [passengerEmail, setPassengerEmail] = useState(user?.email || '')
  const [passengerPhone, setPassengerPhone] = useState('')
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
        <p className="text-slate-800">Please log in to book transport.</p>
        <Link to="/login" className="mt-4 inline-block font-semibold text-teal-700 hover:underline">
          Go to login
        </Link>
      </div>
    )
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setErr('')
    setMsg(null)
    setBusy(true)
    try {
      await api.post('/api/bookings', {
        bookingType,
        date,
        time,
        source,
        destination,
        price: Number(price),
        passengerName,
        passengerEmail,
        passengerPhone,
      })
      setMsg('Booking confirmed. View it under My trips.')
      setSource('')
      setDestination('')
      setPrice('')
    } catch (e2) {
      setErr(e2.response?.data?.message || e2.response?.data?.errors?.[0]?.msg || 'Booking failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-3xl font-bold text-slate-900">Book bus, flight, or car</h1>
      <p className="mt-2 text-slate-600">We store passenger details, route, schedule, and price in MongoDB.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {msg && (
          <div className="rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-900" role="status">
            {msg}
          </div>
        )}
        {err && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {err}
          </div>
        )}
        <div>
          <span className="text-sm font-medium text-slate-700">Type</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {types.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setBookingType(t.id)}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  bookingType === t.id
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
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
        <div>
          <label className="text-sm font-medium text-slate-700">From</label>
          <input
            required
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="City or station"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">To</label>
          <input
            required
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="City or airport"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Price (INR)</label>
          <input
            type="number"
            min="0"
            step="1"
            required
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div className="border-t border-slate-100 pt-4">
          <p className="text-sm font-semibold text-slate-800">Passenger</p>
          <div className="mt-3 grid gap-3">
            <input
              required
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Full name"
              value={passengerName}
              onChange={(e) => setPassengerName(e.target.value)}
            />
            <input
              type="email"
              required
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Email"
              value={passengerEmail}
              onChange={(e) => setPassengerEmail(e.target.value)}
            />
            <input
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Phone (optional)"
              value={passengerPhone}
              onChange={(e) => setPassengerPhone(e.target.value)}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-teal-600 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
        >
          {busy ? 'Booking…' : 'Confirm booking'}
        </button>
      </form>
    </div>
  )
}
