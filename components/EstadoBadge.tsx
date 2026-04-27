import { LeadEstado } from '@/types/lead'

const CONFIG: Record<LeadEstado, { label: string; className: string }> = {
  nuevo:       { label: '🆕 Nuevo',       className: 'bg-blue-100 text-blue-700' },
  contactado:  { label: '📞 Contactado',  className: 'bg-yellow-100 text-yellow-700' },
  en_proceso:  { label: '🤝 En proceso',  className: 'bg-purple-100 text-purple-700' },
  vendido:     { label: '✅ Vendido',     className: 'bg-green-100 text-green-700' },
  descartado:  { label: '🗑️ Descartado', className: 'bg-gray-100 text-gray-500' },
}

export default function EstadoBadge({ estado }: { estado: LeadEstado }) {
  const c = CONFIG[estado] || CONFIG.nuevo
  return (
    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${c.className}`}>
      {c.label}
    </span>
  )
}
