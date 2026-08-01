'use client'
import { useState, useEffect } from 'react'
import { Lead, LeadEstado } from '@/types/lead'
import EstadoBadge from './EstadoBadge'
import { Phone, Globe, ChevronDown, ChevronUp, Trash2, Eye, Bell, BellOff } from 'lucide-react'
import { getSettings, UserSettings } from './SettingsModal'
import { construirMensajes } from '@/lib/mensajes'
import { getDemoMatch, getDemoUrl } from '@/lib/demos'

const ESTADOS: LeadEstado[] = ['nuevo', 'contactado', 'en_proceso', 'vendido', 'descartado']
const ESTADO_LABELS: Record<LeadEstado, string> = {
  nuevo: '🆕 Nuevo',
  contactado: '📞 Contactado',
  en_proceso: '🤝 En proceso',
  vendido: '✅ Vendido',
  descartado: '🗑️ Descartado',
}

interface Props {
  lead: Lead
  onUpdate: (id: string, changes: Partial<Lead>) => void
  onDelete: (id: string) => void
}

// Devuelve el estado de un seguimiento respecto a hoy.
function estadoSeguimiento(iso: string | null): { texto: string; clase: string } | null {
  if (!iso) return null
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0)
  const dia = new Date(iso); dia.setHours(0, 0, 0, 0)
  const diff = Math.round((dia.getTime() - hoy.getTime()) / 86400000)
  if (diff < 0) return { texto: `Atrasado ${-diff}d`, clase: 'bg-red-100 text-red-700 border-red-200' }
  if (diff === 0) return { texto: 'Recontactar hoy', clase: 'bg-amber-100 text-amber-800 border-amber-200' }
  if (diff === 1) return { texto: 'Seguimiento mañana', clase: 'bg-blue-50 text-blue-700 border-blue-200' }
  return { texto: `Seguir en ${diff}d`, clase: 'bg-gray-100 text-gray-500 border-gray-200' }
}

function isoEnDias(dias: number): string {
  const d = new Date()
  d.setDate(d.getDate() + dias)
  d.setHours(9, 0, 0, 0) // 9am del día objetivo
  return d.toISOString()
}

