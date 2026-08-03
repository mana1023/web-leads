// Generador central de los mensajes de WhatsApp.
// Antes estaba duplicado en buscar-ar/page.tsx y LeadCard.tsx.
import { getDemoMatch, getDemoUrl, getGestionMatch, getGestionUrl } from './demos'

export interface MsgSettings {
  nombre: string
  linkPortfolio: string
  demoBaseUrl: string
}

export interface MsgLead {
  nombre: string
  telefono: string | null
  categoria: string
}

export interface Mensaje {
  key: 'apertura' | 'pitch' | 'seguimiento' | 'ultima'
  label: string
  hint: string
  texto: string
  url: string | null   // link wa.me listo, o null si no hay telefono
}

/** Normaliza un telefono argentino al formato de celular que espera wa.me: 549 + área + número.
 *  Saca el 0 inicial y el 15 de celular. OJO: si el número es una línea FIJA, no va a tener
 *  WhatsApp igual — hay que buscar el celular real en el Instagram/Facebook del negocio. */
export function buildPhone(raw: string | null): string | null {
  if (!raw) return null
  let p = raw.replace(/\D/g, '')
  p = p.replace(/^0/, '')            // saca el 0 inicial
  p = p.replace(/^(11|\d{3,4})15/, '$1') // saca el "15" de celular después del código de área
  if (!p) return null
  if (p.startsWith('549')) return p
  if (p.startsWith('54')) return '549' + p.slice(2)
  return '549' + p
}

function wa(phone: string | null, texto: string): string | null {
  if (!phone) return null
  return `https://wa.me/${phone}?text=${encodeURIComponent(texto)}`
}

/**
 * Devuelve los 4 mensajes del embudo para un lead, ya personalizados
 * con la demo del rubro cuando existe.
 */
export function construirMensajes(lead: MsgLead, settings: MsgSettings): Mensaje[] {
  const phone = buildPhone(lead.telefono)
  const nombre = settings.nombre || 'Lautaro'
  const portfolio = settings.linkPortfolio || 'https://mana-dev.vercel.app'
  const match = getDemoMatch(lead.nombre, lead.categoria)
  const demoUrl = getDemoUrl(match, settings.demoBaseUrl)
  const gestion = getGestionMatch(lead.nombre, lead.categoria)
  const gestionUrl = getGestionUrl(gestion, settings.demoBaseUrl)
  // Línea extra que ofrece el sistema de gestión, si aplica al rubro.
  const lineaGestion = gestionUrl
    ? `\n\nY si hoy manejan los turnos y la caja a mano o por WhatsApp, también les hago ${gestion!.que} 👇\n${gestionUrl}`
    : ''

  // ── Msg 1: apertura personalizada — tienta con valor y pide un "sí" (no vende todavía)
  const apertura = `¡Hola! 👋 Soy ${nombre}, desarrollador web. Les armé un ejemplo de página pensado para ${lead.nombre} y quería mostrárselos — ¿puedo? Es un minuto y sin compromiso 🙂`

  // ── Msg 2: pitch (después del "sí"). Arranca con la demo, explica lo de estudiante y pide la charla.
  const pitch = demoUrl
    ? `¡Genial! Mirá cómo les quedaría 👇\n${demoUrl}\n\n` +
      `Lo adapto 100% a ${lead.nombre}: fotos, colores y sus datos. Te cuento por qué te lo hago tan accesible: soy estudiante de programación armando mi portfolio con proyectos reales, así que cobro muy por debajo del mercado. Ganás vos — misma calidad, precio de estudiante.${lineaGestion}\n\n` +
      `Acá hay más trabajos míos: ${portfolio}\n\n` +
      `¿Lo charlamos unos minutos por acá, o te llamo cuando te quede cómodo? Sin compromiso 🙂`
    : `¡Genial! Te muestro algunos trabajos míos 👇\n${portfolio}\n\n` +
      `Soy estudiante de programación armando mi portfolio con proyectos reales, así que cobro muy por debajo del mercado: misma calidad, precio de estudiante.${lineaGestion}\n\n` +
      `¿Lo charlamos unos minutos por acá, o te llamo cuando te quede cómodo? Sin compromiso 🙂`

  // ── Msg 3: seguimiento (2-3 dias sin respuesta)
  const seguimiento = demoUrl
    ? `Hola! ¿Cómo andan? 👋 Les había escrito por el tema de la página para ${lead.nombre}.\n\n` +
      `¿Llegaron a ver el ejemplo que les pasé?\n${demoUrl}\n\n` +
      `Cualquier duda quedo a disposición, sin compromiso 🙂`
    : `Hola! ¿Cómo andan? 👋 Les había escrito por el tema de la página para ${lead.nombre}.\n\n` +
      `¿Llegaron a verlo? Cualquier duda quedo a disposición, sin compromiso 🙂`

  // ── Msg 4: ultima (cierre suave, ~1 semana)
  const ultima =
    `Hola! Última consulta y no los molesto más 🙌\n\n` +
    `¿Les interesa que armemos la página o el sistema para ${lead.nombre}? Si es por precio o tiempos lo vemos tranquilos, me adapto. ¡Quedo atento! 🙂`

  return [
    { key: 'apertura', label: 'Msg 1 — Apertura', hint: '"Hola, ¿cómo están?"', texto: apertura, url: wa(phone, apertura) },
    { key: 'pitch', label: 'Msg 2 — Pitch', hint: demoUrl ? 'Con demo del rubro' : 'Con portfolio', texto: pitch, url: wa(phone, pitch) },
    { key: 'seguimiento', label: 'Msg 3 — Seguimiento', hint: 'A los 2-3 días', texto: seguimiento, url: wa(phone, seguimiento) },
    { key: 'ultima', label: 'Msg 4 — Cierre', hint: 'A la semana', texto: ultima, url: wa(phone, ultima) },
  ]
}
