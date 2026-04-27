import { NextRequest, NextResponse } from 'next/server'
import { getWebSuggestion, categoriaFromTypes } from '@/lib/website-suggestions'

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY

const BUSINESS_TYPES = [
  'restaurant', 'cafe', 'bar', 'bakery', 'meal_delivery',
  'hair_care', 'beauty_salon', 'nail_salon', 'spa', 'barber_shop',
  'gym', 'fitness_center',
  'dentist', 'doctor', 'physiotherapist', 'veterinary_care',
  'car_repair', 'car_dealer',
  'clothing_store', 'shoe_store', 'jewelry_store', 'furniture_store',
  'hardware_store', 'electronics_store', 'book_store', 'optical_store',
  'pharmacy', 'supermarket',
  'accounting', 'lawyer', 'real_estate_agency', 'travel_agency',
  'school', 'tutoring_center', 'lodging',
]

const FIELDS = 'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.types,places.rating,places.userRatingCount,places.location'

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000
  const phi1 = lat1 * Math.PI / 180
  const phi2 = lat2 * Math.PI / 180
  const dPhi = (lat2 - lat1) * Math.PI / 180
  const dLam = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dPhi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLam / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function needScore(p: any): number {
  let score = 0
  if (!p.websiteUri) score += 20
  if (p.nationalPhoneNumber) score += 5
  const rating = p.rating || 0
  const reviews = p.userRatingCount || 0
  if (rating > 0 && rating < 3.8) score += 4
  if (reviews < 30) score += 3
  if (reviews === 0) score += 2
  return score
}

export async function GET(req: NextRequest) {
  if (!GOOGLE_API_KEY) {
    return NextResponse.json({ error: 'Google Places API key no configurada' }, { status: 500 })
  }

  const { searchParams } = req.nextUrl
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Se requiere ubicacion GPS (lat y lng)' }, { status: 400 })
  }

  const userLat = parseFloat(lat)
  const userLng = parseFloat(lng)

  try {
    const BATCH_SIZE = 8
    const allPlaces: any[] = []

    for (let i = 0; i < BUSINESS_TYPES.length; i += BATCH_SIZE) {
      const batch = BUSINESS_TYPES.slice(i, i + BATCH_SIZE)

      const batchResults = await Promise.allSettled(
        batch.map(type =>
          fetch('https://places.googleapis.com/v1/places:searchNearby', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Goog-Api-Key': GOOGLE_API_KEY!,
              'X-Goog-FieldMask': FIELDS,
            },
            body: JSON.stringify({
              includedTypes: [type],
              maxResultCount: 10,
              locationRestriction: {
                circle: {
                  center: { latitude: userLat, longitude: userLng },
                  radius: 3000,
                },
              },
            }),
          }).then(r => r.json())
        )
      )

      for (const result of batchResults) {
        if (result.status === 'fulfilled' && result.value?.places) {
          allPlaces.push(...result.value.places)
        }
      }
    }

    // Deduplicar por ID
    const seen = new Set<string>()
    const unique = allPlaces.filter(p => {
      if (!p.id || seen.has(p.id)) return false
      seen.add(p.id)
      return true
    })

    // Solo potenciales: sin web, con minimo puntaje
    const potenciales = unique.filter(p => !p.websiteUri && needScore(p) >= 5)

    // Calcular distancia y formatear
    const results = potenciales.map(p => {
      const types: string[] = p.types || []
      const suggestion = getWebSuggestion(types)
      const categoria = categoriaFromTypes(types)
      const dist = p.location
        ? Math.round(haversine(userLat, userLng, p.location.latitude, p.location.longitude))
        : 99999

      return {
        place_id: p.id || '',
        nombre: p.displayName?.text || 'Sin nombre',
        telefono: p.nationalPhoneNumber || undefined,
        direccion: p.formattedAddress || undefined,
        categoria,
        website: p.websiteUri || undefined,
        tiene_web: !!p.websiteUri,
        tipo_web_sugerida: suggestion.tipo,
        descripcion_propuesta: suggestion.descripcion,
        precio_estimado: suggestion.precio,
        rating: p.rating || undefined,
        total_ratings: p.userRatingCount || undefined,
        need_score: needScore(p),
        distancia: dist,
      }
    })

    // Ordenar por distancia (mas cerca primero)
    results.sort((a, b) => a.distancia - b.distancia)

    return NextResponse.json({ results })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}