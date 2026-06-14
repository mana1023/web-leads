import { NextRequest, NextResponse } from 'next/server'
import { getWebSuggestion, categoriaFromTypes } from '@/lib/website-suggestions'

const KEY = process.env.GOOGLE_PLACES_API_KEY

const SOCIAL_DOMAINS = [
  'instagram.com', 'facebook.com', 'fb.com', 'twitter.com', 'x.com',
  'tiktok.com', 'youtube.com', 'linkedin.com', 'pinterest.com',
  'wa.me', 'whatsapp.com', 'linktr.ee', 'linktree.com',
  'maps.google.com', 'goo.gl', 'g.page',
  'tripadvisor.com', 'yelp.com', 'booking.com', 'mercadolibre.com',
]

// Ciudades y rubros con más potencial
const AUTO_CIUDADES = [
  'Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata',
  'Mar del Plata', 'Tucumán', 'Salta', 'Neuquén', 'Bahía Blanca',
]

const AUTO_RUBROS = [
  'restaurante', 'pizzería', 'peluquería', 'salón de belleza',
  'gimnasio', 'taller mecánico', 'veterinaria', 'mueblería',
  'cafetería', 'estética', 'manicuría', 'ferretería',
  'bar', 'panadería', 'kinesiólogo', 'dentista', 'farmacia',
]

const FIELDS = 'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.types,places.rating,places.userRatingCount'

function tieneWebReal(uri?: string): boolean {
  if (!uri) return false
  try {
    const host = new URL(uri).hostname.replace('www.', '').toLowerCase()
    return !SOCIAL_DOMAINS.some(d => host === d || host.endsWith('.' + d))
  } catch { return false }
}

function calcScore(p: any, tieneWeb: boolean): number {
  let s = 0
  const ratings = p.userRatingCount || 0
  const rating = p.rating || 0
  if (!tieneWeb) s += 45
  if (ratings >= 20) s += 10
  if (ratings >= 50) s += 10
  if (ratings >= 100) s += 10
  if (ratings >= 200) s += 5
  if (rating >= 4.0) s += 10
  if (rating >= 4.5) s += 5
  if (p.nationalPhoneNumber) s += 15
  return Math.min(s, 100)
}

async function searchOne(ciudad: string, rubro: string, minResenas: number) {
  const query = `${rubro} en ${ciudad} Argentina`
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': KEY!,
      'X-Goog-FieldMask': FIELDS,
    },
    body: JSON.stringify({
      textQuery: query,
      languageCode: 'es',
      regionCode: 'AR',
      maxResultCount: 20,
    }),
  })
  if (!res.ok) return []
  const data = await res.json()
  return (data.places || []).filter((p: any) =>
    (p.userRatingCount || 0) >= minResenas && (p.rating || 0) >= 3.5
  )
}

// Shuffle helper
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const auto = searchParams.get('auto') === '1'
  const ciudad = searchParams.get('ciudad')?.trim() || 'Buenos Aires'
  const rubro = searchParams.get('rubro')?.trim() || 'restaurante'
  const soloSinWeb = searchParams.get('sinweb') !== '0'
  const minResenas = parseInt(searchParams.get('minresenas') || '15')

  if (!KEY) return NextResponse.json({ error: 'Google API key no configurada' }, { status: 500 })

  try {
    let allPlaces: any[] = []

    if (auto) {
      // Modo auto: combinaciones aleatorias de ciudades × rubros en paralelo
      const ciudades = shuffle(AUTO_CIUDADES).slice(0, 4)
      const rubros = shuffle(AUTO_RUBROS).slice(0, 4)

      // Genera 8 pares únicos (ciudades × rubros mezclados)
      const pares: [string, string][] = []
      for (let i = 0; i < 4; i++) {
        pares.push([ciudades[i], rubros[i]])
        pares.push([ciudades[i % ciudades.length], rubros[(i + 2) % rubros.length]])
      }

      const resultados = await Promise.allSettled(
        pares.map(([c, r]) => searchOne(c, r, minResenas))
      )
      for (const r of resultados) {
        if (r.status === 'fulfilled') allPlaces.push(...r.value)
      }
    } else {
      // Modo manual: una ciudad + un rubro
      allPlaces = await searchOne(ciudad, rubro, minResenas)
    }

    // Deduplicar por place id
    const seen = new Set<string>()
    const unique = allPlaces.filter((p: any) => {
      if (seen.has(p.id)) return false
      seen.add(p.id)
      return true
    })

    const results = unique
      .map((p: any) => {
        const tieneWeb = tieneWebReal(p.websiteUri)
        const types: string[] = p.types || []
        const suggestion = getWebSuggestion(types)
        const categoria = categoriaFromTypes(types)
        const score = calcScore(p, tieneWeb)
        return {
          place_id: p.id,
          nombre: p.displayName?.text || 'Negocio',
          telefono: p.nationalPhoneNumber || null,
          direccion: p.formattedAddress || null,
          categoria,
          website: tieneWeb ? p.websiteUri : null,
          tiene_web: tieneWeb,
          tipo_web_sugerida: suggestion.tipo,
          descripcion_propuesta: suggestion.descripcion,
          precio_estimado: suggestion.precio,
          rating: p.rating ?? null,
          total_ratings: p.userRatingCount ?? 0,
          need_score: score,
        }
      })
      .filter(r => !soloSinWeb || !r.tiene_web)
      .sort((a, b) => b.need_score - a.need_score)

    return NextResponse.json({ results, total: results.length })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
