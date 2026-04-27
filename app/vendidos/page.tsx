'use client'
import { useEffect, useState } from 'react'
import { Lead } from '@/types/lead'
import LeadCard from '@/components/LeadCard'
import Link from 'next/link'

export default function VendidosPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [cargando, setCargando] = useState(true)

  const cargar = async () => {
    setCargando(true)
    const r = await fetch('/api/leads?estado=vendido').then(r => r.json())
    setLeads(r.leads || [])
    setCargando(false)
  }

  useEffect(() => { cargar() }, [])

  const handleUpdate = async (id: string, changes: Partial<Lead>) => {
    await fetch(`/api/leads/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(changes) })
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...changes } : l))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar este lead?')) return
    await fetch(`/api/leads/${id}`, { method: 'DELETE' })
    setLeads(prev => prev.filter(l => l.id !== id))
  }

  const total = leads.length

  return (
    <div className="py-4 space-y-4">
      {total > 0 && (
        <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-2xl p-5 text-white text-center">
          <p className="text-5xl font-bold">{total}</p>
          <p className="text-green-200 text-sm mt-1">Cliente{total !== 1 ? 's' : ''} vendido{total !== 1 ? 's' : ''}</p>
        </div>
      )}
      <div>
        <h2 className="font-bold text-gray-900 text-lg">Vendidos</h2>
        <p className="text-xs text-gray-500">Proyectos cerrados</p>
      </div>
      {cargando ? (
        <div className="py-16 text-center text-gray-400">Cargando...</div>
      ) : leads.length === 0 ? (
        <div className="py-16 text-center text-gray-400 space-y-3">
          <p className="text-5xl">🏆</p>
          <p className="font-semibold text-gray-600">Todavia no vendiste nada</p>
          <p className="text-sm">Cuando cerres una venta, marca el lead como "Vendido"</p>
          <Link href="/buscar" className="inline-block bg-blue-700 text-white px-6 py-3 rounded-2xl font-medium text-sm mt-2">Buscar clientes</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map(lead => <LeadCard key={lead.id} lead={lead} onUpdate={handleUpdate} onDelete={handleDelete} />)}
        </div>
      )}
    </div>
  )
}