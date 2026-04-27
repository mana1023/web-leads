'use client'
import { useEffect, useState } from 'react'
import { Lead, LeadEstado } from '@/types/lead'
import LeadCard from '@/components/LeadCard'
import Link from 'next/link'

const FILTROS: { label: string; value: string }[] = [
  { label: 'Todos', value: 'todos' },
  { label: '🆕 Nuevos', value: 'nuevo' },
  { label: '📞 Contactados', value: 'contactado' },
  { label: '🤝 En proceso', value: 'en_proceso' },
  { label: '✅ Vendidos', value: 'vendido' },
]

export default function HomePage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [filtro, setFiltro] = useState('todos')
  const [cargando, setCargando] = useState(true)

  const cargarLeads = async () => {
    setCargando(true)
    const res = await fetch(`/api/leads?estado=${filtro}`)
    const data = await res.json()
    setLeads(data.leads || [])
    setCargando(false)
  }

  useEffect(() => { cargarLeads() }, [filtro])

  const handleUpdate = async (id: string, changes: Partial<Lead>) => {
    await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(changes),
    })
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...changes } : l))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este lead?')) return
    await fetch(`/api/leads/${id}`, { method: 'DELETE' })
    setLeads(prev => prev.filter(l => l.id !== id))
  }

  const vendidos = leads.filter(l => l.estado === 'vendido').length
  const nuevos = leads.filter(l => l.estado === 'nuevo').length

  return (
    <div className="py-4 space-y-4">
      {/* Stats rápidas */}
      {leads.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-gray-100">
            <p className="text-2xl font-bold text-gray-900">{leads.length}</p>
            <p className="text-xs text-gray-500">Total leads</p>
          </div>
          <div className="bg-blue-50 rounded-2xl p-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-blue-700">{nuevos}</p>
            <p className="text-xs text-blue-600">Nuevos</p>
          </div>
          <div className="bg-green-50 rounded-2xl p-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-green-700">{vendidos}</p>
            <p className="text-xs text-green-600">Vendidos</p>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {FILTROS.map(f => (
          <button
            key={f.value}
            onClick={() => setFiltro(f.value)}
            className={`shrink-0 text-sm px-4 py-2 rounded-full border transition-colors ${
              filtro === f.value
                ? 'bg-blue-700 text-white border-blue-700'
                : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista de leads */}
      {cargando ? (
        <div className="py-16 text-center text-gray-400">
          <p className="text-3xl mb-2">⏳</p>
          <p>Cargando leads...</p>
        </div>
      ) : leads.length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          <p className="text-5xl mb-4">🎯</p>
          <p className="font-semibold text-gray-600 text-lg">No tenés leads todavía</p>
          <p className="text-sm mt-1 mb-6">Buscá negocios y guardá los que te interesen</p>
          <Link
            href="/buscar"
            className="inline-block bg-blue-700 text-white px-6 py-3 rounded-2xl font-medium"
          >
            🔍 Buscar clientes
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map(lead => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
