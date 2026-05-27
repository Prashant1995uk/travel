import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-600 px-8 py-16 text-white shadow-xl">
        <p className="text-sm font-medium uppercase tracking-widest text-teal-100">MERN travel stack</p>
        <h1 className="mt-2 max-w-xl text-4xl font-bold leading-tight md:text-5xl">
          Book buses, flights, cars & stays in one calm place.
        </h1>
        <p className="mt-4 max-w-lg text-lg text-teal-50">
          JWT-secured accounts, MongoDB-backed bookings, OpenStreetMap routing, and real-time support chat.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/register"
            className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-teal-800 shadow hover:bg-teal-50"
          >
            Create account
          </Link>
          <Link
            to="/hotels"
            className="rounded-xl border border-white/40 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
          >
            Browse hotels
          </Link>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {[
          { title: 'Transport', desc: 'Bus, flight & car bookings with passenger details.', to: '/book' },
          { title: 'Stays', desc: 'Search hotels with filters, ratings, and secure checkout.', to: '/hotels' },
          { title: 'Routes', desc: 'OSM map, your location, and turn-by-turn polyline.', to: '/map' },
        ].map((c) => (
          <Link
            key={c.title}
            to={c.to}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-teal-200 hover:shadow-md"
          >
            <h2 className="text-lg font-semibold text-slate-900">{c.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{c.desc}</p>
            <span className="mt-4 inline-block text-sm font-medium text-teal-700">Explore →</span>
          </Link>
        ))}
      </section>
    </div>
  )
}
