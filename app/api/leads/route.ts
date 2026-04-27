import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const estado = searchParams.get('estado') || 'todos'

  let query = supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })

  if (estado !== 'todos') {
    query = query.eq('estado', estado)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ leads: data })
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  const lead = {
    nombre: body.nombre,
    telefono: body.telefono || null,
    direccion: body.direccion || null,
    categoria: body.categoria,
    tiene_web: body.tiene_web || false,
    website_actual: body.website || null,
    tipo_web_sugerida: body.tipo_web_sugerida,
    descripcion_propuesta: body.descripcion_propuesta,
    estado: 'nuevo',
    google_place_id: body.place_id || null,
  }

  const { data, error } = await supabase
    .from('leads')
    .insert(lead)
    .select()
    .single()

  if (error) {
    // Duplicate place_id → already saved
    if (error.code === '23505') {
      return NextResponse.json({ message: 'Ya guardado' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ lead: data }, { status: 201 })
}
