import type { Metadata, Viewport } from 'next'
import './globals.css'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'WebLeads',
  description: 'Encontrá negocios que necesitan una página web',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'WebLeads',
  },
}

export const viewport: Viewport = {
  themeColor: '#1d4ed8',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="max-w-lg mx-auto min-h-screen flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-50 bg-blue-700 text-white px-4 py-3 flex items-center gap-3 shadow-md">
          <span className="text-xl">🎯</span>
          <div>
            <h1 className="font-bold text-base leading-tight">WebLeads</h1>
            <p className="text-blue-200 text-xs">Encontrá clientes para tu agencia</p>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 px-4 pb-24">
          {children}
        </main>

        {/* Bottom tab bar */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex max-w-lg mx-auto">
          <Link
            href="/"
            className="flex-1 flex flex-col items-center justify-center py-3 text-gray-600 hover:text-blue-700 transition-colors gap-0.5"
          >
            <span className="text-xl">📋</span>
            <span className="text-xs font-medium">Mis Leads</span>
          </Link>
          <Link
            href="/buscar"
            className="flex-1 flex flex-col items-center justify-center py-3 text-gray-600 hover:text-blue-700 transition-colors gap-0.5"
          >
            <span className="text-xl">🔍</span>
            <span className="text-xs font-medium">Buscar</span>
          </Link>
          <Link
            href="/stats"
            className="flex-1 flex flex-col items-center justify-center py-3 text-gray-600 hover:text-blue-700 transition-colors gap-0.5"
          >
            <span className="text-xl">📊</span>
            <span className="text-xs font-medium">Estadísticas</span>
          </Link>
        </nav>
      </body>
    </html>
  )
}
