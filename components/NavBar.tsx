'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import SettingsModal from './SettingsModal'
import { Settings } from 'lucide-react'

const TABS: { href: string; emoji: string; label: string }[] = [
  { href: '/buscar',    emoji: '🔍', label: 'Zona' },
  { href: '/buscar-ar', emoji: '🇦🇷', label: 'Argentina' },
  { href: '/',          emoji: '⏳', label: 'Pendientes' },
  { href: '/en-proceso',emoji: '🤝', label: 'En proceso' },
  { href: '/vendidos',  emoji: '✅', label: 'Vendidos' },
]

export default function NavBar() {
  const pathname = usePathname()
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-50 bg-blue-700 text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-xl">🎯</span>
          <div>
            <h1 className="font-bold text-base leading-tight">WebLeads</h1>
            <p className="text-blue-200 text-xs">Buscador de clientes potenciales</p>
          </div>
        </div>
        <button
          onClick={() => setSettingsOpen(true)}
          className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 transition-colors"
          title="Mis datos"
        >
          <Settings size={18} />
        </button>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex max-w-lg mx-auto">
        {TABS.map(({ href, emoji, label }) => {
          const active = href === '/'
            ? pathname === '/'
            : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                active ? 'text-blue-700' : 'text-gray-400 hover:text-blue-600'
              }`}
            >
              <span className="text-base leading-none">{emoji}</span>
              <span className="text-[10px] font-medium leading-tight text-center">{label}</span>
              {active && <span className="w-1 h-1 bg-blue-700 rounded-full" />}
            </Link>
          )
        })}
      </nav>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  )
}
