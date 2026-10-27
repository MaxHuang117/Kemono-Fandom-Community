# Estado del proyecto

**Actualizado:** 27 de octubre de 2026

## Completado hoy

- Cerrada formalmente la **Fase 1 — Fundación** en `docs/product/roadmap.md`.
- Documentados la arquitectura, la fuente de identidad, el inventario de rutas/acciones/datos y el flujo de desarrollo en `docs/`.
- Verificada la seguridad de las acciones de slides Tier 2: identidad obtenida con `getServerSession(authOptions)`, perfil resuelto por `discord_id`, validación de Tier 2 y vigencia, y acceso limitado al `profile.id` autenticado.
- Añadido un límite de `Suspense` en `/auth/callback` para el uso de `useSearchParams` durante el build de producción.
- Completada la auditoría estática de seguridad de la Fase 2 sobre el módulo de perfiles (`src/app/perfil/actions.ts` y `src/actions/publicProfile.action.ts`): 12 hallazgos (FASE2-01 a FASE2-12), 2 de riesgo alto, 5 de riesgo medio y 5 de riesgo bajo. Informe interno en `.opencode/plan/SECURITY_AUDIT.md`.

## Verificación

- `npm run lint`: correcto.
- `npm run build`: correcto; compilación, TypeScript y generación de páginas completados.

## En curso — Remediación Fase 2 (Seguridad y estabilidad)

Progreso parcial: los ítems marcados con `[x]` están implementados y verificados; el resto sigue pendiente.

- [x] Crear `.env.example` con las variables del proyecto, sin valores sensibles.
- [x] Refactorizar `obtenerPerfilPublicoAction` (`src/actions/publicProfile.action.ts`): eliminar la interpolación en `.or(...)` (FASE2-02) y aplicar validación estricta del identificador (snowflake numérico o username con alfabeto restringido, con longitud máxima).
- [ ] Restringir el uso de `service_role` e implementar cliente público/anon para lecturas no privilegiadas (FASE2-01).
- [x] Unificar la resolución de perfiles por `profiles.discord_id` en `guardarBiografiaAction` en lugar de `.eq("id", discordId)`, verificando las filas afectadas (FASE2-03).
- [x] Implementar validación server-side de entradas en `src/app/perfil/actions.ts`: longitud de biografía (FASE2-04), esquema https y allowlist de dominio para `avatarUrl` (FASE2-05), MIME types, tamaño máximo y nombres aleatorios en `subirBannerAction` (FASE2-06), allowlist de `styleId` (FASE2-07) y allowlist de plataformas y valores en redes sociales (FASE2-09).
- [x] Ocultar mensajes de error crudos de Supabase en las respuestas devueltas al cliente (FASE2-11).
- [ ] Revisión de políticas RLS y pruebas de permisos.
- [ ] Verificar la vigencia `sub_expires_at` en todas las acciones de tier (FASE2-08).
- [ ] Hacer atómica la operación de likes (FASE2-10).

Nota del dev: detalle al abrir el editor de una tarjeta vip: ⚠ The requested resource "https://hrvhilxijhrblcgkrlrd.supabase.co/storage/v1/object/public/user_slides/603643066242301963/slide_1.gif?t=1792134109326" is an animated image so it will not be optimized. Consider adding the "unoptimized" property to the <Image>.