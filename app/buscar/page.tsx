'use client'
import { useState } from 'react'
import { MapPin, Search, Loader2, Plus, Check, Globe } from 'lucide-react'

const CATEGORIAS = [
  'Restaurantes', 'Cafeterías', 'Bares', 'Panaderías',
  'Ropa y accesorios', 'Ferreterías', 'Farmacias', 'Supermercados',
  'Médicos y clínicas', 'Dentistas', 'Gimnasios', 'Peluquerías',
  'Salones de belleza', 'Talleres mecánicos', 'Inmobiliarias',
  'Hoteles y hospedajes', 'Veterinarias', 'Colegios y academias',
  'Abogados', 'Contadores', 'Agencias de viaje',
  'Electrodomésticos', 'Mueblería', 'Joyerías', 'Ópticas', 'Librerías',
]

interface Resultado {
  place_id: string
  nombre: string
  telefono?: string
  direccion?: string
  categoria: string
  website?: string
  tiene_web: boolean
  tipo_web_sugerida: string
  descripcion_propuesta: string
  precio_estimado: string
  rating?: number
  total_ratings?: number
}

export default function BuscarPage() {
  const [categoria, setCategoria] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [usandoGPS, setUsandoGPS] = useState(false)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [resultados, setResultados] = useState<Resultado[]>([])
  const [buscando, setBuscando] = useState(false)
  const [error, setError] = useState('')
  const [guardados, setGuardados] = useState<Set<string>>(new Set())
  const [guardando, setGuardando] = useState<Set<string>>(new Set())
  const [soloSinWeb, setSoloSinWeb] = useState(true)

  const usarGPS = () => {
    setUsandoGPS(true)
    setError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setCiudad('📍 Mi ubicación actual')
        setUsandoGPS(false)
      },
      () => {
        setError('No se pudo obtener tu ubicación. Escribí la ciudad manualmente.')
        setUsandoGPS(false)
      }
    )
  }

  const buscar = async () => {
    if (!categoria) { setError('Elegí una categoría'); return }
    if (!coords && !ciudad.trim()) { setError('Escribí una ciudad o usá tu ubicación'); return }
    setError('')
    setBuscando(true)
    setResultados([])

    try {
      const params = new URLSearchParams({ categoria })
      if (coords) {
        params.set('lat', String(coords.lat))
        params.set('lng', String(coords.lng))
      } else {
        params.set('ciudad', ciudad)
      }

      const res = await fetch(`/api/buscar?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al buscar')
      setResultados(data.results || [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setBuscando(false)
    }
  }

  const guardarLead = async (r: Resultado) => {
    setGuardando(prev => new Set([...prev, r.place_id]))
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: r.nombre,
          telefono: r.telefono,
          direccion: r.direccion,
          categoria: r.categoria,
          tiene_web: r.tiene_web,
          website: r.website,
          tipo_web_sugerida: r.tipo_web_sugerida,
          descripcion_propuesta: r.descripcion_propuesta,
          place_id: r.place_id,
        }),
      })
      if (res.ok || res.status === 409) {
        setGuardados(prev => new Set([...prev, r.place_id]))
      }
    } finally {
      setGuardando(prev => { const n = new Set(prev); n.delete(r.place_id); return n })
    }
  }

  const visibles = soloSinWeb ? resultados.filter(r => !r.tiene_web) : resultados

  return (
    <div className="py-4 space-y-4">
      {/* Formulario */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
        <h2 className="font-semibold text-gray-900">🔍 Buscar negocios</h2>

        {/* Categoría */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">TIPO DE NEGOCIO</label>
          <select
            value={categoria}
            onChange={e => setCategoria(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Elegí una categoría...</option>
            {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Ubicación */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">CIUDAD O ZONA</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={ciudad}
              onChange={e => { setCiudad(e.target.value); setCoords(null) }}
              placeholder="Ej: Buenos Aires, Córdoba..."
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={usarGPS}
              disabled={usandoGPS}
              title="Usar mi ubicación"
              className="flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 rounded-xl transition-colors disabled:opacity-50"
            >
              {usandoGPS ? <Loader2 size={18} className="animate-spin" /> : <MapPin size={18} />}
            </button>
          </div>
        </div>

        {/* Filtro sin web */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={soloSinWeb}
            onChange={e => setSoloSinWeb(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <span className="text-sm text-gray-700">Mostrar solo los que <strong>no tienen web</strong></span>
        </label>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          onClick={buscar}
          disabled={buscando}
          className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
        >
          {buscando ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
          {buscando ? 'Buscando...' : 'Buscar clientes potenciales'}
        </button>
      </div>

      {/* Resultados */}
      {resultados.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600">
              {visibles.length} resultado{visibles.length !== 1 ? 's' : ''}
              {soloSinWeb ? ' sin web' : ''}
            </p>
            {soloSinWeb && resultados.some(r => r.tiene_web) && (
              <button onClick={() => setSoloSinWeb(false)} className="text-xs text-blue-600 underline">
                Ver todos ({resultados.length})
              </button>
            )}
          </div>

          {visibles.map(r => (
            <div key={r.place_id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{r.nombre}</h3>
                    {r.direccion && <p className="text-xs text-gray-500 mt-0.5 truncate">{r.direccion}</p>}
                  </div>
                  {r.tiene_web
                    ? <span className="shrink-0 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full flex items-center gap-1"><Globe size={10} />Tiene web</span>
                    : <span className="shrink-0 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">✓ Sin web</span>
                  }
                </div>

                {r.telefono && (
                  <p className="text-sm text-gray-600 mt-2">📞 {r.telefono}</p>
                )}

                {r.rating && (
                  <p className="text-xs text-gray-400 mt-1">⭐ {r.rating} ({r.total_ratings} reseñas)</p>
                )}

                <div className="mt-3 bg-blue-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-blue-800">💡 Podés ofrecerle:</p>
                  <p className="text-sm font-medium text-blue-900 mt-0.5">{r.tipo_web_sugerida}</p>
                  <p className="text-xs text-blue-700 mt-1">{r.descripcion_propuesta}</p>
                  <p className="text-xs font-bold text-blue-800 mt-1.5">💰 {r.precio_estimado}</p>
                </div>

                <button
                  onClick={() => guardarLead(r)}
                  disabled={guardados.has(r.place_id) || guardando.has(r.place_id)}
                  className={`mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                    guardados.has(r.place_id)
                      ? 'bg-green-100 text-green-700 cursor-default'
                      : 'bg-gray-900 hover:bg-gray-700 text-white'
                  }`}
                >
                  {guardados.has(r.place_id) ? (
                    <><Check size={16} /> Guardado en mis leads</>
                  ) : guardando.has(r.place_id) ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <><Plus size={16} /> Guardar como lead</>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {resultados.length === 0 && !buscando && (
        <div className="py-12 text-center text-gray-400">
          <p className="text-4xl mb-3">🏪</p>
          <p className="text-sm">Elegí una categoría y ciudad para empezar</p>
        </div>
      )}
    </div>
  )
}
