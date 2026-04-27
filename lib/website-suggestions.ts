interface WebSuggestion {
  tipo: string
  descripcion: string
  precio: string
}

const SUGGESTIONS: Record<string, WebSuggestion> = {
  // Gastronomía
  restaurant: {
    tipo: 'Landing + Menú Digital + Reservas',
    descripcion: 'Página con menú interactivo, galería de fotos, reservas online y mapa de ubicación.',
    precio: '$150.000 – $300.000',
  },
  cafe: {
    tipo: 'Landing + Carta Digital',
    descripcion: 'Página atractiva con carta del día, horarios, redes sociales y contacto directo.',
    precio: '$100.000 – $200.000',
  },
  bar: {
    tipo: 'Landing + Carta de Tragos',
    descripcion: 'Página con ambiente del local, carta de tragos, eventos y reservas.',
    precio: '$100.000 – $200.000',
  },
  bakery: {
    tipo: 'Tienda Online + Catálogo',
    descripcion: 'Catálogo de productos con pedidos online o WhatsApp, muy útil para pedidos anticipados.',
    precio: '$120.000 – $250.000',
  },
  meal_delivery: {
    tipo: 'Landing + Menú + Pedidos',
    descripcion: 'Página con menú completo, precios, zona de delivery y botón de pedido por WhatsApp.',
    precio: '$120.000 – $220.000',
  },
  food: {
    tipo: 'Landing + Menú Digital',
    descripcion: 'Presentación del local con menú, horarios y contacto.',
    precio: '$100.000 – $200.000',
  },

  // Salud
  doctor: {
    tipo: 'Web Profesional + Turnos Online',
    descripcion: 'Perfil del profesional, especialidades, horarios de atención y formulario de turnos.',
    precio: '$200.000 – $400.000',
  },
  dentist: {
    tipo: 'Web Clínica + Turnos Online',
    descripcion: 'Servicios dentales, equipo médico, antes/después y sistema de turnos.',
    precio: '$200.000 – $350.000',
  },
  physiotherapist: {
    tipo: 'Web Profesional + Agenda',
    descripcion: 'Servicios de kinesiología, técnicas usadas, testimonios y reserva de sesiones.',
    precio: '$180.000 – $320.000',
  },
  pharmacy: {
    tipo: 'Web Institucional + Catálogo',
    descripcion: 'Información de la farmacia, servicios, medicamentos disponibles y guardia.',
    precio: '$150.000 – $280.000',
  },
  veterinary_care: {
    tipo: 'Web Veterinaria + Turnos',
    descripcion: 'Servicios veterinarios, equipo, tips de salud animal y reserva de turnos.',
    precio: '$180.000 – $320.000',
  },
  hospital: {
    tipo: 'Web Institucional Completa',
    descripcion: 'Especialidades, médicos, servicios, turnos y acceso a resultados.',
    precio: '$400.000 – $800.000',
  },

  // Belleza y cuidado personal
  beauty_salon: {
    tipo: 'Landing + Catálogo + Turnos',
    descripcion: 'Galería de trabajos, lista de servicios, precios y reserva de turno online.',
    precio: '$150.000 – $280.000',
  },
  hair_care: {
    tipo: 'Landing + Portfolio + Turnos',
    descripcion: 'Galería de cortes y coloraciones, servicios disponibles y agenda online.',
    precio: '$120.000 – $250.000',
  },
  spa: {
    tipo: 'Landing Premium + Reservas',
    descripcion: 'Página elegante con servicios, promociones, gift cards y reservas.',
    precio: '$200.000 – $400.000',
  },
  nail_salon: {
    tipo: 'Landing + Portfolio',
    descripcion: 'Galería de trabajos, diseños disponibles, precios y contacto por WhatsApp.',
    precio: '$100.000 – $200.000',
  },

  // Fitness
  gym: {
    tipo: 'Web Gimnasio + Planes',
    descripcion: 'Planes de membresía, horarios de clases, instructores y formulario de inscripción.',
    precio: '$200.000 – $380.000',
  },
  fitness_center: {
    tipo: 'Web Fitness + Inscripciones',
    descripcion: 'Actividades, horarios, precios de planes y registro online.',
    precio: '$180.000 – $350.000',
  },

  // Comercio
  clothing_store: {
    tipo: 'Tienda Online',
    descripcion: 'Catálogo con filtros, carrito de compras, tallas y pasarela de pago.',
    precio: '$300.000 – $600.000',
  },
  shoe_store: {
    tipo: 'Tienda Online con Catálogo',
    descripcion: 'Catálogo de calzado con tallas, colores y compra online o por WhatsApp.',
    precio: '$280.000 – $550.000',
  },
  jewelry_store: {
    tipo: 'Tienda Online Premium',
    descripcion: 'Catálogo de joyas con fotos de alta calidad, personalización y compra segura.',
    precio: '$300.000 – $600.000',
  },
  home_goods_store: {
    tipo: 'Tienda Online + Catálogo',
    descripcion: 'Catálogo de productos para el hogar con precios, stock y compra online.',
    precio: '$280.000 – $500.000',
  },
  hardware_store: {
    tipo: 'Web Institucional + Catálogo',
    descripcion: 'Catálogo de productos con búsqueda, precios y pedidos por WhatsApp.',
    precio: '$200.000 – $380.000',
  },
  supermarket: {
    tipo: 'Web + Catálogo de Ofertas',
    descripcion: 'Catálogo de productos, ofertas de la semana, horarios y contacto.',
    precio: '$250.000 – $450.000',
  },
  book_store: {
    tipo: 'Tienda Online de Libros',
    descripcion: 'Catálogo con buscador por título/autor, novedades y compra online.',
    precio: '$250.000 – $450.000',
  },
  electronics_store: {
    tipo: 'Tienda Online',
    descripcion: 'Catálogo de electrónica con especificaciones técnicas, precios y compra.',
    precio: '$300.000 – $600.000',
  },
  furniture_store: {
    tipo: 'Catálogo Online + 3D',
    descripcion: 'Catálogo de muebles con visualizador de ambientes y pedidos a medida.',
    precio: '$350.000 – $700.000',
  },
  optical_store: {
    tipo: 'Web + Catálogo de Marcos',
    descripcion: 'Catálogo de marcos y lentes, servicios ópticos y medición de graduación.',
    precio: '$200.000 – $380.000',
  },

  // Servicios profesionales
  lawyer: {
    tipo: 'Web Profesional',
    descripcion: 'Perfil del estudio, áreas de práctica, casos de éxito y contacto para consultas.',
    precio: '$250.000 – $450.000',
  },
  accounting: {
    tipo: 'Web Profesional',
    descripcion: 'Servicios contables, equipo, clientes y formulario de contacto.',
    precio: '$200.000 – $380.000',
  },
  insurance_agency: {
    tipo: 'Web + Cotizador Online',
    descripcion: 'Tipos de seguros, cotizador interactivo y contacto con asesores.',
    precio: '$280.000 – $500.000',
  },
  real_estate_agency: {
    tipo: 'Portal Inmobiliario',
    descripcion: 'Listado de propiedades con fotos, filtros de búsqueda, mapa y contacto.',
    precio: '$400.000 – $800.000',
  },
  travel_agency: {
    tipo: 'Web + Paquetes de Viaje',
    descripcion: 'Destinos disponibles, paquetes con precios, galería y reservas online.',
    precio: '$300.000 – $550.000',
  },

  // Educación
  school: {
    tipo: 'Web Institucional Educativa',
    descripcion: 'Presentación de la institución, niveles, cuerpo docente e inscripciones.',
    precio: '$300.000 – $600.000',
  },
  tutoring_center: {
    tipo: 'Web + Inscripciones',
    descripcion: 'Cursos disponibles, docentes, metodología, precios e inscripción online.',
    precio: '$200.000 – $380.000',
  },

  // Mecánica / Autos
  car_repair: {
    tipo: 'Web Taller + Turnos',
    descripcion: 'Servicios mecánicos, equipo, marca de autos atendidos y turno online.',
    precio: '$180.000 – $320.000',
  },
  car_dealer: {
    tipo: 'Portal de Autos',
    descripcion: 'Catálogo de vehículos con fotos, km, precio y contacto por WhatsApp.',
    precio: '$350.000 – $700.000',
  },

  // Hospedaje
  lodging: {
    tipo: 'Web Hotel + Reservas',
    descripcion: 'Habitaciones con fotos, precios por fecha, servicios y motor de reservas.',
    precio: '$350.000 – $700.000',
  },
  hotel: {
    tipo: 'Web Hotel Premium + Reservas',
    descripcion: 'Galería de habitaciones, servicios, galería del hotel, precios y reservas.',
    precio: '$400.000 – $800.000',
  },
}

