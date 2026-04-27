import { NextRequest, NextResponse } from 'next/server'
import { getWebSuggestion, categoriaFromTypes } from '@/lib/website-suggestions'

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY

interface PlaceResult {
  place_id: string
  nombre: string
  telefono?: string
  direccion?: string
  categoria: string
  website?: string
  tiene_web: boolean
  tipo_web_sugerida: string
  descripcion_propuesta: string
  precio_estimado: string
  rating?: number
  total_ratings?: number
}

// Map category names to Google Places types
const CATEGORY_TO_QUERY: Record<string, string> = {
  'Restaurantes': 'restaurant',
  'Cafeterías': 'cafe',
  'Bares': 'bar',
  'Panaderías': 'bakery',
  'Ropa y accesorios': 'clothing_store',
  'Ferreterías': 'hardware_store',
  'Farmacias': 'pharmacy',
  'Supermercados': 'supermarket',
  'Médicos y clínicas': 'doctor',
  'Dentistas': 'dentist',
  'Gimnasios': 'gym',
  'Peluquerías': 'hair_care',
  'Salones de belleza': 'beauty_salon',
  'Talleres mecánicos': 'car_repair',
  'Inmobiliarias': 'real_estate_agency',
  'Hoteles y hospedajes': 'lodging',
  'Veterinarias': 'veterinary_care',
  'Colegios y academias': 'school',
  'Abogados': 'lawyer',
  'Contadores': 'accounting',
  'Agencias de viaje': 'travel_agency',
  'Electrodomésticos': 'electronics_store',
  'Mueblería': 'furniture_store',
  'Joyerías': 'jewelry_store',
  'Ópticas': 'optical_store',
  'Librerías': 'book_store',
}

const FIELDS = 'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.types,places.rating,places.userRatingCount'

async function searchNearby(lat: number, lng: number, placeType: string): Promise<PlaceResult[]> {
  const body = {
    includedTypes: [placeType],
    maxResultCount: 20,
    locationRestriction: {
      circle: {
        center: { latitude: lat, longitude: lng },
        radius: 5000,
      },
    },
  }

  const res = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_API_KEY!,
      'X-Goog-FieldMask': FIELDS,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Google Places API error: ${err}`)
  }

  const data = await res.json()
  return parsePlaces(data.places || [], placeType)
}

async function searchByText(query: string, categoria: string): Promise<PlaceResult[]> {
  const placeType = CATEGORY_TO_QUERY[categoria] || categoria

  const body = {
    textQuery: `${categoria} en ${query}`,
    maxResultCount: 20,
    languageCode: 'es',
  }

  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_API_KEY!,
      'X-Goog-FieldMask': FIELDS,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Google Places API error: ${err}`)
  }

  const data = await res.json()
  return parsePlaces(data.places || [], placeType)
}

function parsePlaces(places: any[], fallbackType: string): PlaceResult[] {
  return places.map((p: any) => {
    const types: string[] = p.types || [fallbackType]
    const suggestion = getWebSuggestion(types)
    const categoria = categoriaFromTypes(types)
    const tieneWeb = !!p.websiteUri

    return {
      place_id: p.id || '',
      nombre: p.displayName?.text || 'Sin nombre',
      telefono: p.nationalPhoneNumber || undefined,
      direccion: p.formattedAddress || undefined,
      categoria,
      website: p.websiteUri || undefined,
      tiene_web: tieneWeb,
      tipo_web_sugerida: suggestion.tipo,
      descripcion_propuesta: suggestion.descripcion,
      precio_estimado: suggestion.precio,
      rating: p.rating || undefined,
      total_ratings: p.userRatingCount || undefined,
    }
  })
    // Sort: no website first, then by rating desc
    .sort((a, b) => {
      if (a.tiene_web !== b.tiene_web) return a.tiene_web ? 1 : -1
      return (b.rating || 0) - (a.rating || 0)
    })
}

export async function GET(req: NextRequest) {
  if (!GOOGLE_API_KEY) {
    return NextResponse.json({ error: 'Google Places API key no configurada' }, { status: 500 })
  }

  const { searchParams } = req.nextUrl
  const categoria = searchParams.get('categoria')
  const ciudad = searchParams.get('ciudad')
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  if (!categoria) {
    return NextResponse.json({ error: 'Falta parámetro: categoria' }, { status: 400 })
  }

  try {
    let results: PlaceResult[]
    const placeType = CATEGORY_TO_QUERY[categoria] || 'establishment'

    if (lat && lng) {
      results = await searchNearby(parseFloat(lat), parseFloat(lng), placeType)
    } else if (ciudad) {
      results = await searchByText(ciudad, categoria)
    } else {
      return NextResponse.json({ error: 'Falta ubicación o ciudad' }, { status: 400 })
    }

    return NextResponse.json({ results })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
