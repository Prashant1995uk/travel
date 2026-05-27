import { useCallback, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})

async function geocode(query) {
  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('q', query)
  url.searchParams.set('format', 'json')
  url.searchParams.set('limit', '1')
  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
  })
  const data = await res.json()
  if (!data?.length) return null
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), label: data[0].display_name }
}

async function fetchRoute(from, to) {
  const url = `https://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=full&geometries=geojson`
  const res = await fetch(url)
  const data = await res.json()
  if (data.code !== 'Ok' || !data.routes?.[0]) return null
  const coords = data.routes[0].geometry.coordinates.map(([lon, lat]) => [lat, lon])
  return { coords, distance: data.routes[0].distance, duration: data.routes[0].duration }
}

function LocationPicker({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export default function MapRoute() {
  const [sourceQ, setSourceQ] = useState('Jaipur, India')
  const [destQ, setDestQ] = useState('Delhi, India')
  const [source, setSource] = useState(null)
  const [dest, setDest] = useState(null)
  const [route, setRoute] = useState(null)
  const [userLoc, setUserLoc] = useState(null)
  const [status, setStatus] = useState('')
  const [pickMode, setPickMode] = useState(null)

  const center = useMemo(() => {
    if (source && dest) {
      return [(source.lat + dest.lat) / 2, (source.lon + dest.lon) / 2]
    }
    if (source) return [source.lat, source.lon]
    if (userLoc) return [userLoc.lat, userLoc.lon]
    return [20.5937, 78.9629]
  }, [source, dest, userLoc])

  const zoom = source && dest ? 6 : 5

  const runGeocodeAndRoute = useCallback(async () => {
    setStatus('Geocoding…')
    setRoute(null)
    try {
      const [a, b] = await Promise.all([geocode(sourceQ), geocode(destQ)])
      if (!a || !b) {
        setStatus('Could not find one or both places. Try more specific names.')
        return
      }
      setSource(a)
      setDest(b)
      setStatus('Fetching route…')
      const r = await fetchRoute(a, b)
      if (!r) {
        setStatus('No driving route found between these points.')
        return
      }
      setRoute(r)
      const km = (r.distance / 1000).toFixed(1)
      const min = Math.round(r.duration / 60)
      setStatus(`Route: ~${km} km, ~${min} min driving (OSRM demo)`)
    } catch {
      setStatus('Network error. Try again or check CORS / connectivity.')
    }
  }, [sourceQ, destQ])

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setStatus('Geolocation not supported in this browser.')
      return
    }
    setStatus('Locating you…')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setUserLoc({ lat: latitude, lon: longitude, label: 'You are here' })
        setStatus('Current location added to the map.')
      },
      () => setStatus('Could not read your location (permission denied?).')
    )
  }

  const onMapPick = (lat, lng) => {
    if (pickMode === 'source') {
      setSource({ lat, lon: lng, label: 'Picked start' })
      setPickMode(null)
    } else if (pickMode === 'dest') {
      setDest({ lat, lon: lng, label: 'Picked end' })
      setPickMode(null)
    }
  }

  const routeBetweenMarkers = useCallback(async () => {
    if (!source || !dest) {
      setStatus('Set both start and end (search or pick on map).')
      return
    }
    setStatus('Fetching route…')
    try {
      const r = await fetchRoute(source, dest)
      if (!r) {
        setStatus('No driving route found.')
        return
      }
      setRoute(r)
      const km = (r.distance / 1000).toFixed(1)
      const min = Math.round(r.duration / 60)
      setStatus(`Route: ~${km} km, ~${min} min driving (OSRM demo)`)
    } catch {
      setStatus('Could not fetch route.')
    }
  }, [source, dest])

  const googleKey = import.meta.env.VITE_GOOGLE_MAPS_KEY

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Map & route</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          OpenStreetMap tiles with Nominatim search and a public OSRM routing line. Click the map after choosing
          “Pick on map” to set points manually. Use your current location for context.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={useMyLocation}
          className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900"
        >
          Use my location
        </button>
        <button
          type="button"
          onClick={() => setPickMode('source')}
          className={`rounded-xl px-4 py-2 text-sm font-medium ${
            pickMode === 'source' ? 'bg-teal-600 text-white' : 'border border-slate-200 bg-white'
          }`}
        >
          Pick start on map
        </button>
        <button
          type="button"
          onClick={() => setPickMode('dest')}
          className={`rounded-xl px-4 py-2 text-sm font-medium ${
            pickMode === 'dest' ? 'bg-teal-600 text-white' : 'border border-slate-200 bg-white'
          }`}
        >
          Pick end on map
        </button>
        <button
          type="button"
          onClick={routeBetweenMarkers}
          className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-900 hover:bg-teal-100"
        >
          Route between markers
        </button>
      </div>

      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_1fr_auto] md:items-end">
        <div>
          <label className="text-xs font-medium text-slate-600">Source</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={sourceQ}
            onChange={(e) => setSourceQ(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Destination</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={destQ}
            onChange={(e) => setDestQ(e.target.value)}
          />
        </div>
        <button
          type="button"
          onClick={runGeocodeAndRoute}
          className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
        >
          Show route
        </button>
      </div>
      {pickMode && (
        <p className="text-sm text-teal-800">Click the map to set {pickMode === 'source' ? 'start' : 'end'}.</p>
      )}
      {status && <p className="text-sm text-slate-700">{status}</p>}

      <div className="h-[420px] overflow-hidden rounded-2xl border border-slate-200 shadow-inner">
        <MapContainer center={center} zoom={zoom} className="h-full w-full" scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationPicker onPick={onMapPick} />
          {userLoc && (
            <Marker position={[userLoc.lat, userLoc.lon]}>
              <Popup>{userLoc.label}</Popup>
            </Marker>
          )}
          {source && (
            <Marker position={[source.lat, source.lon]}>
              <Popup>Start: {source.label}</Popup>
            </Marker>
          )}
          {dest && (
            <Marker position={[dest.lat, dest.lon]}>
              <Popup>End: {dest.label}</Popup>
            </Marker>
          )}
          {route?.coords && <Polyline positions={route.coords} pathOptions={{ color: '#0d9488', weight: 5 }} />}
        </MapContainer>
      </div>

      {googleKey && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-sm font-semibold text-slate-800">Google Maps (optional)</h2>
          <p className="mt-1 text-xs text-slate-600">
            Embedded map using your API key. For full directions API billing applies per Google’s terms.
          </p>
          <div className="mt-3 aspect-video w-full overflow-hidden rounded-xl bg-white">
            <iframe
              title="Google Map"
              className="h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps/embed/v1/directions?key=${googleKey}&origin=${encodeURIComponent(sourceQ)}&destination=${encodeURIComponent(destQ)}`}
            />
          </div>
        </div>
      )}
    </div>
  )
}
