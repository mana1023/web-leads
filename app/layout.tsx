import type { Metadata, Viewport } from 'next'
import './globals.css'
import NavBar from '@/components/NavBar'

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
      <body className="max-w-lg mx-auto min-h-screen flex flex-col bg-gray-50">
        <NavBar />
        <main className="flex-1 px-4 pb-24">
          {children}
        </main>
      </body>
    </html>
  )
}
