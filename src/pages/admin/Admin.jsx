/* eslint-disable react-hooks/set-state-in-effect -- admin dashboard bootstraps lists on mount */
import { useCallback, useEffect, useState } from 'react'
import { api } from '../../api/client'

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'settings', label: 'Site settings' },
  { id: 'users', label: 'Users' },
  { id: 'bookings', label: 'Transport' },
  { id: 'bikeBookings', label: 'Bike rides' },
  { id: 'hotelBookings', label: 'Hotel stays' },
  { id: 'hotels', label: 'Hotels' },
  { id: 'destinations', label: 'Destinations' },
  { id: 'bikeListings', label: 'Bike listings' },
  { id: 'contacts', label: 'Contacts' },
  { id: 'feedbacks', label: 'Feedback' },
]

export default function Admin() {
  const [tab, setTab] = useState('overview')
  const [siteName, setSiteName] = useState('')
  const [users, setUsers] = useState({ items: [], total: 0 })
  const [bookings, setBookings] = useState({ items: [] })
  const [bikeBookings, setBikeBookings] = useState({ items: [] })
  const [hotelBookings, setHotelBookings] = useState({ items: [] })
  const [hotels, setHotels] = useState([])
  const [destinations, setDestinations] = useState([])
  const [bikes, setBikes] = useState([])
  const [contacts, setContacts] = useState({ items: [] })
  const [feedbacks, setFeedbacks] = useState({ items: [] })
  const [hotelForm, setHotelForm] = useState({
    name: '',
    location: '',
    city: '',
    country: 'India',
    pricePerNight: '',
    rating: '4',
    description: '',
  })
  const [uploadHotelId, setUploadHotelId] = useState('')
  const [file, setFile] = useState(null)
  const [destForm, setDestForm] = useState({ name: '', city: '', country: 'India', description: '' })
  const [uploadDestId, setUploadDestId] = useState('')
  const [destPhoto, setDestPhoto] = useState(null)
  const [destVideo, setDestVideo] = useState(null)
  const [bikeForm, setBikeForm] = useState({ title: '', destinationId: '', bikeType: '', price: '' })
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  const refresh = useCallback(async () => {
    try {
      const [u, b, bb, hb, h, d, bl, c, f, s] = await Promise.all([
        api.get('/api/admin/users', { params: { limit: 50 } }),
        api.get('/api/admin/bookings', { params: { limit: 50 } }),
        api.get('/api/bike/admin/bookings', { params: { limit: 50 } }),
        api.get('/api/admin/hotel-bookings', { params: { limit: 50 } }),
        api.get('/api/hotels', { params: { limit: 100 } }),
        api.get('/api/destinations/admin/list', { params: { limit: 200 } }),
        api.get('/api/bike/admin/bikes'),
        api.get('/api/admin/contacts', { params: { limit: 50 } }),
        api.get('/api/admin/feedbacks', { params: { limit: 50 } }),
        api.get('/api/admin/settings/site-name'),
      ])
      setErr('')
      setUsers(u.data)
      setBookings(b.data)
      setBikeBookings(bb.data)
      setHotelBookings(hb.data)
      setHotels(h.data.items || [])
      setDestinations(d.data.items || [])
      setBikes(bl.data.items || [])
      setContacts(c.data)
      setFeedbacks(f.data)
      setSiteName(s.data?.siteName || '')
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed to load admin data')
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const setRole = async (id, role) => {
    await api.patch(`/api/admin/users/${id}/role`, { role })
    await refresh()
  }

  const setBlocked = async (id, blocked) => {
    await api.patch(`/api/admin/users/${id}/block`, { blocked })
    await refresh()
  }

  const removeUser = async (id) => {
    if (!confirm('Delete this user?')) return
    await api.delete(`/api/admin/users/${id}`)
    await refresh()
  }

  const setBookingStatus = async (id, status) => {
    await api.patch(`/api/admin/bookings/${id}/status`, { status })
    await refresh()
  }

  const setBikeBookingStatus = async (id, status) => {
    await api.patch(`/api/bike/admin/bookings/${id}/status`, { status })
    await refresh()
  }

  const setHBStatus = async (id, status) => {
    await api.patch(`/api/admin/hotel-bookings/${id}/status`, { status })
    await refresh()
  }

  const saveSiteName = async (e) => {
    e.preventDefault()
    await api.patch('/api/admin/settings/site-name', { siteName })
    setMsg('Website name updated')
    await refresh()
  }

  const createHotel = async (e) => {
    e.preventDefault()
    setMsg('')
    try {
      await api.post('/api/admin/hotels', {
        ...hotelForm,
        pricePerNight: Number(hotelForm.pricePerNight),
        rating: Number(hotelForm.rating),
      })
      setMsg('Hotel created')
      setHotelForm({
        name: '',
        location: '',
        city: '',
        country: 'India',
        pricePerNight: '',
        rating: '4',
        description: '',
      })
      await refresh()
    } catch (e2) {
      setErr(e2.response?.data?.message || 'Create failed')
    }
  }

  const removeHotel = async (id) => {
    if (!confirm('Delete hotel and related stay records?')) return
    await api.delete(`/api/admin/hotels/${id}`)
    await refresh()
  }

  const uploadImage = async (e) => {
    e.preventDefault()
    if (!uploadHotelId || !file) return
    const fd = new FormData()
    fd.append('image', file)
    await api.post(`/api/admin/hotels/${uploadHotelId}/images`, fd)
    setFile(null)
    setMsg('Image uploaded')
    await refresh()
  }

  const createDestination = async (e) => {
    e.preventDefault()
    setMsg('')
    await api.post('/api/destinations', destForm)
    setDestForm({ name: '', city: '', country: 'India', description: '' })
    setMsg('Destination created')
    await refresh()
  }

  const removeDestination = async (id) => {
    if (!confirm('Delete destination?')) return
    await api.delete(`/api/destinations/${id}`)
    await refresh()
  }

  const uploadDestPhoto = async (e) => {
    e.preventDefault()
    if (!uploadDestId || !destPhoto) return
    const fd = new FormData()
    fd.append('image', destPhoto)
    await api.post(`/api/destinations/${uploadDestId}/featured-photo`, fd)
    setDestPhoto(null)
    setMsg('Featured photo uploaded')
    await refresh()
  }

  const uploadDestVideo = async (e) => {
    e.preventDefault()
    if (!uploadDestId || !destVideo) return
    const fd = new FormData()
    fd.append('media', destVideo)
    await api.post(`/api/destinations/${uploadDestId}/featured-video`, fd)
    setDestVideo(null)
    setMsg('Featured video uploaded')
    await refresh()
  }

  const createBike = async (e) => {
    e.preventDefault()
    setMsg('')
    await api.post('/api/bike/admin/bikes', { ...bikeForm, price: Number(bikeForm.price) })
    setBikeForm({ title: '', destinationId: '', bikeType: '', price: '' })
    setMsg('Bike listing created')
    await refresh()
  }

  const removeBike = async (id) => {
    if (!confirm('Delete bike listing?')) return
    await api.delete(`/api/bike/admin/bikes/${id}`)
    await refresh()
  }

  const approveFeedback = async (id, approved) => {
    await api.patch(`/api/admin/feedbacks/${id}/approve`, { approved })
    await refresh()
  }

  const removeFeedback = async (id) => {
    if (!confirm('Remove this feedback?')) return
    await api.delete(`/api/admin/feedbacks/${id}`)
    await refresh()
  }

  const removeContact = async (id) => {
    if (!confirm('Remove this contact message?')) return
    await api.delete(`/api/admin/contacts/${id}`)
    await refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-slate-900">Admin</h1>
        <button
          type="button"
          onClick={refresh}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50"
        >
          Refresh data
        </button>
      </div>
      {msg && <p className="text-sm text-teal-800">{msg}</p>}
      {err && <p className="text-sm text-red-700">{err}</p>}

      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-3 py-2 text-sm font-medium ${
              tab === t.id ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Users', users.total],
            ['Transport bookings', bookings.items?.length ?? 0],
            ['Bike rides', bikeBookings.items?.length ?? 0],
            ['Hotel stays', hotelBookings.items?.length ?? 0],
            ['Hotels listed', hotels.length],
          ].map(([label, n]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-600">{label}</p>
              <p className="text-2xl font-bold text-slate-900">{n}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'settings' && (
        <form
          onSubmit={saveSiteName}
          className="max-w-xl space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <h2 className="font-semibold text-slate-900">Website name</h2>
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            placeholder="Nature Touch"
            required
          />
          <button type="submit" className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white">
            Save
          </button>
          <p className="text-xs text-slate-500">Navbar updates dynamically from the backend setting.</p>
        </form>
      )}

      {tab === 'users' && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.items?.map((u) => (
                <tr key={u._id} className="border-t border-slate-100">
                  <td className="px-4 py-2">{u.name}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">{u.role}</td>
                  <td className="px-4 py-2">{u.isBlocked ? 'blocked' : 'active'}</td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        className="text-teal-700 hover:underline"
                        onClick={() => setRole(u._id, u.role === 'admin' ? 'user' : 'admin')}
                      >
                        Toggle admin
                      </button>
                      <button
                        type="button"
                        className="text-amber-700 hover:underline"
                        onClick={() => setBlocked(u._id, !u.isBlocked)}
                      >
                        {u.isBlocked ? 'Unblock' : 'Block'}
                      </button>
                      <button type="button" className="text-red-600 hover:underline" onClick={() => removeUser(u._id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'bookings' && (
        <ul className="space-y-2">
          {bookings.items?.map((b) => (
            <li key={b._id} className="rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
              <p className="font-medium">
                {b.bookingType} · {b.user?.email} · ₹{b.price} · {b.status}
              </p>
              <p className="text-slate-600">
                {b.source} → {b.destination} · {new Date(b.date).toLocaleDateString()} {b.time}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {['pending', 'confirmed', 'cancelled'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setBookingStatus(b._id, s)}
                    className="rounded border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}

      {tab === 'bikeBookings' && (
        <ul className="space-y-2">
          {bikeBookings.items?.map((b) => (
            <li key={b._id} className="rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
              <p className="font-medium">
                {b.bike?.title} · {b.user?.email} · ₹{b.price} · {b.status}
              </p>
              <p className="text-slate-600">
                {b.destination?.name} · {new Date(b.date).toLocaleDateString()} {b.time}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {['pending', 'approved', 'cancelled'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setBikeBookingStatus(b._id, s)}
                    className="rounded border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </li>
          ))}
          {!bikeBookings.items?.length ? <p className="text-sm text-slate-500">No bike bookings yet.</p> : null}
        </ul>
      )}

      {tab === 'hotelBookings' && (
        <ul className="space-y-2">
          {hotelBookings.items?.map((b) => (
            <li key={b._id} className="rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
              <p className="font-medium">
                {b.hotel?.name} · {b.user?.email} · ₹{b.totalPrice} · {b.status}
              </p>
              <p className="text-slate-600">
                {new Date(b.checkIn).toLocaleDateString()} – {new Date(b.checkOut).toLocaleDateString()}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {['pending', 'confirmed', 'cancelled'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setHBStatus(b._id, s)}
                    className="rounded border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}

      {tab === 'hotels' && (
        <div className="grid gap-8 lg:grid-cols-2">
          <form onSubmit={createHotel} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="font-semibold text-slate-900">Create hotel</h2>
            {['name', 'location', 'city', 'country', 'pricePerNight', 'rating', 'description'].map((field) => (
              <input
                key={field}
                required={field !== 'description' && field !== 'city'}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder={field}
                value={hotelForm[field]}
                onChange={(e) => setHotelForm((h) => ({ ...h, [field]: e.target.value }))}
              />
            ))}
            <button type="submit" className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white">
              Create
            </button>
          </form>
          <form onSubmit={uploadImage} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="font-semibold text-slate-900">Upload hotel image (Multer)</h2>
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={uploadHotelId}
              onChange={(e) => setUploadHotelId(e.target.value)}
              required
            >
              <option value="">Select hotel</option>
              {hotels.map((h) => (
                <option key={h._id} value={h._id}>
                  {h.name}
                </option>
              ))}
            </select>
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <button type="submit" className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white">
              Upload
            </button>
          </form>
          <ul className="space-y-2 lg:col-span-2">
            {hotels.map((h) => (
              <li
                key={h._id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-sm"
              >
                <span>
                  {h.name} — ₹{h.pricePerNight}/night · ★{h.rating}
                </span>
                <button type="button" className="text-red-600 hover:underline" onClick={() => removeHotel(h._id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === 'destinations' && (
        <div className="grid gap-8 lg:grid-cols-2">
          <form onSubmit={createDestination} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="font-semibold text-slate-900">Create destination</h2>
            {['name', 'city', 'country'].map((field) => (
              <input
                key={field}
                required={field === 'name'}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder={field}
                value={destForm[field]}
                onChange={(e) => setDestForm((d) => ({ ...d, [field]: e.target.value }))}
              />
            ))}
            <textarea
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="description"
              value={destForm.description}
              onChange={(e) => setDestForm((d) => ({ ...d, description: e.target.value }))}
            />
            <button type="submit" className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white">
              Create
            </button>
          </form>

          <div className="space-y-4">
            <form onSubmit={uploadDestPhoto} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="font-semibold text-slate-900">Upload featured photo</h2>
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={uploadDestId}
                onChange={(e) => setUploadDestId(e.target.value)}
                required
              >
                <option value="">Select destination</option>
                {destinations.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <input type="file" accept="image/*" onChange={(e) => setDestPhoto(e.target.files?.[0] || null)} />
              <button type="submit" className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white">
                Upload
              </button>
            </form>

            <form onSubmit={uploadDestVideo} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="font-semibold text-slate-900">Upload featured video</h2>
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={uploadDestId}
                onChange={(e) => setUploadDestId(e.target.value)}
                required
              >
                <option value="">Select destination</option>
                {destinations.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <input type="file" accept="video/*" onChange={(e) => setDestVideo(e.target.files?.[0] || null)} />
              <button type="submit" className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white">
                Upload
              </button>
              <p className="text-xs text-slate-500">Video upload limit: 25MB</p>
            </form>
          </div>

          <ul className="space-y-2 lg:col-span-2">
            {destinations.map((d) => (
              <li
                key={d._id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-sm"
              >
                <span>
                  {d.name} — {[d.city, d.country].filter(Boolean).join(', ')}
                </span>
                <button type="button" className="text-red-600 hover:underline" onClick={() => removeDestination(d._id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === 'bikeListings' && (
        <div className="grid gap-8 lg:grid-cols-2">
          <form onSubmit={createBike} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="font-semibold text-slate-900">Create bike listing</h2>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="title"
              value={bikeForm.title}
              onChange={(e) => setBikeForm((b) => ({ ...b, title: e.target.value }))}
              required
            />
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={bikeForm.destinationId}
              onChange={(e) => setBikeForm((b) => ({ ...b, destinationId: e.target.value }))}
              required
            >
              <option value="">Select destination</option>
              {destinations.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="bike type (e.g. Cruiser)"
              value={bikeForm.bikeType}
              onChange={(e) => setBikeForm((b) => ({ ...b, bikeType: e.target.value }))}
              required
            />
            <input
              type="number"
              min="0"
              step="1"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="price (INR)"
              value={bikeForm.price}
              onChange={(e) => setBikeForm((b) => ({ ...b, price: e.target.value }))}
              required
            />
            <button type="submit" className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white">
              Create
            </button>
          </form>

          <ul className="space-y-2">
            {bikes.map((b) => (
              <li
                key={b._id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-sm"
              >
                <span>
                  {b.title} ({b.bikeType}) — {b.destination?.name} · ₹{b.price}
                </span>
                <button type="button" className="text-red-600 hover:underline" onClick={() => removeBike(b._id)}>
                  Delete
                </button>
              </li>
            ))}
            {!bikes.length ? <p className="text-sm text-slate-500">No bike listings yet.</p> : null}
          </ul>
        </div>
      )}

      {tab === 'contacts' && (
        <ul className="space-y-2">
          {contacts.items?.map((c) => (
            <li key={c._id} className="rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
              <p className="font-medium">
                {c.name} &lt;{c.email}&gt;
              </p>
              <p className="text-slate-700">{c.message}</p>
              <p className="text-xs text-slate-500">{new Date(c.createdAt).toLocaleString()}</p>
              <button type="button" className="mt-2 text-red-600 hover:underline" onClick={() => removeContact(c._id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      {tab === 'feedbacks' && (
        <ul className="space-y-2">
          {feedbacks.items?.map((f) => (
            <li key={f._id} className="rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
              <p className="text-amber-600">★ {f.rating}</p>
              <p className="text-slate-800">{f.comment}</p>
              <p className="mt-1 text-xs text-slate-500">Status: {f.approved ? 'approved' : 'pending'}</p>
              <p className="text-xs text-slate-500">
                {(f.user?.email || f.email || 'guest') + ' · ' + new Date(f.createdAt).toLocaleString()}
              </p>
              <div className="mt-2 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="text-teal-700 hover:underline"
                  onClick={() => approveFeedback(f._id, !f.approved)}
                >
                  {f.approved ? 'Unapprove' : 'Approve'}
                </button>
                <button type="button" className="text-red-600 hover:underline" onClick={() => removeFeedback(f._id)}>
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