const DEFAULT_SUGGESTION: WebSuggestion = {
  tipo: 'Web Profesional',
  descripcion: 'Página presentación del negocio con descripción, servicios, fotos de trabajos, datos de contacto y ubicación.',
  precio: '$150.000 – $300.000',
}

export function getWebSuggestion(placeTypes: string[]): WebSuggestion {
  for (const t of placeTypes) {
    const key = t.toLowerCase()
    if (SUGGESTIONS[key]) return SUGGESTIONS[key]
  }
  return DEFAULT_SUGGESTION
}

export function categoriaFromTypes(placeTypes: string[]): string {
  const map: Record<string, string> = {
    restaurant: 'Restaurantes',
    cafe: 'Cafeterías',
    bar: 'Bares',
    bakery: 'Panaderías',
    clothing_store: 'Ropa y accesorios',
    shoe_store: 'Calzado',
    hardware_store: 'Ferreterías',
    pharmacy: 'Farmacias',
    supermarket: 'Supermercados',
    doctor: 'Médicos y clínicas',
    hospital: 'Clínicas',
    dentist: 'Dentistas',
    gym: 'Gimnasios',
    fitness_center: 'Gimnasios',
    hair_care: 'Peluquerías',
    beauty_salon: 'Salones de belleza',
    nail_salon: 'Manicuría',
    spa: 'Spa',
    car_repair: 'Talleres mecánicos',
    real_estate_agency: 'Inmobiliarias',
    lodging: 'Hoteles y hospedajes',
    hotel: 'Hoteles y hospedajes',
    veterinary_care: 'Veterinarias',
    school: 'Colegios y academias',
    tutoring_center: 'Academias',
    lawyer: 'Abogados',
    accounting: 'Contadores',
    travel_agency: 'Agencias de viaje',
    electronics_store: 'Electrodomésticos',
    furniture_store: 'Mueblería',
    jewelry_store: 'Joyerías',
    optical_store: 'Ópticas',
    book_store: 'Librerías',
    physiotherapist: 'Kinesiología',
    insurance_agency: 'Seguros',
    car_dealer: 'Concesionarias',
    meal_delivery: 'Delivery',
  }
  for (const t of placeTypes) {
    if (map[t]) return map[t]
  }
  return placeTypes[0]?.replace(/_/g, ' ') || 'Negocio local'
}
