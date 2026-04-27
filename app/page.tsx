'use client'
import { useEffect, useState } from 'react'
import { Lead } from '@/types/lead'
import LeadCard from '@/components/LeadCard'
import Link from 'next/link'

export default function PendientesPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [cargando, setCargando] = useState(true)

  const cargar = async () => {
    setCargando(true)
    // Traer nuevo + contactado
    const [r1, r2] = await Promise.all([
      fetch('/api/leads?estado=nuevo').then(r => r.json()),
      fetch('/api/leads?estado=contactado').then(r => r.json()),
    ])
    const todos = [...(r1.leads || []), ...(r2.leads || [])]
    // Ordenar por fecha más reciente
    todos.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    setLeads(todos)
    setCargando(false)
  }

  useEffect(() => { cargar() }, [])

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

  const nuevos = leads.filter(l => l.estado === 'nuevo').length
  const contactados = leads.filter(l => l.estado === 'contactado').length

  return (
    <div className="py-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-900 text-lg">⏳ Pendientes</h2>
          <p className="text-xs text-gray-500">Leads sin convertir aún</p>
        </div>
        {leads.length > 0 && (
          <div className="flex gap-2">
            <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">{nuevos} nuevos</span>
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full font-medium">{contactados} contactados</span>
          </div>
        )}
      </div>

      {cargando ? (
        <div className="py-16 text-center text-gray-400">⏳ Cargando...</div>
      ) : leads.length === 0 ? (
        <div className="py-16 text-center text-gray-400 space-y-3">
          <p className="text-5xl">📭</p>
          <p className="font-semibold text-gray-600">No tenés leads pendientes</p>
          <p className="text-sm">Buscá negocios y guardá los que te interesen</p>
          <Link
            href="/buscar"
            className="inline-block bg-blue-700 text-white px-6 py-3 rounded-2xl font-medium text-sm mt-2"
          >
            🔍 Buscar clientes
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map(lead => (
            <LeadCard key={lead.id} lead={lead} onUpdate={handleUpdate} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
