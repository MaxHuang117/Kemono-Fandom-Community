# Roadmap del producto

Este documento define las fases de desarrollo de Kemono Fandom Community. Cada fase tiene un objetivo claro; no se avanza a la siguiente hasta cumplir sus criterios de salida.

> **Regla transversal:** al terminar cada fase se ejecuta un **análisis de seguridad** de las Server Actions, rutas y tablas nuevas/modificadas antes de darla por cerrada (ver `docs/development/workflow.md`).

## Fase 1 — Fundación (completada)

**Objetivo:** dejar documentada la base del proyecto.

- README, STATUS y estructura de `docs/`.
- Inventario de rutas, Server Actions, tablas y buckets de Storage.
- Decisión documentada sobre la fuente de identidad (NextAuth con Discord) y su relación con el perfil en Supabase.

**Criterio de salida:** ✅ cualquier integrante puede entender el sistema leyendo `docs/`.

**Cierre:** documentación base, inventario del sistema y decisión de identidad registrados en `docs/architecture/overview.md` y `docs/development/workflow.md`.

## Fase 2 — Seguridad y estabilidad

**Objetivo:** que las operaciones existentes sean confiables antes de añadir funciones.

- Revisar cada Server Action: identidad obtenida desde la sesión, verificación de propiedad y de permisos en el servidor.
- Validar entradas con esquemas (formato, longitud, tipo y tamaño de archivos).
- Revisar y documentar políticas RLS de cada tabla.
- Añadir `.env.example` sin valores sensibles.
- Establecer pruebas mínimas para permisos y acciones sensibles.

**Criterio de salida:** ninguna acción sensible confía en datos enviados por el cliente para decidir identidad o permisos.

## Fase 3 — Hub de creadores y descubrimiento

**Objetivo:** que la web cumpla la promesa de descubrir y conectar creadores de contenido.

- **Postulación de creadores:** formulario + aprobación manual; el aprobado se convierte en `tier_level 1` (Creador aprobado).
- **Directorio de creadores:** reutilizar la sección de colaboradores; leer perfiles con `streamer_status = 'approved'`.
- **Hero editable:** slides gestionados desde `/admin` (tabla `hero_slides`), no hardcodeados.
- **Top creadores** por reputación (`likes_count`).
- **"Sorpréndeme"** con random ponderado (mayor peso a destacados) y **búsqueda por categoría/tags**.
- **Tiers como roles/estado** (sin pago ni vigencia): `0` Miembro · `1` Creador aprobado · `2` Creador destacado.

**Criterio de salida:** postular → aprobar → aparece en el directorio; el hero cambia desde admin; se puede ordenar, filtrar y saltar a un creador al azar.

## Fase 4 — Comunidad viva

**Objetivo:** retención y participación de creadores y visitantes.

- **Comentarios en perfiles:** el creador activa/desactiva y modera (aprobar/rechazar cada comentario).
- **Slides Tier 2 reorganizados:** 3 slots con propósito (Portada / Agenda / CTA) y enlace libre.
- **Notificaciones:** campanita con tipos `application_result`, `profile_comment_received`, `reputation_received`, `news_published`.
- **Supporters:** muro + badge, automatizado vía webhook (Ko-fi).

**Criterio de salida:** el creador modera sus comentarios y recibe notificaciones; un supporter aparece solo al donar.

## Fase 5 — Monetización

**Objetivo:** generar ingresos de forma sostenible.

- **Donaciones:** botón StreamElements en Navbar/Hero/Footer.
- **Sponsors:** tabla `sponsors` con placement (hero/news/footer) y vigencia.
- **Anuncios:** solo con tráfico medible (AdSense).

**Criterio de salida:** donaciones y sponsors visibles y gestionables desde `/admin`.

## Fase 6 — Escala sostenible

**Objetivo:** que el crecimiento no degrade costos, rendimiento ni seguridad.

- Paginación en listados y consultas.
- Límites de almacenamiento por usuario y de tamaño de archivo.
- Copias de seguridad de base de datos y Storage, con prueba de restauración.
- Monitoreo de errores y de consumo de recursos.
- Revisión periódica de dependencias.
