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
  linkPortfolio: string
  demoBaseUrl: string
}

// Por defecto las demos se sirven desde el MISMO dominio donde corre la app
// (viven en /public). Así funciona sin configurar nada, tanto en local como
// en producción. Se puede sobreescribir en Ajustes si las hospedás aparte.
function defaultDemoBase(): string {
  return typeof window !== 'undefined' ? window.location.origin : ''
}

export function getSettings(): UserSettings {
  if (typeof window === 'undefined') return { nombre: '', agencia: '', linkPortfolio: 'https://mana-dev.vercel.app', demoBaseUrl: '' }
  try {
    const s = JSON.parse(localStorage.getItem('wl_settings') || '{}')
    return {
      nombre: s.nombre || '',
      agencia: s.agencia || '',
      linkPortfolio: s.linkPortfolio || 'https://mana-dev.vercel.app',
      demoBaseUrl: s.demoBaseUrl || defaultDemoBase(),
    }
  } catch {
    return { nombre: '', agencia: '', linkPortfolio: 'https://mana-dev.vercel.app', demoBaseUrl: defaultDemoBase() }
  }
}

export default function SettingsModal({ open, onClose }: Props) {
  const [nombre, setNombre] = useState('')
  const [agencia, setAgencia] = useState('')
  const [linkPortfolio, setLinkPortfolio] = useState('https://mana-dev.vercel.app')
  const [demoBaseUrl, setDemoBaseUrl] = useState('')
  const [guardado, setGuardado] = useState(false)

  useEffect(() => {
    if (open) {
      const s = getSettings()
      setNombre(s.nombre)
      setAgencia(s.agencia)
      setLinkPortfolio(s.linkPortfolio)
      setDemoBaseUrl(s.demoBaseUrl)
      setGuardado(false)
    }
  }, [open])

  const guardar = () => {
    localStorage.setItem('wl_settings', JSON.stringify({ nombre, agencia, linkPortfolio, demoBaseUrl }))
    setGuardado(true)
    setTimeout(onClose, 800)
  }

  if (!open) return null

  const nombreMostrado = nombre || 'Lautaro'

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white w-full max-w-lg rounded-t-3xl p-6 space-y-4 pb-10 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-900 text-lg">Mis datos</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <p className="text-xs text-gray-500">
          Estos datos se usan para personalizar los mensajes de WhatsApp que les mandás a los negocios.
        </p>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">TU NOMBRE</label>
            <input
              type="text"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Ej: Lautaro"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">
              NOMBRE DE TU MARCA / AGENCIA{' '}
              <span className="font-normal text-gray-400">(opcional)</span>
            </label>
            <input
              type="text"
              value={agencia}
              onChange={e => setAgencia(e.target.value)}
              placeholder="Ej: AutoLocal"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">LINK DE TU PORTFOLIO / PÁGINA</label>
            <input
              type="url"
              value={linkPortfolio}
              onChange={e => setLinkPortfolio(e.target.value)}
              placeholder="https://mana-dev.vercel.app"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">Este link se incluye en el Mensaje 2 (pitch)</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">
              DOMINIO DE LAS DEMOS{' '}
              <span className="font-normal text-gray-400">(donde subís las páginas de ejemplo)</span>
            </label>
            <input
              type="url"
              value={demoBaseUrl}
              onChange={e => setDemoBaseUrl(e.target.value)}
              placeholder={defaultDemoBase()}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">Por defecto usa este mismo sitio. La app elige sola la demo del rubro: {(demoBaseUrl || defaultDemoBase())}/rubro-demo.html</p>
          </div>
        </div>

        {/* Preview de mensajes */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-600">VISTA PREVIA DE MENSAJES</p>
          <div className="bg-green-50 border border-green-100 rounded-xl p-3">
            <p className="text-xs font-bold text-green-800 mb-1">💬 Mensaje 1 — Apertura (mandás primero)</p>
            <p className="text-xs text-green-700 italic">Hola, ¿cómo están? 👋</p>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
            <p className="text-xs font-bold text-blue-800 mb-1">📋 Mensaje 2 — Pitch (después de que responden)</p>
            <p className="text-xs text-blue-700 italic whitespace-pre-line">{`Soy ${nombreMostrado}, programador y desarrollador web 💻\n\nTrabajo con locales armando sistemas que ahorran tiempo: página web, WhatsApp con IA, tienda online, control de stock y caja, turnos online y más.\n\nJusto armé un ejemplo de cómo les podría quedar la página 👇\n${demoBaseUrl || defaultDemoBase()}/[demo-del-rubro].html\n\nY acá pueden ver más trabajos míos:\n${linkPortfolio || 'https://mana-dev.vercel.app'}\n\n¿Les interesa que charlemos? Sin compromiso 🙂`}</p>
          </div>
          <p className="text-[11px] text-gray-400">La app elige sola la demo según el rubro del negocio. También hay Msg 3 (seguimiento) y Msg 4 (cierre) en cada lead.</p>
        </div>

        <button
          onClick={guardar}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-colors ${
            guardado ? 'bg-green-600 text-white' : 'bg-blue-700 hover:bg-blue-800 text-white'
          }`}
        >
          <Save size={16} />
          {guardado ? '¡Guardado!' : 'Guardar datos'}
        </button>
      </div>
    </div>
  )
}
