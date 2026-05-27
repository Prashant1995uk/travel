const places = [
  {
    slug: 'kedarnath',
    title: 'Kedarnath',
    blurb: 'High Himalayan shrine in Uttarakhand — trek, devotion, and alpine silence.',
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200',
    ],
    video: 'https://www.youtube.com/embed/KSJVVIVqs4Q',
  },
  {
    slug: 'jaipur',
    title: 'Jaipur',
    blurb: 'The Pink City — forts, bazaars, and desert royalty.',
    images: [
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200',
      'https://images.unsplash.com/photo-1477587453533-aaa64e066af7?w=1200',
    ],
    video: 'https://www.youtube.com/embed/0p7K2i_x2gs',
  },
  {
    slug: 'tungnath',
    title: 'Tungnath',
    blurb: 'World’s highest Shiva temple above Chopta meadows.',
    images: [
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200',
      'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1200',
    ],
    video: 'https://www.youtube.com/embed/8q8LmVZv8vY',
  },
  {
    slug: 'kashi',
    title: 'Kashi (Varanasi)',
    blurb: 'Ghats on the Ganges — spirituality at sunrise and aarti at dusk.',
    images: [
      'https://images.unsplash.com/photo-1548013146-72479768bada?w=1200',
      'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200',
    ],
    video: 'https://www.youtube.com/embed/8Ao5y5Lz5PY',
  },
]

export default function Gallery() {
  return (
    <div className="space-y-16">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Destination gallery</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Curated photos and short films for Kedarnath, Jaipur, Tungnath, and Kashi — swap in your own media or
          Cloudinary URLs anytime.
        </p>
      </div>

      {places.map((p) => (
        <section key={p.slug} id={p.slug} className="scroll-mt-24">
          <h2 className="text-2xl font-semibold text-slate-900">{p.title}</h2>
          <p className="mt-2 text-slate-600">{p.blurb}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {p.images.map((src) => (
              <img key={src} src={src} alt={p.title} className="aspect-video rounded-2xl object-cover shadow" />
            ))}
          </div>
          <div className="mt-6 aspect-video w-full max-w-3xl overflow-hidden rounded-2xl bg-black shadow-lg">
            <iframe
              className="h-full w-full"
              src={p.video}
              title={`${p.title} video`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>
      ))}
    </div>
  )
}
