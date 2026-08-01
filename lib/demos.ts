// Matcher de demos: elige qué demo real mostrarle a cada negocio segun su rubro.
// Las demos viven en /public/*.html y se sirven desde el dominio de deploy.

export interface DemoMatch {
  file: string      // archivo dentro de /public
  rubro: string     // etiqueta amigable para el mensaje ("una hamburgueseria")
}

// Reglas por palabra clave (nombre + categoria). Orden = prioridad.
const REGLAS: { test: RegExp; demo: DemoMatch }[] = [
  { test: /burger|hamburgues|smash|birra burger/i, demo: { file: 'smashburgers-demo.html', rubro: 'una hamburgueseria' } },
  { test: /cervec|beer|birra|brew/i,               demo: { file: 'beerhouse1973-demo.html', rubro: 'una cerveceria' } },
  { test: /parrilla|bodeg[oó]n|asado|resto ?bar/i, demo: { file: 'ladorita-demo.html', rubro: 'una parrilla' } },
  { test: /\bbar\b|boliche|pub|tragos|cocteler/i,  demo: { file: 'bolichederoberto-demo.html', rubro: 'un bar' } },
  { test: /panader|confiter|pasteler|factura|tortas?/i, demo: { file: 'lafavorita-demo.html', rubro: 'una panaderia' } },
  { test: /caf[eé]|cafeter|coffee|brunch/i,        demo: { file: 'bruzzone-demo.html', rubro: 'una cafeteria' } },
  { test: /gimnasio|\bgym\b|fitness|crossfit|musculaci/i, demo: { file: 'powergym-demo.html', rubro: 'un gimnasio' } },
  { test: /peluquer|barber|barbería|barberia|corte de pelo/i, demo: { file: 'gentlemanclub-demo.html', rubro: 'una barberia' } },
  { test: /veterinar|mascota|animal/i,             demo: { file: 'marimon-veterinaria-demo.html', rubro: 'una veterinaria' } },
  { test: /evento|sal[oó]n de fiesta|fiesta|casamiento|cumplea/i, demo: { file: 'lacasadelosquinotos-demo.html', rubro: 'un salon de eventos' } },
  { test: /pizza|pizzer|empanada|resta?urant|comida|delivery|rotiser/i, demo: { file: 'ladorita-demo.html', rubro: 'un restaurante' } },
]

// Fallback por categoria exacta (las que devuelve categoriaFromTypes)
const POR_CATEGORIA: Record<string, DemoMatch> = {
  'Restaurantes': { file: 'ladorita-demo.html', rubro: 'un restaurante' },
  'Cafeterías': { file: 'bruzzone-demo.html', rubro: 'una cafeteria' },
  'Bares': { file: 'bolichederoberto-demo.html', rubro: 'un bar' },
  'Panaderías': { file: 'lafavorita-demo.html', rubro: 'una panaderia' },
  'Delivery': { file: 'smashburgers-demo.html', rubro: 'un local de comidas' },
  'Gimnasios': { file: 'powergym-demo.html', rubro: 'un gimnasio' },
  'Peluquerías': { file: 'gentlemanclub-demo.html', rubro: 'una peluqueria' },
  'Salones de belleza': { file: 'gentlemanclub-demo.html', rubro: 'un salon' },
  'Veterinarias': { file: 'marimon-veterinaria-demo.html', rubro: 'una veterinaria' },
}

/**
 * Devuelve la mejor demo para un negocio, o null si no hay una que encaje bien.
 * Se apoya en el nombre + la categoria para acertarle al rubro real.
 */
export function getDemoMatch(nombre: string, categoria: string): DemoMatch | null {
  const texto = `${nombre} ${categoria}`
  for (const { test, demo } of REGLAS) {
    if (test.test(texto)) return demo
  }
  if (POR_CATEGORIA[categoria]) return POR_CATEGORIA[categoria]
  return null
}

/** URL publica completa de la demo, lista para meter en el mensaje.
 *  Si no hay demo o no hay dominio configurado, devuelve null (no se
 *  muestra link roto ni relativo). */
export function getDemoUrl(match: DemoMatch | null, base: string | null | undefined): string | null {
  if (!match || !base) return null
  const clean = base.replace(/\/+$/, '')
  if (!/^https?:\/\//i.test(clean)) return null
  return `${clean}/${match.file}`
}
