# Roadmap del producto

Este documento define las fases de desarrollo de Kemono Fandom Community. Cada fase tiene un objetivo claro; no se avanza a la siguiente hasta cumplir sus criterios de salida.

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

## Fase 3 — Experiencia para creadores (Tier 1 y 2)

**Objetivo:** que los beneficios de Tier 1 y 2 sean claros, útiles y medibles.

- Definir beneficios concretos por tier (ver `docs/architecture/overview.md`, sección de tiers).
- Mejorar onboarding, perfiles y descubrimiento de creadores.
- Mejorar moderación de comentarios y noticias.

**Criterio de salida:** los beneficios de cada tier están documentados, probados y visibles para el usuario.

## Fase 4 — Validación de Tier 3 (patrocinadores)

**Objetivo:** decidir si Tier 3 se construye, y cómo, antes de escribir código.

- Investigar necesidades reales de patrocinadores y empresas.
- Definir: formatos de visibilidad, vigencia, privacidad, métricas y operación manual o automatizada.
- Definir si hay pagos y, en tal caso, el proveedor y los procesos de facturación.

**Criterio de salida:** documento de propuesta aprobado. Sin esto, no se implementa Tier 3.

## Fase 5 — Escala sostenible

**Objetivo:** que el crecimiento no degrade costos, rendimiento ni seguridad.

- Paginación en listados y consultas.
- Límites de almacenamiento por usuario y de tamaño de archivo.
- Copias de seguridad de base de datos y Storage, con prueba de restauración.
- Monitoreo de errores y de consumo de recursos.
- Revisión periódica de dependencias.
