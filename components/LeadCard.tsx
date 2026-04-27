'use client'
import { useState } from 'react'
import { Lead, LeadEstado } from '@/types/lead'
import EstadoBadge from './EstadoBadge'
import { Phone, Globe, ChevronDown, ChevronUp, Trash2, MessageCircle } from 'lucide-react'

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

export default function LeadCard({ lead, onUpdate, onDelete }: Props) {
  const [expandido, setExpandido] = useState(false)
  const [notas, setNotas] = useState(lead.notas || '')
  const [guardandoNotas, setGuardandoNotas] = useState(false)

  const guardarNotas = async () => {
    setGuardandoNotas(true)
    await onUpdate(lead.id, { notas })
    setGuardandoNotas(false)
  }

  const whatsappUrl = lead.telefono
    ? `https://wa.me/${lead.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(
        `Hola ${lead.nombre}, te contacto porque vi que no tenés página web y podría ayudarte a crear una. ¿Tenés un momento para hablar?`
      )}`
    : null

  return (
    <div className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all ${
      lead.estado === 'vendido' ? 'border-green-200' :
      lead.estado === 'descartado' ? 'border-gray-200 opacity-60' :
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

        {/* Propuesta */}
        <div className="mt-3 bg-blue-50 rounded-xl p-3">
          <p className="text-xs font-semibold text-blue-800">💡 Propuesta:</p>
          <p className="text-sm font-medium text-blue-900 mt-0.5">{lead.tipo_web_sugerida}</p>
          <p className="text-xs text-blue-700 mt-1">{lead.descripcion_propuesta}</p>
        </div>

        {/* Acciones rápidas */}
        <div className="flex gap-2 mt-3">
          {lead.telefono && (
            <>
              <a
                href={`tel:${lead.telefono}`}
                className="flex-1 flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm py-2 rounded-xl transition-colors"
              >
                <Phone size={14} /> Llamar
              </a>
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 bg-green-100 hover:bg-green-200 text-green-700 text-sm py-2 rounded-xl transition-colors"
                >
                  <MessageCircle size={14} /> WhatsApp
                </a>
              )}
            </>
          )}
          {lead.website_actual && (
            <a
              href={lead.website_actual}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 bg-orange-100 hover:bg-orange-200 text-orange-700 text-sm px-3 py-2 rounded-xl transition-colors"
            >
              <Globe size={14} />
            </a>
          )}
          <button
            onClick={() => setExpandido(!expandido)}
            className="flex items-center justify-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm px-3 py-2 rounded-xl transition-colors"
          >
            {expandido ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Panel expandido */}
      {expandido && (
        <div className="border-t border-gray-100 p-4 space-y-3 bg-gray-50">
          {/* Cambiar estado */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">CAMBIAR ESTADO</p>
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
