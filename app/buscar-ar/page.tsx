'use client'
import { useState, useEffect, useCallback } from 'react'
import { Loader2, RefreshCw, Plus, Check, Star, SlidersHorizontal } from 'lucide-react'

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

function getSettingsLocal() {
  if (typeof window === 'undefined') return { nombre: 'Lautaro', linkPortfolio: 'https://mana-dev.vercel.app' }
  try {
    const s = JSON.parse(localStorage.getItem('wl_settings') || '{}')
    return {
      nombre: s.nombre || 'Lautaro',
      linkPortfolio: s.linkPortfolio || 'https://mana-dev.vercel.app',
    }
  } catch { return { nombre: 'Lautaro', linkPortfolio: 'https://mana-dev.vercel.app' } }
}

function buildPhone(raw: string | null): string | null {
  if (!raw) return null
  const p = raw.replace(/\D/g, '')
  const norm = p.startsWith('0') ? p.slice(1) : p
  return norm.startsWith('54') ? norm : `54${norm}`
}

function scoreColor(s: number) {
  if (s >= 70) return 'bg-green-100 text-green-800 border-green-200'
  if (s >= 45) return 'bg-amber-100 text-amber-800 border-amber-200'
  return 'bg-gray-100 text-gray-500 border-gray-200'
}

