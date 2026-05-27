import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'

export default function DestinationDetail() {
  const { id } = useParams()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await api.get(`/api/destinations/${id}`)
        if (!cancelled) setItem(data)
      } catch (e) {
        if (!cancelled) setErr(e.response?.data?.message || 'Failed to load destination')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) return <p className="text-slate-500">Loading…</p>
  if (err) return <p className="text-red-700">{err}</p>
  if (!item) return null

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{item.name}</h1>
          <p className="mt-1 text-slate-600">{[item.city, item.country].filter(Boolean).join(', ')}</p>
        </div>
        <Link to="/bike-rides" className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700">
          Book a bike ride
        </Link>
      </div>

      {item.description ? <p className="text-slate-700">{item.description}</p> : null}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">Featured photos</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(item.featuredPhotos || []).map((src) => (
            <img key={src} src={src} alt="" className="aspect-[16/10] w-full rounded-xl object-cover" loading="lazy" />
          ))}
        </div>
        {!item.featuredPhotos?.length ? <p className="text-slate-500">No photos yet.</p> : null}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">Featured videos</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {(item.featuredVideos || []).map((src) => (
            <video key={src} controls className="w-full rounded-xl bg-black">
              <source src={src} />
            </video>
          ))}
        </div>
        {!item.featuredVideos?.length ? <p className="text-slate-500">No videos yet.</p> : null}
      </section>
    </div>
  )
}

