'use client'
import { useState, useCallback } from 'react'
import { Loader2, Search, RefreshCw, Plus, Check, Filter, Star } from 'lucide-react'
import { getSettings } from '@/components/SettingsModal'

interface Resultado {
  place_id: string
  nombre: string
  telefono: string | null
  direccion: string | null
  categoria: string
  website: string | null
  tiene_web: boolean
  tipo_web_sugerida: string
  descripcion_propuesta: string
  precio_estimado: string
  rating: number | null
  total_ratings: number
  need_score: number
}

const CIUDADES = [
  'Buenos Aires (CABA)',
  'Zona Norte GBA',
  'Zona Sur GBA',
  'Zona Oeste GBA',
  'Córdoba',
  'Rosario',
  'Mendoza',
  'La Plata',
  'Tucumán',
  'Mar del Plata',
  'Salta',
  'Santa Fe',
  'San Juan',
  'Neuquén',
  'Bahía Blanca',
  'Corrientes',
  'Resistencia',
  'Posadas',
  'Paraná',
  'Río Cuarto',
]

const RUBROS = [
  // Gastronomía
  { grupo: '🍕 Gastronomía', items: ['Restaurantes', 'Pizzerías', 'Cafeterías', 'Bares', 'Panaderías', 'Heladerías', 'Delivery de comida'] },
  // Belleza
  { grupo: '💅 Belleza', items: ['Peluquerías', 'Salones de belleza', 'Manicuría y nail art', 'Spa', 'Estéticas'] },
  // Salud
  { grupo: '🏥 Salud', items: ['Médicos y clínicas', 'Dentistas', 'Kinesiólogos', 'Veterinarias', 'Farmacias', 'Psicólogos'] },
  // Fitness
  { grupo: '💪 Deporte', items: ['Gimnasios', 'Centros de yoga', 'Academias de artes marciales'] },
  // Comercio
  { grupo: '🛍️ Comercio', items: ['Tiendas de ropa', 'Calzado', 'Joyerías', 'Mueblerías', 'Ferreterías', 'Electrodomésticos', 'Ópticas', 'Librerías'] },
  // Servicios
  { grupo: '🔧 Servicios', items: ['Talleres mecánicos', 'Electricistas', 'Plomeros', 'Inmobiliarias', 'Contadores', 'Estudios jurídicos', 'Agencias de viaje'] },
  // Otros
  { grupo: '📦 Otros', items: ['Hoteles y hospedajes', 'Colegios y academias', 'Supermercados', 'Concesionarias'] },
]

const TODOS_RUBROS = RUBROS.flatMap(g => g.items)

function scoreColor(s: number) {
  if (s >= 70) return 'bg-green-100 text-green-800'
  if (s >= 45) return 'bg-yellow-100 text-yellow-800'
  return 'bg-gray-100 text-gray-600'
}

function buildMsg1(): string {
  return `Hola, ¿cómo están? 👋`
}

function buildMsg2(nombre: string, linkPortfolio: string, nombreDev: string): string {
  return `Soy ${nombreDev || 'Lautaro'}, programador y desarrollador web 💻

Trabajo con locales como ${nombre} armando sistemas que ahorran tiempo: página web profesional, WhatsApp automático con IA, tienda online, control de stock y caja, turnos online y más.

Pueden ver los trabajos que hago acá 👇
${linkPortfolio || 'https://mana-dev.vercel.app'}

¿Les interesa que charlemos? Sin compromiso 🙂`
}

interface CardProps {
  r: Resultado
  guardado: boolean
  guardando: boolean
  onGuardar: () => void
  settings: { nombre: string; agencia: string; linkPortfolio: string }
}