function LeadCard({
  r,
  guardado,
  guardando,
  onGuardar,
}: {
  r: Resultado
  guardado: boolean
  guardando: boolean
  onGuardar: () => void
}) {
  const settings = getSettingsLocal()
  const phone = buildPhone(r.telefono)

  const wa1 = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent('Hola, ¿cómo están? 👋')}`
    : null

  const wa2 = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(
        `Soy ${settings.nombre}, programador y desarrollador web 💻\n\nTrabajo con locales como ${r.nombre} armando sistemas que ahorran tiempo: página web, WhatsApp con IA, tienda online, control de stock y caja, turnos online y más.\n\nPueden ver los trabajos que hago acá 👇\n${settings.linkPortfolio}\n\n¿Les interesa que charlemos? Sin compromiso 🙂`
      )}`
    : null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 space-y-2.5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-semibold text-gray-900 text-sm leading-tight">{r.nombre}</h3>
              {!r.tiene_web && (
                <span className="text-[10px] bg-orange-100 text-orange-700 border border-orange-200 px-1.5 py-0.5 rounded font-bold shrink-0">
                  SIN WEB
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{r.categoria}</p>
            {r.direccion && (
              <p className="text-xs text-gray-400 truncate mt-0.5">📍 {r.direccion}</p>
            )}
          </div>
          <div className={`text-xs font-bold px-2 py-1 rounded-lg border shrink-0 ${scoreColor(r.need_score)}`}>
            {r.need_score}pts
          </div>
        </div>

        {/* Rating */}
        {r.rating != null && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Star size={11} className="fill-amber-400 text-amber-400 shrink-0" />
            <span className="font-semibold">{r.rating.toFixed(1)}</span>
            <span className="text-gray-400">({r.total_ratings} reseñas)</span>
            {r.total_ratings >= 100 && <span className="text-green-600 font-semibold">· Muy establecido</span>}
            {r.total_ratings >= 50 && r.total_ratings < 100 && <span className="text-blue-600 font-semibold">· Establecido</span>}
          </div>
        )}

        {/* Propuesta */}
        <div className="bg-blue-50 rounded-xl p-2.5">
          <p className="text-xs font-semibold text-blue-800">💡 {r.tipo_web_sugerida}</p>
          <p className="text-xs text-blue-600 mt-0.5 leading-relaxed">{r.descripcion_propuesta}</p>
        </div>

        {/* Mensajes WA */}
        {phone ? (
          <div className="grid grid-cols-2 gap-2">
            <a
              href={wa1!}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-0.5 bg-green-50 hover:bg-green-100 border border-green-200 text-green-800 py-2.5 rounded-xl transition-colors text-center"
            >
              <span className="text-base leading-none">💬</span>
              <span className="text-[11px] font-bold">Msg 1 — Apertura</span>
              <span className="text-[10px] text-green-600">"Hola, ¿cómo están?"</span>
            </a>
            <a
              href={wa2!}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-0.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 py-2.5 rounded-xl transition-colors text-center"
            >
              <span className="text-base leading-none">📋</span>
              <span className="text-[11px] font-bold">Msg 2 — Pitch</span>
              <span className="text-[10px] text-blue-600">Después que responden</span>
            </a>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-2 text-xs text-amber-700 text-center">
            Sin teléfono — buscalo en Google Maps
          </div>
        )}

        {/* Guardar */}
        <button
          onClick={onGuardar}
          disabled={guardado || guardando}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-xs transition-all active:scale-95 ${
            guardado
              ? 'bg-green-100 text-green-700 cursor-default'
              : 'bg-gray-900 hover:bg-gray-700 text-white'
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
  const [resultados, setResultados] = useState<Resultado[]>([])
  const [buscando, setBuscando] = useState(false)
  const [error, setError] = useState('')
  const [guardados, setGuardados] = useState<Set<string>>(new Set())
  const [guardando, setGuardando] = useState<Set<string>>(new Set())
  const [soloSinWeb, setSoloSinWeb] = useState(true)
  const [mostrarFiltros, setMostrarFiltros] = useState(false)

  const buscar = useCallback(async () => {
    setError('')
    setBuscando(true)
    setResultados([])
    try {
      const params = new URLSearchParams({
        auto: '1',
        sinweb: soloSinWeb ? '1' : '0',
        minresenas: '15',
      })
      const res = await fetch(`/api/buscar-ar?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al buscar')
      setResultados(data.results || [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setBuscando(false)
    }
  }, [soloSinWeb])

  // Auto-buscar al abrir
  useEffect(() => { buscar() }, [buscar])

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

  return (
    <div className="py-4 space-y-3">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-900 text-lg">🇦🇷 Mejores oportunidades</h2>
          <p className="text-xs text-gray-400">
            {buscando
              ? 'Buscando en toda Argentina...'
              : resultados.length > 0
              ? `${resultados.length} negocios encontrados · ${sinWeb} sin web`
              : error ? '' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setMostrarFiltros(v => !v)}
            className={`p-2.5 rounded-xl transition-colors ${mostrarFiltros ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <SlidersHorizontal size={16} />
          </button>
          <button
            onClick={buscar}
            disabled={buscando}
            className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors disabled:opacity-40"
          >
            {buscando ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          </button>
        </div>
      </div>

      {/* Filtro rápido (colapsable) */}
      {mostrarFiltros && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800">Solo negocios sin web</p>
              <p className="text-xs text-gray-400">Mayor oportunidad de venta directa</p>
            </div>
            <button
              onClick={() => setSoloSinWeb(v => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors ${soloSinWeb ? 'bg-blue-600' : 'bg-gray-200'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${soloSinWeb ? 'left-5' : 'left-0.5'}`} />
            </button>
          </div>
          <button
            onClick={buscar}
            disabled={buscando}
            className="mt-3 w-full py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Aplicar y buscar de nuevo
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 space-y-2 text-center">
          <p className="text-sm text-red-600 font-medium">{error}</p>
          <button onClick={buscar} className="text-xs text-red-700 font-semibold underline">Reintentar</button>
        </div>
      )}

      {/* Skeleton loading */}
      {buscando && (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3 animate-pulse">
              <div className="flex justify-between gap-2">
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
                <div className="h-7 w-12 bg-gray-100 rounded-lg shrink-0" />
              </div>
              <div className="h-3 bg-gray-100 rounded w-1/4" />
              <div className="h-14 bg-blue-50 rounded-xl" />
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
      {!buscando && resultados.length > 0 && (
        <div className="space-y-3">
          {resultados.map(r => (
            <LeadCard
              key={r.place_id}
              r={r}
              guardado={guardados.has(r.place_id)}
              guardando={guardando.has(r.place_id)}
              onGuardar={() => guardarLead(r)}
            />
          ))}

          <button
            onClick={buscar}
            className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 rounded-2xl text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors active:scale-95"
          >
            <RefreshCw size={14} /> Buscar nuevas oportunidades
          </button>
        </div>
      )}

      {/* Empty */}
      {!buscando && !error && resultados.length === 0 && (
        <div className="py-16 text-center space-y-3">
          <p className="text-4xl">🔍</p>
          <p className="font-semibold text-gray-700">Sin resultados con estos filtros</p>
          <button
            onClick={() => { setSoloSinWeb(false); buscar() }}
            className="text-sm text-blue-600 font-semibold underline"
          >
            Ver todos (con y sin web)
          </button>
        </div>
      )}
    </div>
  )
}
