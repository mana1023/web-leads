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

/** Normaliza un telefono argentino al formato que espera wa.me (54...). */
export function buildPhone(raw: string | null): string | null {
  if (!raw) return null
  const p = raw.replace(/\D/g, '')
  const norm = p.startsWith('0') ? p.slice(1) : p
  if (!norm) return null
  return norm.startsWith('54') ? norm : `54${norm}`
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

  // ── Msg 1: apertura (romper el hielo)
  const apertura = 'Hola, ¿cómo están? 👋'

  // ── Msg 2: pitch (despues de que responden). Con demo si la hay.
  const pitch = demoUrl
    ? `Soy ${nombre}, desarrollador web en formación 💻\n\n` +
      `Estoy sumando proyectos reales a mi portfolio, así que trabajo a un precio muy por debajo del mercado: yo gano experiencia y ustedes se llevan una web profesional por mucho menos.\n\n` +
      `Que esté empezando no baja la calidad, y quiero que lo vean ustedes mismos: les armé un ejemplo pensado para ${lead.nombre} 👇\n${demoUrl}\n\n` +
      `Acá pueden ver más trabajos míos:\n${portfolio}${lineaGestion}\n\n` +
      `¿Les interesa que lo charlemos? Sin compromiso 🙂`
    : `Soy ${nombre}, desarrollador web en formación 💻\n\n` +
      `Estoy sumando proyectos reales a mi portfolio, así que trabajo a un precio muy por debajo del mercado: yo gano experiencia y ustedes se llevan una web profesional por mucho menos.\n\n` +
      `Que esté empezando no baja la calidad. Miren algunos trabajos míos 👇\n${portfolio}${lineaGestion}\n\n` +
      `¿Les interesa que lo charlemos? Sin compromiso 🙂`

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
