# Estado del proyecto

**Actualizado:** 11 de noviembre de 2026

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
- **FASE2-10 (código):** `toggleProfileReputationAction` resuelve `giver_id`/`receiver_id` contra `profiles.id` (sin asumir `id === discord_id`) y usa toggle delete-then-insert sin `.match()`. La migración de unicidad (`supabase/migrations/20261101000000_profile_likes_reputation_unique.sql`) se aplicó manualmente en el SQL Editor de Supabase.
- **Paso 5 (autorización `/admin`):** creado `src/lib/admin.ts` (`requireAdmin`) que resuelve `profiles.is_admin` por `discord_id`; migrados `subsAction.ts`, `newsAction.ts` y `commentsActions.ts`, incluyendo la corrección crítica de `deleteNewsAction` (ahora verifica `is_admin`). Las 4 páginas de `/admin` usan `getServerSession(authOptions)` + `getProfileByDiscordId`. `npm run build` correcto.

## Sesión del 3 de noviembre de 2026 — Fase 2 (seguridad + rediseño GeForce)

**Pasos completados (verificados con `npm run lint` y `npm run build` en verde):**

- **Paso 1 — Migración SQL versionada:** creada `supabase/migrations/20261103000000_profiles_anon_column_grants_and_rls.sql` con GRANTs por columna del rol `anon` (excluye `email`, `is_admin`, `sub_expires_at`, `allow_gifs`, `custom_badge`, `custom_slides`) y políticas RLS (`SELECT` anon para `profiles`/`user_slides`, `news` con `published = true`). Cierra el pendiente de versionar FASE2-01.
- **Paso 2 — Identidad de comentarios por `discord_id`:** `commentsAction.ts` y `likesAction.ts` migrados a `getServerSession(authOptions)` + `getProfileByDiscordId`. Cierra el ítem del checklist de Fase 2.
- **Paso 3A — Infra cliente/imágenes:** cliente Supabase singleton (`src/lib/supabase/client.ts`), helper `esImagenAnimada` (`src/lib/image.ts`) y `unoptimized` en GIFs.
- **Paso 3B — Reputación y redes sociales:** reputación robusta con `obtenerEstadoReputacionAction` + feedback inline; redes sociales con normalización de URLs y `rel="noopener noreferrer"` (`src/lib/social.ts`).
- **Paso 3C — Skeletons y estados vacíos:** skeletons en News y comentarios; estados vacíos con copy limpio.
- **Paso 3D — Rediseño GeForce:** unificación del acento a verde neón `#61ff61` (tokens `neon`, `neon-bright`, `neon-deep`), Navbar responsive, Footer global, pass responsive y de accesibilidad (foco visible, `prefers-reduced-motion`, contraste AA, `aria-label`/`disabled` reales). Limpieza de copy técnico visible.

**Pendiente planificado (3D-5 — Optimización):** sustituir `useCurrentProfile.ts` por una server action, lazy loading de imágenes, reducción de CLS y carga diferida del editor de slides. Detalle en `.opencode/plan/PLAN_TODAY.md`.

## Rework de verificación de redes — OAuth directo (4 de noviembre de 2026)

**Problema:** la verificación de redes (X, Twitch, GitHub, YouTube) dependía de **Supabase Auth** (un segundo sistema de identidad aparte de NextAuth/Discord). En producción redirigía siempre a `localhost:3000` por el "Site URL" de Supabase, y X fallaba con `Unsupported provider: provider is not enabled`.

**Solución aplicada:** OAuth 2.0 **directo** contra cada plataforma (Supabase Auth eliminado del flujo). El redirect lo controla 100% la app.

- `src/lib/social-oauth/config.ts` — endpoints, scopes y extractor de handle por red (twitch/github/x/youtube).
- `src/lib/social-oauth/pkce.ts` — `code_verifier`/`code_challenge` (S256) + `state`.
- `src/lib/social-oauth/linking.ts` — `vincularRedVerificada` (sesión Discord + allowlist + Tier 1 + escritura a `social_links`).
- `src/app/api/auth/connect/[platform]/route.ts` y `src/app/api/auth/callback/[platform]/route.ts`.
- `Tier1NetworkHub.tsx`: "Conectar" ahora es un enlace a `/api/auth/connect/<red>`; se eliminó el cliente Supabase y `signInWithOAuth`.
- Eliminados `auth/callback/page.tsx` y `actions/youtube.action.ts`; `vincularRedSocialAction` extraído a la lib.
- **Seguridad:** `state` anti-CSRF (cookie httpOnly), PKCE, identidad solo desde `getServerSession(authOptions)`, allowlist de plataformas + Tier 1 vigente; tokens intercambiados server-side.

