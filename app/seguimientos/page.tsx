'use client'
import { useEffect, useState } from 'react'
import { Lead } from '@/types/lead'
import LeadCard from '@/components/LeadCard'
import Link from 'next/link'

export default function SeguimientosPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [cargando, setCargando] = useState(true)

  const cargar = async () => {
    setCargando(true)
    const r = await fetch('/api/leads?seguimiento=pendiente').then(r => r.json())
    setLeads(r.leads || [])
    setCargando(false)
  }

  useEffect(() => { cargar() }, [])

  const handleUpdate = async (id: string, changes: Partial<Lead>) => {
    await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(changes),
    })
    // Si se reprogramó a futuro o se limpió, sale de la cola de hoy.
    const salioDeLaCola =
      ('proximo_seguimiento' in changes && (!changes.proximo_seguimiento || new Date(changes.proximo_seguimiento as string) > new Date())) ||
      changes.estado === 'vendido' || changes.estado === 'descartado'
    if (salioDeLaCola) {
      setLeads(prev => prev.filter(l => l.id !== id))
    } else {
      setLeads(prev => prev.map(l => l.id === id ? { ...l, ...changes } : l))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este lead?')) return
    await fetch(`/api/leads/${id}`, { method: 'DELETE' })
    setLeads(prev => prev.filter(l => l.id !== id))
  }

  return (
    <div className="py-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-900 text-lg">🔔 Para hoy</h2>
          <p className="text-xs text-gray-500">Leads que toca recontactar</p>
        </div>
        {leads.length > 0 && (
          <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full font-medium">{leads.length} pendientes</span>
        )}
      </div>

      {cargando ? (
        <div className="py-16 text-center text-gray-400">Cargando...</div>
      ) : leads.length === 0 ? (
        <div className="py-16 text-center text-gray-400 space-y-3">
          <p className="text-5xl">☕</p>
          <p className="font-semibold text-gray-600">Estás al día</p>
          <p className="text-sm">No hay seguimientos pendientes para hoy.<br />Cuando contactes un lead, programale el próximo toque.</p>
          <Link href="/" className="inline-block bg-blue-700 text-white px-6 py-3 rounded-2xl font-medium text-sm mt-2">Ver pendientes</Link>
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
