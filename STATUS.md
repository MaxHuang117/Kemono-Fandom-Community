# Estado del proyecto

**Actualizado:** 1 de noviembre de 2026

## Completado (27 de octubre de 2026)

- Cerrada formalmente la **Fase 1 — Fundación** en `docs/product/roadmap.md`.
- Documentados la arquitectura, la fuente de identidad, el inventario de rutas/acciones/datos y el flujo de desarrollo en `docs/`.
- Verificada la seguridad de las acciones de slides Tier 2: identidad obtenida con `getServerSession(authOptions)`, perfil resuelto por `discord_id`, validación de Tier 2 y vigencia, y acceso limitado al `profile.id` autenticado.
- Añadido un límite de `Suspense` en `/auth/callback` para el uso de `useSearchParams` durante el build de producción.
- Completada la auditoría estática de seguridad de la Fase 2 sobre el módulo de perfiles (`src/app/perfil/actions.ts` y `src/actions/publicProfile.action.ts`): 12 hallazgos (FASE2-01 a FASE2-12), 2 de riesgo alto, 5 de riesgo medio y 5 de riesgo bajo. Informe interno en `.opencode/plan/SECURITY_AUDIT.md`.

## Revisión documental y de código (29 de octubre de 2026)

- Confirmado que la remediación de Fase 2 para `src/app/perfil/actions.ts` y `src/actions/publicProfile.action.ts` está implementada y commiteada en `cd2a680`.
- Verificado en el código que FASE2-02, FASE2-03, FASE2-04, FASE2-05, FASE2-06, FASE2-07, FASE2-09 y FASE2-11 están corregidos, y que `.env.example` existe y está versionado.
- Confirmados como pendientes: FASE2-01 (lectura pública con `service_role`), FASE2-08 (`sub_expires_at` no se valida en `src/app/perfil/actions.ts`), FASE2-10 (likes no atómicos) y la revisión de políticas RLS (no hay migraciones ni políticas versionadas en el repositorio).
- Hallazgo nuevo: las acciones de administración (`src/app/admin/*/actions`) resuelven el perfil por `session.user.email` con `getServerSession()` sin `authOptions`, lo que no coincide con el modelo de identidad por `discord_id`. Pendiente de remediación.

## Implementación FASE2-01 (29 de octubre de 2026)

