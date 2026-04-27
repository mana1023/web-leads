'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import SettingsModal from './SettingsModal'
import { Settings } from 'lucide-react'

const TABS = [
  { href: '/buscar', icon: 'Buscar', emoji: 'magnifying' },
  { href: '/', icon: 'Pendientes', emoji: 'pending' },
  { href: '/en-proceso', icon: 'En proceso', emoji: 'process' },
  { href: '/vendidos', icon: 'Vendidos', emoji: 'done' },
]

const ICONS: Record<string, string> = {
  '/buscar': '🔍',
  '/': '⏳',
  '/en-proceso': '🤝',
  '/vendidos': '✅',
}

export default function NavBar() {
  const pathname = usePathname()
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-50 bg-blue-700 text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-xl">{'🎯'}</span>
          <div>
            <h1 className="font-bold text-base leading-tight">WebLeads</h1>
            <p className="text-blue-200 text-xs">Buscador de clientes potenciales</p>
          </div>
        </div>
        <button onClick={() => setSettingsOpen(true)} className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 transition-colors" title="Mis datos">
          <Settings size={18} />
        </button>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex max-w-lg mx-auto">
        {['/buscar', '/', '/en-proceso', '/vendidos'].map(href => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          const labels: Record<string, string> = { '/buscar': 'Buscar', '/': 'Pendientes', '/en-proceso': 'En proceso', '/vendidos': 'Vendidos' }
          return (
            <Link key={href} href={href} className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors text-xs font-medium ${active ? 'text-blue-700' : 'text-gray-500 hover:text-blue-600'}`}>
              <span className="text-lg leading-none">{ICONS[href]}</span>
              <span>{labels[href]}</span>
              {active && <span className="w-1 h-1 bg-blue-700 rounded-full" />}
            </Link>
          )
        })}
      </nav>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  )
}