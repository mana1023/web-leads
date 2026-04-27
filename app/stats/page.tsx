'use client'
import { useEffect, useState } from 'react'
import { Lead } from '@/types/lead'

export default function StatsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    fetch('/api/leads?estado=todos')
      .then(r => r.json())
      .then(d => { setLeads(d.leads || []); setCargando(false) })
  }, [])

  const total = leads.length
  const nuevo = leads.filter(l => l.estado === 'nuevo').length
  const contactado = leads.filter(l => l.estado === 'contactado').length
  const en_proceso = leads.filter(l => l.estado === 'en_proceso').length
  const vendido = leads.filter(l => l.estado === 'vendido').length
  const conversion = total > 0 ? Math.round((vendido / total) * 100) : 0

  const porCategoria = leads.reduce((acc, l) => {
    acc[l.categoria] = (acc[l.categoria] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topCategorias = Object.entries(porCategoria)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  if (cargando) return <div className="py-16 text-center text-gray-400">⏳ Cargando...</div>

  return (
    <div className="py-4 space-y-4">
      <h2 className="font-bold text-gray-900 text-lg">📊 Mis estadísticas</h2>

      {/* Tasa de conversión */}
      <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl p-5 text-white text-center">
        <p className="text-5xl font-bold">{conversion}%</p>
        <p className="text-blue-200 text-sm mt-1">Tasa de conversión</p>
        <p className="text-blue-300 text-xs mt-0.5">{vendido} vendido{vendido !== 1 ? 's' : ''} de {total} leads</p>
      </div>

      {/* Pipeline */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-semibold text-gray-700 text-sm mb-3">Pipeline de ventas</h3>
        <div className="space-y-2.5">
          {[
            { label: '🆕 Nuevos', value: nuevo, color: 'bg-blue-500' },
            { label: '📞 Contactados', value: contactado, color: 'bg-yellow-500' },
            { label: '🤝 En proceso', value: en_proceso, color: 'bg-purple-500' },
            { label: '✅ Vendidos', value: vendido, color: 'bg-green-500' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="text-sm text-gray-600 w-32 shrink-0">{item.label}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div
                  className={`${item.color} h-2 rounded-full transition-all`}
                  style={{ width: total > 0 ? `${(item.value / total) * 100}%` : '0%' }}
                />
              </div>
              <span className="text-sm font-bold text-gray-700 w-4 text-right">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top categorías */}
      {topCategorias.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-semibold text-gray-700 text-sm mb-3">Categorías más buscadas</h3>
          <div className="space-y-2">
            {topCategorias.map(([cat, count]) => (
              <div key={cat} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">{cat}</span>
                <span className="text-sm font-bold bg-gray-100 px-2.5 py-0.5 rounded-full">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {total === 0 && (
        <div className="py-12 text-center text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p>Todavía no tenés leads guardados</p>
        </div>
      )}
    </div>
  )
}
