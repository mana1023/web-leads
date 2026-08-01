-- MIGRACIÓN: motor de seguimientos
-- Ejecutar UNA vez en Supabase → SQL Editor (https://app.supabase.com)
-- Agrega los campos para saber a quién recontactar y cuándo.

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS proximo_seguimiento TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ultimo_contacto TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS intentos INTEGER DEFAULT 0;

-- Índice para la cola de "recontactar hoy"
CREATE INDEX IF NOT EXISTS leads_proximo_seguimiento_idx
  ON leads(proximo_seguimiento)
  WHERE proximo_seguimiento IS NOT NULL;