function LeadArCard({ r, guardado, guardando, onGuardar, settings }: CardProps) {
  const phone = r.telefono?.replace(/\D/g, '') ?? ''

  const wa1 = phone
    ? `https://wa.me/54${phone.startsWith('0') ? phone.slice(1) : phone}?text=${encodeURIComponent(buildMsg1())}`
    : null

  const wa2 = phone
    ? `https://wa.me/54${phone.startsWith('0') ? phone.slice(1) : phone}?text=${encodeURIComponent(buildMsg2(r.nombre, settings.linkPortfolio, settings.nombre))}`
    : null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-900 text-sm leading-tight">{r.nombre}</h3>
              {!r.tiene_web && (
                <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-md font-semibold shrink-0">
                  Sin web ✓
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{r.categoria}</p>
            {r.direccion && (
              <p className="text-xs text-gray-400 truncate mt-0.5">📍 {r.direccion}</p>
            )}
          </div>
          <span className={`text-xs font-bold px-2 py-1 rounded-lg shrink-0 ${scoreColor(r.need_score)}`}>
            {r.need_score}pts
          </span>
        </div>

        {/* Rating */}
        {r.rating != null && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Star size={11} className="fill-amber-400 text-amber-400" />
            <span className="font-medium">{r.rating.toFixed(1)}</span>
            <span className="text-gray-400">({r.total_ratings} reseñas)</span>
            {r.total_ratings >= 100 && <span className="text-green-600 font-semibold">· Muy establecido</span>}
            {r.total_ratings >= 50 && r.total_ratings < 100 && <span className="text-blue-600 font-semibold">· Establecido</span>}
          </div>
        )}

        {/* Propuesta */}
        <div className="bg-blue-50 rounded-xl p-2.5">
          <p className="text-xs font-semibold text-blue-800">💡 Podés ofrecerle:</p>
          <p className="text-sm font-medium text-blue-900 mt-0.5">{r.tipo_web_sugerida}</p>
          <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">{r.descripcion_propuesta}</p>
        </div>

        {/* Botones WhatsApp */}
        {phone ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Mensajes WhatsApp</p>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={wa1!}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-0.5 bg-green-50 hover:bg-green-100 border border-green-200 text-green-800 text-xs py-2.5 px-2 rounded-xl transition-colors font-medium text-center"
              >
                <span className="text-base leading-none">💬</span>
                <span className="font-bold">Msg 1 — Apertura</span>
                <span className="text-green-600 font-normal text-[10px]">"Hola, ¿cómo están?"</span>
              </a>
              <a
                href={wa2!}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-0.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs py-2.5 px-2 rounded-xl transition-colors font-medium text-center"
              >
                <span className="text-base leading-none">📋</span>
                <span className="font-bold">Msg 2 — Pitch</span>
                <span className="text-blue-600 font-normal text-[10px]">Después de que respondan</span>
              </a>
            </div>
            <p className="text-[10px] text-gray-400 text-center">
              Mandá Msg 1 primero → esperá respuesta → mandá Msg 2
            </p>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-2.5 text-xs text-amber-700">
            ⚠️ Sin teléfono disponible — buscalo en Google Maps por el nombre
          </div>
        )}

        {/* Guardar */}
        <button
          onClick={onGuardar}
          disabled={guardado || guardando}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-xs transition-colors ${
            guardado
              ? 'bg-green-100 text-green-700 cursor-default'
              : 'bg-gray-900 hover:bg-gray-700 text-white active:scale-95'
          }`}
        >
          {guardado ? (
            <><Check size={13} /> Guardado en pendientes</>
          ) : guardando ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <><Plus size={13} /> Guardar como lead</>
          )}
        </button>
      </div>
    </div>
  )
}

export default function BuscarArPage() {
  const [ciudad, setCiudad] = useState('Buenos Aires (CABA)')
  const [rubro, setRubro] = useState('Restaurantes')
  const [soloSinWeb, setSoloSinWeb] = useState(true)
  const [minResenas, setMinResenas] = useState(15)
  const [mostrarFiltros, setMostrarFiltros] = useState(false)

  const [resultados, setResultados] = useState<Resultado[]>([])
  const [buscando, setBuscando] = useState(false)
  const [error, setError] = useState('')
  const [buscado, setBuscado] = useState(false)

  const [guardados, setGuardados] = useState<Set<string>>(new Set())
  const [guardando, setGuardando] = useState<Set<string>>(new Set())

  const settings = (() => {
    if (typeof window === 'undefined') return { nombre: 'Lautaro', agencia: '', linkPortfolio: 'https://mana-dev.vercel.app' }
    try {
      const s = JSON.parse(localStorage.getItem('wl_settings') || '{}')
      return { nombre: s.nombre || 'Lautaro', agencia: s.agencia || '', linkPortfolio: s.linkPortfolio || 'https://mana-dev.vercel.app' }
    } catch { return { nombre: 'Lautaro', agencia: '', linkPortfolio: 'https://mana-dev.vercel.app' } }
  })()

  const buscar = useCallback(async () => {
    setError('')
    setBuscando(true)
    setResultados([])
    setBuscado(false)

    // Limpiar ciudad para query: sacar paréntesis
    const ciudadQuery = ciudad.replace(/\(.*\)/g, '').replace(/GBA/g, '').trim()

    try {
      const params = new URLSearchParams({
        ciudad: ciudadQuery,
        rubro,
        sinweb: soloSinWeb ? '1' : '0',
        minresenas: String(minResenas),
      })
      const res = await fetch(`/api/buscar-ar?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al buscar')
      setResultados(data.results || [])
      setBuscado(true)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setBuscando(false)
    }
  }, [ciudad, rubro, soloSinWeb, minResenas])

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

  const sinWeb = resultados.filter(r => !r.tiene_web).length
  const conWeb = resultados.filter(r => r.tiene_web).length

  return (
    <div className="py-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-900 text-lg">🇦🇷 Buscar en Argentina</h2>
          <p className="text-xs text-gray-400">Encontrá clientes en cualquier ciudad</p>
        </div>
        <button
          onClick={() => setMostrarFiltros(v => !v)}
          className={`p-2.5 rounded-xl transition-colors ${mostrarFiltros ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
          title="Filtros"
        >
          <Filter size={18} />
        </button>
      </div>

      {/* Panel de búsqueda */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
        {/* Ciudad */}
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1.5">CIUDAD</label>
          <select
            value={ciudad}
            onChange={e => setCiudad(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {CIUDADES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Rubro */}
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1.5">RUBRO</label>
          <select
            value={rubro}
            onChange={e => setRubro(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {RUBROS.map(g => (
              <optgroup key={g.grupo} label={g.grupo}>
                {g.items.map(i => <option key={i}>{i}</option>)}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Filtros extra */}
        {mostrarFiltros && (
          <div className="space-y-3 pt-1 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Solo negocios sin web</p>
                <p className="text-xs text-gray-400">Mayor oportunidad de venta</p>
              </div>
              <button
                onClick={() => setSoloSinWeb(v => !v)}
                className={`relative w-11 h-6 rounded-full transition-colors ${soloSinWeb ? 'bg-blue-600' : 'bg-gray-200'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${soloSinWeb ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">MÍNIMO DE RESEÑAS (calidad)</label>
              <select
                value={minResenas}
                onChange={e => setMinResenas(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value={10}>10+ reseñas (más resultados)</option>
                <option value={15}>15+ reseñas (recomendado)</option>
                <option value={30}>30+ reseñas (más establecidos)</option>
                <option value={50}>50+ reseñas (solo top negocios)</option>
              </select>
            </div>
          </div>
        )}

        {/* Botón buscar */}
        <button
          onClick={buscar}
          disabled={buscando}
          className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm active:scale-95"
        >
          {buscando
            ? <><Loader2 size={16} className="animate-spin" /> Buscando en {ciudad.split('(')[0].trim()}...</>
            : <><Search size={16} /> Buscar {rubro} en {ciudad.split('(')[0].trim()}</>
          }
        </button>
      </div>

      {/* Cómo usar los mensajes */}
      {!buscado && !buscando && (
        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl border border-green-100 p-4 space-y-2">
          <p className="text-sm font-bold text-gray-800">💬 Cómo usar los 2 mensajes</p>
          <div className="space-y-2">
            <div className="flex gap-2.5 items-start">
              <span className="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shrink-0 mt-0.5">1</span>
              <div>
                <p className="text-xs font-semibold text-gray-700">Mandás Msg 1 — Apertura casual</p>
                <p className="text-xs text-gray-500 italic">"Hola, ¿cómo están? 👋"</p>
                <p className="text-xs text-gray-400">Simple, humano. Espera que respondan (casi siempre lo hacen).</p>
              </div>
            </div>
            <div className="flex gap-2.5 items-start">
              <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shrink-0 mt-0.5">2</span>
              <div>
                <p className="text-xs font-semibold text-gray-700">Cuando responden → Msg 2 — Pitch</p>
                <p className="text-xs text-gray-400">Te presentás, explicás lo que hacés y mandás el link de tu portfolio. Mucho mayor conversión.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 space-y-2">
          <p className="text-sm text-red-600 font-medium">Error al buscar</p>
          <p className="text-xs text-red-500">{error}</p>
          <button onClick={buscar} className="text-xs text-red-700 font-semibold underline">Reintentar</button>
        </div>
      )}

      {/* Loading skeleton */}
      {buscando && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3 animate-pulse">
              <div className="flex justify-between">
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                </div>
                <div className="h-6 bg-gray-100 rounded w-12" />
              </div>
              <div className="h-16 bg-blue-50 rounded-xl" />
              <div className="grid grid-cols-2 gap-2">
                <div className="h-14 bg-green-50 rounded-xl" />
                <div className="h-14 bg-blue-50 rounded-xl" />
              </div>
              <div className="h-9 bg-gray-100 rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {/* Resultados */}
      {!buscando && buscado && (
        <>
          {/* Stats */}
          <div className="flex gap-2">
            <div className="flex-1 bg-white rounded-xl border border-gray-100 px-3 py-2 text-center">
              <p className="text-lg font-bold text-gray-900">{resultados.length}</p>
              <p className="text-xs text-gray-400">encontrados</p>
            </div>
            <div className="flex-1 bg-orange-50 rounded-xl border border-orange-100 px-3 py-2 text-center">
              <p className="text-lg font-bold text-orange-700">{sinWeb}</p>
              <p className="text-xs text-orange-500">sin web</p>
            </div>
            <div className="flex-1 bg-blue-50 rounded-xl border border-blue-100 px-3 py-2 text-center">
              <p className="text-lg font-bold text-blue-700">{conWeb}</p>
              <p className="text-xs text-blue-400">con web</p>
            </div>
          </div>

          {resultados.length === 0 ? (
            <div className="py-12 text-center text-gray-400 space-y-2">
              <p className="text-4xl">🔍</p>
              <p className="font-semibold text-gray-600">Sin resultados para estos filtros</p>
              <p className="text-sm">Probá bajar el mínimo de reseñas o desactivar "solo sin web"</p>
              <button onClick={() => setMostrarFiltros(true)} className="text-sm text-blue-600 font-semibold underline">
                Abrir filtros
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {resultados.map(r => (
                <LeadArCard
                  key={r.place_id}
                  r={r}
                  guardado={guardados.has(r.place_id)}
                  guardando={guardando.has(r.place_id)}
                  onGuardar={() => guardarLead(r)}
                  settings={settings}
                />
              ))}

              {/* Buscar más */}
              <button
                onClick={buscar}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 rounded-2xl text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors"
              >
                <RefreshCw size={15} /> Buscar de nuevo en {ciudad.split('(')[0].trim()}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