- Creado `src/lib/supabase/public.ts` con `createPublicClient()` (clave `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `server-only`, `persistSession: false`, `autoRefreshToken: false`).
- `obtenerPerfilPublicoAction` (`src/actions/publicProfile.action.ts`) migrada para realizar las lecturas públicas de `profiles` y `user_slides` con el cliente `anon` (`createPublicClient`) en lugar de `service_role`. Las validaciones de identificador y el manejo de errores se mantienen intactos.
- `npm run build` ejecutado con resultado correcto (compilación, TypeScript y generación de páginas).
- **Estado FASE2-01: Parcial / En Progreso.** El código TypeScript ya usa `anon` para la lectura pública, pero falta la restricción de columnas a nivel PostgreSQL/Supabase (GRANTs SQL) para que `anon` no pueda leer `email`, `is_admin`, `sub_expires_at`, `allow_gifs`, `custom_badge` ni `custom_slides`.

## Unificación de bitácoras y auditoría (1 de noviembre de 2026)

- Unificadas las dos bitácoras: `STATUS.md` (raíz) queda como fuente única de avances y `docs/STATUS.md` pasa a ser un puntero. Se deshizo un cambio staged que revertía `docs/STATUS.md` a la versión del 27 de octubre, eliminando la reconciliación anterior.
- **Hallazgo nuevo (crítico):** `deleteNewsAction` (`src/app/admin/news/actions/newsAction.ts`) no verifica `is_admin`; solo comprueba `session.user.email` y luego borra `comments` y `news` con `service_role`. Cualquier usuario autenticado con email puede borrar noticias y comentarios.
- **Hallazgo nuevo:** en `toggleProfileReputationAction` (`src/app/perfil/actions.ts`), `giver_id` y `receiver_id` se escriben con `session.user.discordId`, pero `database.types.ts` declara las FKs hacia `profiles.id`. Funciona hoy por la convención `id = discord_id`, pero replica la fragilidad de FASE2-03 y queda pendiente resolver la semántica real.
- **Verificación FASE2-01 (Paso 2, 1 de noviembre de 2026):** prueba REST con la clave `anon` confirmó que la lectura pública de perfiles y slides funciona (campos públicos → `200`). Antes de la corrección se detectó que `anon` podía leer las columnas sensibles `email`, `is_admin`, `sub_expires_at`, `allow_gifs`, `custom_badge` y `custom_slides` por falta de GRANTs específicos. Los GRANTs por columna se aplicaron **manualmente en Supabase** y se re-verificaron: `select=*` y las columnas sensibles ahora devuelven `401`, mientras los campos públicos siguen en `200`. Queda pendiente **versionar** esos GRANTs como migración reproducible en el repositorio.
- Se incorpora a la bitácora la nota sobre las extensiones de redes sociales (X, YouTube, Twitch y GitHub) que apuntan a `localhost:3000` en producción.
- **FASE2-08 implementado:** la verificación de `tier_level` + `sub_expires_at` se centralizó en `src/lib/tier.ts` (`hasActiveTier`) y se aplicó a las acciones de tier de perfil y a `tier2.actions.ts`; `npm run build` correcto.
- **FASE2-10 (código):** `toggleProfileReputationAction` resuelve `giver_id`/`receiver_id` contra `profiles.id` (sin asumir `id === discord_id`) y usa toggle delete-then-insert sin `.match()`. La migración de unicidad quedó versionada en `supabase/migrations/` y pendiente de aplicar en Supabase (requiere autorización).

## Verificación

Última verificación de build y lint registrada el 29 de octubre de 2026; en esta sesión solo se modificó documentación.

- `npm run build`: correcto (29 de octubre de 2026).
- `npm run lint`: correcto (27 de octubre de 2026).

## En curso — Remediación Fase 2 (Seguridad y estabilidad)

Progreso parcial: los ítems marcados con `[x]` están implementados y verificados; el resto sigue pendiente.

- [x] Crear `.env.example` con las variables del proyecto, sin valores sensibles.
- [x] Refactorizar `obtenerPerfilPublicoAction` (`src/actions/publicProfile.action.ts`): eliminar la interpolación en `.or(...)` (FASE2-02) y aplicar validación estricta del identificador (snowflake numérico o username con alfabeto restringido, con longitud máxima).
- [x] Restringir el uso de `service_role` e implementar cliente público/anon para lecturas no privilegiadas (FASE2-01). `obtenerPerfilPublicoAction` usa `createPublicClient()` (anon); GRANTs por columna aplicados manualmente en Supabase y verificados el 1 de noviembre (`select=*`/columnas sensibles → `401`; campos públicos → `200`).
- [x] Unificar la resolución de perfiles por `profiles.discord_id` en `guardarBiografiaAction` en lugar de `.eq("id", discordId)`, verificando las filas afectadas (FASE2-03).
- [x] Implementar validación server-side de entradas en `src/app/perfil/actions.ts`: longitud de biografía (FASE2-04), esquema https y allowlist de dominio para `avatarUrl` (FASE2-05), MIME types, tamaño máximo y nombres aleatorios en `subirBannerAction` (FASE2-06), allowlist de `styleId` (FASE2-07) y allowlist de plataformas y valores en redes sociales (FASE2-09).
- [x] Ocultar mensajes de error crudos de Supabase en las respuestas devueltas al cliente (FASE2-11).
- [ ] Revisión de políticas RLS y pruebas de permisos; versionar como migración los GRANTs de FASE2-01 aplicados manualmente en Supabase.
- [x] Verificar la vigencia `sub_expires_at` en todas las acciones de tier (FASE2-08). Centralizado en `src/lib/tier.ts` (`hasActiveTier`) y aplicado en `vincularRedSocialAction`, `guardarRedesAction`, `subirBannerAction`, `guardarCosmeticosVIPAction`, `obtenerPerfilCompletoAction` y `tier2.actions.ts`. Limitación: `obtenerPerfilPublicoAction` (cliente anon) no puede leer `sub_expires_at` tras los GRANTs, por lo que el downgrade público sigue basado en `tier_level`.
- [ ] Hacer atómica la operación de likes (FASE2-10) y resolver la semántica de `giver_id`/`receiver_id` (id vs `discord_id`). **Código listo:** `toggleProfileReputationAction` resuelve ambos contra `profiles.id` y usa toggle delete-then-insert sin `.match()`. **Pendiente:** aplicar la migración `supabase/migrations/20261101000000_profile_likes_reputation_unique.sql` (restricción única) — requiere autorización explícita.
- [ ] Migrar la autorización de `/admin` a `getServerSession(authOptions)` + `profiles.is_admin` resuelto por `discord_id`; corregir `deleteNewsAction` para que verifique `is_admin`.

## Notas del Desarrollador / Deuda Técnica Detectada

Pendientes de UI y DX identificados durante el desarrollo; no bloquean la seguridad, pero afectan estabilidad y experiencia.

- **[Advertencia Browser]** Evitar múltiples instancias de `GoTrueClient` unificando el cliente client-side (`src/lib/supabase/client.ts`) bajo un patrón singleton.
- **[UI/Next.js]** Agregar la propiedad `unoptimized` a los componentes `<Image>` que consuman GIF animados desde Supabase Storage (`user_slides`).
- **[Bug UI]** Corregir la interacción para dar reputación/like en el modal de perfil público (los eventos hover/click no responden).
- **[UX/Performance]** Implementar Skeleton loaders en la sección de comentarios de noticias.
- **[UX/Performance]** Agregar pantalla/diseño de carga inicial (`loading.tsx` / Skeleton) en la página principal mientras finaliza la hidratación de datos.
- **[Bug UI]** Corregir las extensiones de X, YouTube, Twitch y GitHub en el perfil para que funcionen en producción y no redirijan a `localhost:3000`.
