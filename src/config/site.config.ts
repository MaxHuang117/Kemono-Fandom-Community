/*
|--------------------------------------------------------------------------
| Configuración global del sitio (fuente única de verdad)
|--------------------------------------------------------------------------
| Principio "config-driven" (PLAN_HUB_STREAMERS.md §6): cambiar un número o
| un texto aquí se refleja en toda la web, sin tocar componentes.
|
| - Texto/números/límites/flags → este archivo.
| - Contenido dinámico (hero, creadores, sponsors, supporters, noticias)
|   → base de datos.
|
| Los componentes y server actions DEBEN leer de aquí; no hardcodear.
|--------------------------------------------------------------------------
*/

export const SITE_CONFIG = {
  /** Marca y nombres de secciones visibles. */
  brand: {
    name: "Kemono Fandom",
    tagline: "Comunidad oficial para creadores, fans y colaboradores del ecosistema Kemono.",
    sectionCreators: "Creadores",
    sectionNews: "Novedades",
  },

  /** URL de donaciones (StreamElements). Fase 1: botón Donar en Navbar/Hero/Footer. */
  donationUrl: "https://streamelements.com/maxhuang117/tip",

  /** Etiquetas de los niveles de estado/rol, indexadas por `profiles.tier_level`. */
  tierLabels: ["Miembro", "Creador aprobado", "Creador destacado"],

  /** Límites del sistema de slides VIP (Creador destacado, nivel 2). */
  slides: {
    maxSlides: 3,
    maxImageMB: 2,
  },

  /** Descubrimiento: top creadores y pesos del "Sorpréndeme". */
  discover: {
    topCreatorsCount: 5,
    /** Random ponderado: los destacados (nivel 2) salen con más frecuencia. */
    surpriseWeights: { tier1: 1, tier2: 3 },
  },

  /** Comentarios en perfiles (Fase 5). Valores por defecto por creador. */
  profileComments: {
    enabledDefault: false,
    moderatedDefault: true,
    maxLength: 500,
  },

  /** Categorías principales de la postulación (`profiles.streamer_category`). */
  categories: [
    "Gaming",
    "Furry",
    "VTuber",
    "Just Chatting",
    "Música",
    "Arte",
    "IRL",
    "Speedrun",
  ],

  /** Tags multi-selección (`profiles.tags`), agrupados para la UI. */
  tags: {
    countries: [
      "México", "Argentina", "Colombia", "Chile", "Perú", "España",
      "Ecuador", "Venezuela", "Uruguay", "Bolivia", "Paraguay",
      "Costa Rica", "Guatemala", "Cuba", "República Dominicana",
      "Panamá", "Honduras", "Nicaragua", "El Salvador", "Puerto Rico",
    ],
    genres: [
      "FPS", "Battle Royale", "MOBA", "Variety", "Horror",
      "Retro", "Indie", "RPG", "Música", "Artista",
    ],
    languages: ["Español", "English", "Bilingüe"],
  },

  /** Límites de validación (replican las constantes de las server actions). */
  limits: {
    bioLength: 200,
    bannerMB: 2,
  },

  /** Feature flags: activar/desactivar secciones sin borrar código. */
  features: {
    notifications: true,
    surpriseMe: true,
    profileComments: true,
  },
} as const;

/** Lista plana de todos los tags válidos (países + géneros + idiomas). */
export const ALL_TAGS: readonly string[] = [
  ...SITE_CONFIG.tags.countries,
  ...SITE_CONFIG.tags.genres,
  ...SITE_CONFIG.tags.languages,
];