**Fixes adicionales de la sesión:**

- **PKCE:** se enviaba `code_challenge` en la autorización pero no `code_verifier` en el intercambio para Twitch/GitHub/YouTube → `400 code_verifier is required`. Corregido: PKCE uniforme para las 4 redes (commit `422b739`).
- **Color neón en dev:** el `@import url()` de Google Fonts rompía el `@theme` de Tailwind v4 en dev (navbar blanco). Sustituido por `next/font/google` (Bebas Neue + Oswald).
- **Footer:** enlaces reales del creador (`maxhuang117` en X/YouTube/Twitch/GitHub + Discord invite `CgPM7cWp7t` y perfil `603643066242301963`).

`npm run lint` y `npm run build` en verde.

### Pendiente (configuración externa — siguiente sesión)

- Crear apps OAuth en X Developer, Twitch dev, GitHub y Google Cloud; pegar credenciales en `.env` (`TWITCH_CLIENT_ID`/`SECRET`, `GITHUB_...`, `X_...`, `GOOGLE_...`).
- Registrar en cada portal el callback URL `https://TU-DOMINIO/api/auth/callback/<red>` (+ `http://localhost:3000/...` para dev).
- Google/YouTube: habilitar YouTube Data API v3 + scope `youtube.readonly`; publicar la app (o asumir pantalla "no verificada") para que cualquier usuario pueda vincular.
- Configurar `NEXTAUTH_URL` y `NEXT_PUBLIC_SITE_URL` con el dominio de producción.
- Probar las 4 redes en dev y producción.

## Verificación

- `npm run lint`: correcto (4 de noviembre de 2026; toda la sesión).
- `npm run build`: correcto (4 de noviembre de 2026; toda la sesión).

## En curso — Remediación Fase 2 (Seguridad y estabilidad)

Progreso parcial: los ítems marcados con `[x]` están implementados y verificados; el resto sigue pendiente.

- [x] Crear `.env.example` con las variables del proyecto, sin valores sensibles.
- [x] Refactorizar `obtenerPerfilPublicoAction` (`src/actions/publicProfile.action.ts`): eliminar la interpolación en `.or(...)` (FASE2-02) y aplicar validación estricta del identificador (snowflake numérico o username con alfabeto restringido, con longitud máxima).
- [x] Restringir el uso de `service_role` e implementar cliente público/anon para lecturas no privilegiadas (FASE2-01). `obtenerPerfilPublicoAction` usa `createPublicClient()` (anon); GRANTs por columna aplicados manualmente en Supabase y verificados el 1 de noviembre (`select=*`/columnas sensibles → `401`; campos públicos → `200`).
- [x] Unificar la resolución de perfiles por `profiles.discord_id` en `guardarBiografiaAction` en lugar de `.eq("id", discordId)`, verificando las filas afectadas (FASE2-03).
- [x] Implementar validación server-side de entradas en `src/app/perfil/actions.ts`: longitud de biografía (FASE2-04), esquema https y allowlist de dominio para `avatarUrl` (FASE2-05), MIME types, tamaño máximo y nombres aleatorios en `subirBannerAction` (FASE2-06), allowlist de `styleId` (FASE2-07) y allowlist de plataformas y valores en redes sociales (FASE2-09).
- [x] Ocultar mensajes de error crudos de Supabase en las respuestas devueltas al cliente (FASE2-11).
- [x] Revisión de políticas RLS y pruebas de permisos; versionar como migración los GRANTs de FASE2-01 aplicados manualmente en Supabase.
- [x] Verificar la vigencia `sub_expires_at` en todas las acciones de tier (FASE2-08). Centralizado en `src/lib/tier.ts` (`hasActiveTier`) y aplicado en `vincularRedSocialAction`, `guardarRedesAction`, `subirBannerAction`, `guardarCosmeticosVIPAction`, `obtenerPerfilCompletoAction` y `tier2.actions.ts`. Limitación: `obtenerPerfilPublicoAction` (cliente anon) no puede leer `sub_expires_at` tras los GRANTs, por lo que el downgrade público sigue basado en `tier_level`.
- [x] Hacer atómica la operación de likes (FASE2-10) y resolver la semántica de `giver_id`/`receiver_id` (id vs `discord_id`). La acción resuelve ambos contra `profiles.id`, usa toggle delete-then-insert sin `.match()`, y la restricción única se aplicó en Supabase (migración versionada en `supabase/migrations/`).
- [x] Migrar la autorización de `/admin` a `getServerSession(authOptions)` + `profiles.is_admin` resuelto por `discord_id`; corregido `deleteNewsAction` (ahora verifica `is_admin`). Centralizado en `src/lib/admin.ts` (`requireAdmin`) y aplicado en acciones y páginas de `/admin`.
- [x] Migrar la resolución de identidad de los comentarios (`src/components/home/News/components/comments/actions/commentsAction.ts`) de `getServerSession()` + `session.user.email` a `getServerSession(authOptions)` + `discord_id` (mismo patrón ya corregido en `/admin`).

