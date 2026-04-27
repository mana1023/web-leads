'use client'
import { useState, useEffect, useCallback } from 'react'
import { Loader2, RefreshCw, Plus, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { getSettings } from '@/components/SettingsModal'

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
  need_score: number
  distancia: number
}

function distanciaLabel(metros: number): string {
  if (metros < 1000) return `${metros}m`
  return `${(metros / 1000).toFixed(1)}km`
}

function CategoriaSection({
  categoria,
  leads,
  guardados,
  guardando,
  onGuardar,
  onWhatsApp,
}: {
  categoria: string
  leads: Resultado[]
  guardados: Set<string>
  guardando: Set<string>
  onGuardar: (r: Resultado) => void
  onWhatsApp: (r: Resultado) => string | null
}) {
  const [expandido, setExpandido] = useState(true)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpandido(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100"
      >
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-800 text-sm">{categoria}</span>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{leads.length}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <span>desde {distanciaLabel(leads[0].distancia)}</span>
          {expandido ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {expandido && (
        <div className="divide-y divide-gray-50">
          {leads.map(r => (
            <div key={r.place_id} className="p-4 space-y-2.5">
              {/* Header negocio */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight">{r.nombre}</h3>
                  {r.direccion && (
                    <p className="text-xs text-gray-400 truncate mt-0.5">📍 {r.direccion}</p>
                  )}
                </div>
                <span className="shrink-0 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                  {distanciaLabel(r.distancia)}
                </span>
              </div>

              {r.rating !== undefined && (
                <p className="text-xs text-gray-400">
                  ⭐ {r.rating} ({r.total_ratings ?? 0} reseñas)
                </p>
              )}

              {/* Propuesta */}
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-blue-800">💡 Podés ofrecerle:</p>
                <p className="text-sm font-medium text-blue-900 mt-0.5">{r.tipo_web_sugerida}</p>
                <p className="text-xs text-blue-700 mt-0.5">{r.descripcion_propuesta}</p>
                <p className="text-xs font-bold text-blue-800 mt-1">💰 {r.precio_estimado}</p>
              </div>

              {/* Acciones */}
              <div className="flex gap-2">
                {r.telefono && (
                  <>
                    <a
                      href={`tel:${r.telefono}`}
                      className="flex-1 flex items-center justify-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs py-2 rounded-xl transition-colors font-medium"
                    >
                      📞 Llamar
                    </a>
                    {onWhatsApp(r) && (
                      <a
                        href={onWhatsApp(r)!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1 bg-green-100 hover:bg-green-200 text-green-700 text-xs py-2 rounded-xl transition-colors font-medium"
                      >
                        💬 WhatsApp
                      </a>
                    )}
                  </>
                )}
              </div>

              <button
                onClick={() => onGuardar(r)}
                disabled={guardados.has(r.place_id) || guardando.has(r.place_id)}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-xs transition-colors ${
                  guardados.has(r.place_id)
                    ? 'bg-green-100 text-green-700 cursor-default'
                    : 'bg-gray-900 hover:bg-gray-700 text-white'
                }`}
              >
                {guardados.has(r.place_id) ? (
                  <><Check size={13} /> Guardado en pendientes</>
                ) : guardando.has(r.place_id) ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <><Plus size={13} /> Guardar como lead</>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function BuscarPage() {
  const [resultados, setResultados] = useState<Resultado[]>([])
  const [buscando, setBuscando] = useState(false)
  const [error, setError] = useState('')
  const [guardados, setGuardados] = useState<Set<string>>(new Set())
  const [guardando, setGuardando] = useState<Set<string>>(new Set())
  const [settings, setSettings] = useState({ nombre: '', agencia: '' })

  useEffect(() => {
    setSettings(getSettings())
  }, [])

  const buscar = useCallback(() => {
    setError('')
    setBuscando(true)
    setResultados([])

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        try {
          const res = await fetch(`/api/buscar?lat=${lat}&lng=${lng}`)
          const data = await res.json()
          if (!res.ok) throw new Error(data.error || 'Error al buscar')
          setResultados(data.results || [])
        } catch (e: any) {
          setError(e.message)
        } finally {
          setBuscando(false)
        }
      },
      () => {
        setError('No se pudo obtener tu ubicacion. Activa el GPS e intenta de nuevo.')
        setBuscando(false)
      },
      { timeout: 10000 }
    )
  }, [])

  // Auto-cargar al abrir la pagina
  useEffect(() => {
    buscar()
  }, [buscar])

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

  const whatsappUrl = (r: Resultado): string | null => {
    if (!r.telefono) return null
    const phone = r.telefono.replace(/\D/g, '')
    const nombre = settings.nombre || 'un desarrollador web'
    const agencia = settings.agencia ? ` de ${settings.agencia}` : ''
    const msg = `Hola ${r.nombre}, soy ${nombre}${agencia}. Vi que no tenes pagina web y me gustaria ayudarte a crear una profesional. Tenes un momento para hablar?`
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
  }

  // Agrupar por categoria (ya vienen ordenados por distancia)
  const grouped = resultados.reduce((acc, r) => {
    if (!acc[r.categoria]) acc[r.categoria] = []
    acc[r.categoria].push(r)
    return acc
  }, {} as Record<string, Resultado[]>)

  // Ordenar categorias por el negocio mas cercano de cada una
  const categorias = Object.entries(grouped).sort((a, b) => a[1][0].distancia - b[1][0].distancia)

  return (
    <div className="py-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-900 text-lg">Clientes potenciales</h2>
          <p className="text-xs text-gray-400">
            {buscando
              ? 'Buscando cerca tuyo...'
              : resultados.length > 0
              ? `${resultados.length} negocios sin web encontrados`
              : error ? '' : 'Cargando...'}
          </p>
        </div>
        <button
          onClick={buscar}
          disabled={buscando}
          className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors disabled:opacity-40"
          title="Actualizar"
        >
          {buscando
            ? <Loader2 size={18} className="animate-spin" />
            : <RefreshCw size={18} />}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center space-y-2">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={buscar}
            className="text-xs text-red-700 font-semibold underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Loading skeleton */}
      {buscando && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3 animate-pulse">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-12" />
              </div>
              <div className="h-3 bg-gray-100 rounded w-2/3" />
              <div className="h-16 bg-blue-50 rounded-xl" />
              <div className="h-9 bg-gray-100 rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {/* Resultados agrupados */}
      {!buscando && categorias.length > 0 && (
        <div className="space-y-3">
          {categorias.map(([cat, leads]) => (
            <CategoriaSection
              key={cat}
              categoria={cat}
              leads={leads}
              guardados={guardados}
              guardando={guardando}
              onGuardar={guardarLead}
              onWhatsApp={whatsappUrl}
            />
          ))}
        </div>
      )}

      {/* Empty */}
      {!buscando && !error && resultados.length === 0 && (
        <div className="py-16 text-center text-gray-400 space-y-2">
          <p className="text-4xl">🔍</p>
          <p className="font-semibold text-gray-600">No se encontraron clientes potenciales</p>
          <p className="text-sm">Proba ampliar la zona o buscar de nuevo</p>
        </div>
      )}
    </div>
  )
}