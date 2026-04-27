'use client'
import { useState, useEffect } from 'react'
import { MapPin, Loader2, Plus, Check, Globe, Zap } from 'lucide-react'
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
}

export default function BuscarPage() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [resultados, setResultados] = useState<Resultado[]>([])
  const [buscando, setBuscando] = useState(false)
  const [error, setError] = useState('')
  const [guardados, setGuardados] = useState<Set<string>>(new Set())
  const [guardando, setGuardando] = useState<Set<string>>(new Set())
  const [soloSinWeb, setSoloSinWeb] = useState(true)
  const [settings, setSettings] = useState({ nombre: '', agencia: '' })

  useEffect(() => {
    setSettings(getSettings())
  }, [])

  const buscar = () => {
    setError('')
    setBuscando(true)
    setResultados([])

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setCoords({ lat, lng })

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
        setError('No se pudo obtener tu ubicación. Activá el GPS e intentá de nuevo.')
        setBuscando(false)
      }
    )
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

  const whatsappUrl = (r: Resultado) => {
    if (!r.telefono) return null
    const phone = r.telefono.replace(/\D/g, '')
    const nombre = settings.nombre || 'un desarrollador web'
    const agencia = settings.agencia ? ` de ${settings.agencia}` : ''
    const msg = `Hola ${r.nombre}, soy ${nombre}${agencia}. Vi que no tenés página web y me gustaría ayudarte a crear una profesional. ¿Tenés un momento para hablar?`
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
  }

  const visibles = soloSinWeb ? resultados.filter(r => !r.tiene_web) : resultados

  return (
    <div className="py-4 space-y-4">
      {/* Botón principal */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center space-y-3">
        <div className="text-5xl">🎯</div>
        <h2 className="font-bold text-gray-900 text-lg">Encontrá clientes potenciales</h2>
        <p className="text-sm text-gray-500">
          Buscamos automáticamente los negocios cercanos que más necesitan una página web y te los mostramos ordenados por potencial.
        </p>

        {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl p-3">{error}</p>}

        <button
          onClick={buscar}
          disabled={buscando}
          className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold py-4 rounded-2xl transition-colors disabled:opacity-60 text-base shadow-lg shadow-blue-200"
        >
          {buscando
            ? <><Loader2 size={20} className="animate-spin" /> Buscando cerca tuyo...</>
            : <><MapPin size={20} /> Buscar clientes cercanos</>
          }
        </button>

        {!buscando && resultados.length === 0 && (
          <p className="text-xs text-gray-400">Usamos tu GPS — activalo cuando te pida permiso</p>
        )}
      </div>

      {/* Resultados */}
      {resultados.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-700">
                {visibles.length} negocios encontrados
              </p>
              <p className="text-xs text-gray-400">Ordenados por potencial de venta</p>
            </div>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={soloSinWeb}
                onChange={e => setSoloSinWeb(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-xs text-gray-600">Solo sin web</span>
            </label>
          </div>

          {visibles.map((r, i) => (
            <div key={r.place_id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4">
                {/* Badge de potencial */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {i < 3 && (
                        <span className="shrink-0 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <Zap size={10} /> Top {i + 1}
                        </span>
                      )}
                      {r.tiene_web
                        ? <span className="shrink-0 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full flex items-center gap-1"><Globe size={10} />Tiene web</span>
                        : <span className="shrink-0 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">✓ Sin web</span>
                      }
                    </div>
                    <h3 className="font-semibold text-gray-900 truncate mt-1">{r.nombre}</h3>
                    <p className="text-xs text-gray-500">{r.categoria}</p>
                    {r.direccion && <p className="text-xs text-gray-400 truncate">📍 {r.direccion}</p>}
                  </div>
                </div>

                {r.rating !== undefined && (
                  <p className="text-xs text-gray-400 mb-2">
                    ⭐ {r.rating} ({r.total_ratings ?? 0} reseñas)
                  </p>
                )}

                {/* Propuesta */}
                <div className="bg-blue-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-blue-800">💡 Podés ofrecerle:</p>
                  <p className="text-sm font-medium text-blue-900 mt-0.5">{r.tipo_web_sugerida}</p>
                  <p className="text-xs text-blue-700 mt-1">{r.descripcion_propuesta}</p>
                  <p className="text-xs font-bold text-blue-800 mt-1.5">💰 {r.precio_estimado}</p>
                </div>

                {/* Acciones */}
                <div className="flex gap-2 mt-3">
                  {r.telefono && (
                    <>
                      <a
                        href={`tel:${r.telefono}`}
                        className="flex-1 flex items-center justify-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm py-2 rounded-xl transition-colors"
                      >
                        📞 Llamar
                      </a>
                      {whatsappUrl(r) && (
                        <a
                          href={whatsappUrl(r)!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1 bg-green-100 hover:bg-green-200 text-green-700 text-sm py-2 rounded-xl transition-colors"
                        >
                          💬 WhatsApp
                        </a>
                      )}
                    </>
                  )}
                </div>

                <button
                  onClick={() => guardarLead(r)}
                  disabled={guardados.has(r.place_id) || guardando.has(r.place_id)}
                  className={`mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                    guardados.has(r.place_id)
                      ? 'bg-green-100 text-green-700 cursor-default'
                      : 'bg-gray-900 hover:bg-gray-700 text-white'
                  }`}
                >
                  {guardados.has(r.place_id)
                    ? <><Check size={15} /> Guardado en pendientes</>
                    : guardando.has(r.place_id)
                    ? <Loader2 size={15} className="animate-spin" />
                    : <><Plus size={15} /> Guardar como lead</>
                  }
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