## Notas del Desarrollador / Deuda Técnica Detectada

Pendientes de UI y DX identificados durante el desarrollo; no bloquean la seguridad, pero afectan estabilidad y experiencia.

- [x] **[Advertencia Browser]** Evitar múltiples instancias de `GoTrueClient` unificando el cliente client-side (`src/lib/supabase/client.ts`) bajo un patrón singleton. *(resuelto en 3A)*
- [x] **[UI/Next.js]** Agregar la propiedad `unoptimized` a los componentes `<Image>` que consuman GIF animados desde Supabase Storage (`user_slides`). *(resuelto en 3A)*
- [x] **[Bug UI]** Corregir la interacción para dar reputación/like en el modal de perfil público (los eventos hover/click no responden). *(resuelto en 3B)*
- [x] **[UX/Performance]** Implementar Skeleton loaders en la sección de comentarios de noticias. *(resuelto en 3C)*
- [x] **[UX/Performance]** Agregar pantalla/diseño de carga inicial (`loading.tsx` / Skeleton) en la página principal mientras finaliza la hidratación de datos. *(resuelto en 3C)*
- [x] **[Bug UI]** Corregir las extensiones de X, YouTube, Twitch y GitHub en el perfil para que funcionen en producción y no redirijan a `localhost:3000`. *(resuelto en 3B, normalización de URLs)*

## Sesión del 11 de noviembre de 2026 — Login Discord + comentarios + warns

- **Login con Discord corregido (2 commits):**
  - `454a699` — movidas las rutas OAuth de redes de `/api/auth/*` a `/api/social/*`: la ruta dinámica `/api/auth/callback/[platform]` resolvía antes que la catch-all `/api/auth/[...nextauth]` e interceptaba el callback de Discord (`/api/auth/callback/discord` → `/perfil?social=error`).
  - `8d96ea9` — restaurado `issuer: "https://discord.com"` en `src/lib/auth.ts`. Discord devuelve `iss` en el callback (RFC 9207) y `openid-client` lo valida contra `provider.issuer`; sin él fallaba con `issuer must be configured on the issuer` (`/login?error=OAuthCallback`).
- **Botones editar/borrar comentarios:** `useCurrentProfile` consultaba `profiles` con el rol `anon` filtrando por `email` y seleccionando `custom_badge`/`allow_gifs`, columnas revocadas en FASE2-01. Corregido resolviendo por `discord_id` (sesión) y pidiendo solo columnas públicas.
- **Rediseño del modal de noticias:** responsivo (full-screen en móvil, tarjeta centrada en desktop), descripción truncada con "ver más" y comentarios desplegables.

### Warns de build (Vercel) — no bloquean; revisar al migrar dependencias

- `npm warn Unknown env config "cache-dir"` → dejará de funcionar en el próximo major de npm. Quitar `cache-dir` del `.npmrc`/config global.
- `npm warn deprecated uuid@8.3.2` → `uuid` ≤10 sin soporte (ESM → `uuid@latest`; CJS → `uuid@11`, deprecado previsiblemente en 2028). Es dependencia transitiva de `next-auth@4`; se resuelve al migrar a Auth.js v5.
- `npm warn deprecated eslint@9.39.5` → versión sin soporte. Actualizar `eslint` a una versión mantenida.
