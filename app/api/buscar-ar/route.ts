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

  // Sin web = oportunidad directa
  if (!tieneWeb) s += 45

  // Negocio establecido (más reseñas = más clientes = más necesidad)
  if (ratings >= 20) s += 10
  if (ratings >= 50) s += 10
  if (ratings >= 100) s += 10
  if (ratings >= 200) s += 5

  // Bien calificado (tiene buena reputación, puede pagar)
  if (rating >= 4.0) s += 10
  if (rating >= 4.5) s += 5

  // Tiene teléfono (se puede contactar)
  if (p.nationalPhoneNumber) s += 15

  return Math.min(s, 100)
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const ciudad = searchParams.get('ciudad')?.trim() || 'Buenos Aires'
  const rubro = searchParams.get('rubro')?.trim() || 'restaurante'
  const soloSinWeb = searchParams.get('sinweb') === '1'
  const minResenas = parseInt(searchParams.get('minresenas') || '15')

  if (!KEY) return NextResponse.json({ error: 'Google API key no configurada' }, { status: 500 })

  const query = `${rubro} en ${ciudad} Argentina`
  const FIELDS = 'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.types,places.rating,places.userRatingCount'

  try {
    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': KEY,
        'X-Goog-FieldMask': FIELDS,
      },
      body: JSON.stringify({
        textQuery: query,
        languageCode: 'es',
        regionCode: 'AR',
        maxResultCount: 20,
      }),
    })

    if (!res.ok) {
      const txt = await res.text()
      return NextResponse.json({ error: `Google Places: ${res.status} — ${txt}` }, { status: 502 })
    }

    const data = await res.json()
    const places: any[] = data.places || []

    const results = places
      .filter(p => {
        const r = p.userRatingCount || 0
        const rating = p.rating || 0
        return r >= minResenas && rating >= 3.5
      })
      .map(p => {
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

    return NextResponse.json({ results, ciudad, rubro, total: results.length })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