export default function LeadCard({ lead, onUpdate, onDelete }: Props) {
  const [expandido, setExpandido] = useState(false)
  const [notas, setNotas] = useState(lead.notas || '')
  const [guardandoNotas, setGuardandoNotas] = useState(false)
  const [settings, setSettings] = useState<UserSettings>({ nombre: '', agencia: '', linkPortfolio: '', demoBaseUrl: '' })

  useEffect(() => {
    setSettings(getSettings())
  }, [])

  const guardarNotas = async () => {
    setGuardandoNotas(true)
    await onUpdate(lead.id, { notas })
    setGuardandoNotas(false)
  }

  // Programar seguimiento: fija la fecha y registra el contacto.
  const programar = (dias: number) => {
    onUpdate(lead.id, {
      proximo_seguimiento: isoEnDias(dias),
      ultimo_contacto: new Date().toISOString(),
      intentos: (lead.intentos || 0) + 1,
      estado: lead.estado === 'nuevo' ? 'contactado' : lead.estado,
    })
  }

  const limpiarSeguimiento = () => onUpdate(lead.id, { proximo_seguimiento: null })

  const mensajes = construirMensajes(
    { nombre: lead.nombre, telefono: lead.telefono, categoria: lead.categoria },
    { nombre: settings.nombre, linkPortfolio: settings.linkPortfolio, demoBaseUrl: settings.demoBaseUrl },
  )
  const msg = (k: string) => mensajes.find(m => m.key === k)
  const demoMatch = getDemoMatch(lead.nombre, lead.categoria)
  const demoUrl = getDemoUrl(demoMatch, settings.demoBaseUrl)
  const seg = estadoSeguimiento(lead.proximo_seguimiento)

  return (
    <div className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all ${
      lead.estado === 'vendido' ? 'border-green-200' :
      lead.estado === 'descartado' ? 'border-gray-200 opacity-60' :
      seg?.texto.startsWith('Atrasado') || seg?.texto === 'Recontactar hoy' ? 'border-amber-200' :
      'border-gray-100'
    }`}>
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{lead.nombre}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{lead.categoria}</p>
            {lead.direccion && (
              <p className="text-xs text-gray-400 mt-0.5 truncate">📍 {lead.direccion}</p>
            )}
          </div>
          <EstadoBadge estado={lead.estado} />
        </div>

        {/* Badge de seguimiento */}
        {seg && (
          <div className={`inline-flex items-center gap-1 mt-2 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${seg.clase}`}>
            <Bell size={11} /> {seg.texto}
            {lead.intentos > 0 && <span className="opacity-70">· {lead.intentos}º intento</span>}
          </div>
        )}

        {/* Propuesta */}
        <div className="mt-3 bg-blue-50 rounded-xl p-3">
          <p className="text-xs font-semibold text-blue-800">💡 Propuesta:</p>
          <p className="text-sm font-medium text-blue-900 mt-0.5">{lead.tipo_web_sugerida}</p>
          <p className="text-xs text-blue-700 mt-1">{lead.descripcion_propuesta}</p>
          {demoUrl && (
            <a
              href={demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold text-blue-700 bg-white border border-blue-200 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <Eye size={13} /> Ver demo del rubro
            </a>
          )}
        </div>

        {/* Acciones rápidas */}
        <div className="flex gap-2 mt-3">
          {lead.telefono && (
            <>
              <a
                href={`tel:${lead.telefono}`}
                className="flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm py-2 px-3 rounded-xl transition-colors"
                title="Llamar"
              >
                <Phone size={14} />
              </a>
              {msg('apertura')?.url && (
                <a
                  href={msg('apertura')!.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Mensaje 1 — Apertura: 'Hola, ¿cómo están?'"
                  className="flex-1 flex items-center justify-center gap-1 bg-green-100 hover:bg-green-200 text-green-700 text-xs py-2 rounded-xl transition-colors font-semibold"
                >
                  💬 Msg 1
                </a>
              )}
              {msg('pitch')?.url && (
                <a
                  href={msg('pitch')!.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Mensaje 2 — Pitch con demo del rubro"
                  className="flex-1 flex items-center justify-center gap-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs py-2 rounded-xl transition-colors font-semibold"
                >
                  📋 Msg 2
                </a>
              )}
            </>
          )}
          {lead.website_actual && (
            <a
              href={lead.website_actual}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center bg-orange-100 hover:bg-orange-200 text-orange-700 text-sm px-3 py-2 rounded-xl transition-colors"
            >
              <Globe size={14} />
            </a>
          )}
          <button
            onClick={() => setExpandido(!expandido)}
            className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm px-3 py-2 rounded-xl transition-colors"
          >
            {expandido ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Panel expandido */}
      {expandido && (
        <div className="border-t border-gray-100 p-4 space-y-4 bg-gray-50">
          {/* Mensajes de seguimiento */}
          {lead.telefono && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">MENSAJES DE SEGUIMIENTO</p>
              <div className="grid grid-cols-2 gap-2">
                {msg('seguimiento')?.url && (
                  <a
                    href={msg('seguimiento')!.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-0.5 bg-white border border-green-200 hover:bg-green-50 text-green-700 py-2 rounded-xl transition-colors text-center"
                  >
                    <span className="text-[11px] font-bold">💬 Msg 3</span>
                    <span className="text-[10px] text-green-600">A los 2-3 días</span>
                  </a>
                )}
                {msg('ultima')?.url && (
                  <a
                    href={msg('ultima')!.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-0.5 bg-white border border-purple-200 hover:bg-purple-50 text-purple-700 py-2 rounded-xl transition-colors text-center"
                  >
                    <span className="text-[11px] font-bold">🙌 Msg 4</span>
                    <span className="text-[10px] text-purple-600">Cierre, a la semana</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Programar seguimiento */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">PROGRAMAR SEGUIMIENTO</p>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => programar(1)} className="text-xs px-3 py-1.5 rounded-full border bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600 transition-colors">Mañana</button>
              <button onClick={() => programar(3)} className="text-xs px-3 py-1.5 rounded-full border bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600 transition-colors">En 3 días</button>
              <button onClick={() => programar(7)} className="text-xs px-3 py-1.5 rounded-full border bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600 transition-colors">En 1 semana</button>
              {lead.proximo_seguimiento && (
                <button onClick={limpiarSeguimiento} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border bg-white text-gray-400 border-gray-200 hover:text-red-500 transition-colors">
                  <BellOff size={12} /> Quitar
                </button>
              )}
            </div>
          </div>

          {/* Cambiar estado */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">MOVER A</p>
            <div className="flex flex-wrap gap-1.5">
              {ESTADOS.map(e => (
                <button
                  key={e}
                  onClick={() => onUpdate(lead.id, { estado: e })}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    lead.estado === e
                      ? 'bg-gray-800 text-white border-gray-800'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {ESTADO_LABELS[e]}
                </button>
              ))}
            </div>
          </div>

          {/* Notas */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1.5">NOTAS</p>
            <textarea
              value={notas}
              onChange={e => setNotas(e.target.value)}
              placeholder="Agregar notas sobre este lead..."
              rows={3}
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white"
            />
            <button
              onClick={guardarNotas}
              disabled={guardandoNotas}
              className="mt-1.5 text-sm text-blue-600 font-medium disabled:opacity-50"
            >
              {guardandoNotas ? 'Guardando...' : 'Guardar notas'}
            </button>
          </div>

          {/* Eliminar */}
          <div className="flex justify-end pt-1">
            <button
              onClick={() => onDelete(lead.id)}
              className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition-colors"
            >
              <Trash2 size={13} /> Eliminar lead
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
