-- Ejecutar esto en Supabase SQL Editor
-- https://app.supabase.com → Tu proyecto → SQL Editor

CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  telefono TEXT,
  direccion TEXT,
  categoria TEXT NOT NULL,
  tiene_web BOOLEAN DEFAULT false,
  website_actual TEXT,
  tipo_web_sugerida TEXT NOT NULL,
  descripcion_propuesta TEXT,
  estado TEXT DEFAULT 'nuevo' CHECK (estado IN ('nuevo','contactado','en_proceso','vendido','descartado')),
  notas TEXT,
  google_place_id TEXT UNIQUE,
  proximo_seguimiento TIMESTAMPTZ,
  ultimo_contacto TIMESTAMPTZ,
  intentos INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS leads_estado_idx ON leads(estado);
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS leads_proximo_seguimiento_idx ON leads(proximo_seguimiento) WHERE proximo_seguimiento IS NOT NULL;

-- Row Level Security (RLS) - dejarlo público por ahora para uso personal
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acceso público" ON leads FOR ALL USING (true) WITH CHECK (true);
