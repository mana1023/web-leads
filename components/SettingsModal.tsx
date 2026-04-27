'use client'
import { useState, useEffect } from 'react'
import { X, Save } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
}

export interface UserSettings {
  nombre: string
  agencia: string
}

export function getSettings(): UserSettings {
  if (typeof window === 'undefined') return { nombre: '', agencia: '' }
  try {
    return JSON.parse(localStorage.getItem('wl_settings') || '{}')
  } catch {
    return { nombre: '', agencia: '' }
  }
}

export default function SettingsModal({ open, onClose }: Props) {
  const [nombre, setNombre] = useState('')
  const [agencia, setAgencia] = useState('')
  const [guardado, setGuardado] = useState(false)

  useEffect(() => {
    if (open) {
      const s = getSettings()
      setNombre(s.nombre || '')
      setAgencia(s.agencia || '')
      setGuardado(false)
    }
  }, [open])

  const guardar = () => {
    localStorage.setItem('wl_settings', JSON.stringify({ nombre, agencia }))
    setGuardado(true)
    setTimeout(onClose, 800)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white w-full max-w-lg rounded-t-3xl p-6 space-y-4 pb-10" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-900 text-lg">Mis datos</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <p className="text-xs text-gray-500">Tus datos se usan para personalizar los mensajes de WhatsApp que mandas a los negocios.</p>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">TU NOMBRE</label>
            <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Juan Perez" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">NOMBRE DE TU AGENCIA</label>
            <input type="text" value={agencia} onChange={e => setAgencia(e.target.value)} placeholder="Ej: WebPro Agency" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div className="bg-green-50 rounded-xl p-3">
          <p className="text-xs font-semibold text-green-800 mb-1">Tu mensaje de WhatsApp:</p>
          <p className="text-xs text-green-700 italic whitespace-pre-line">{`Hola [Negocio] 👋 Soy ${nombre || 'tu nombre'}${agencia ? ` — ${agencia}` : ''}, programador web freelance. Vi que todavia no tenes tu propia pagina web y me gustaria ayudarte.\n\n✔ Diseno profesional desde cero\n✔ Adaptado para celulares 📱\n✔ Precio accesible\n\nTe paso una propuesta sin compromiso 🙂`}</p>
        </div>
        <button onClick={guardar} className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-colors ${guardado ? 'bg-green-600 text-white' : 'bg-blue-700 hover:bg-blue-800 text-white'}`}>
          <Save size={16} />
          {guardado ? 'Guardado!' : 'Guardar datos'}
        </button>
      </div>
    </div>
  )
}