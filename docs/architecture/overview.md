# Arquitectura — visión general

## Principios

1. **Monolito modular.** Una sola aplicación Next.js, organizada por módulos de negocio. No se usan microservicios hasta que haya una necesidad medida.
2. **El servidor decide.** La identidad, los permisos y los beneficios se verifican en el servidor. La interfaz puede ocultar controles, pero nunca es la barrera de seguridad.
3. **Separación de permisos y beneficios.** Ser administrador es un *rol del sistema*. Ser Tier 1, 2 o 3 es un *beneficio del producto*. Son conceptos distintos y no se comparan en el mismo lugar.
4. **Cambios pequeños y reversibles.** Cada cambio se documenta, se verifica y se puede deshacer.

## Capas

```text
Navegador
   │
   ├── Páginas y componentes (src/app, src/components)
   │
   └── Server Actions / Route Handlers
          ├── Validación de entrada
          ├── Identidad desde la sesión
          ├── Autorización: propiedad, rol y beneficios
          ├── Servicios de acceso a datos (src/lib/services)
          └── Supabase: PostgreSQL y Storage
```

| Capa | Responsabilidad | Ubicación actual |
| --- | --- | --- |
| Presentación | Renderizar y capturar interacción | `src/app`, `src/components` |
| Acciones de servidor | Reglas de negocio y punto de entrada seguro | `src/actions`, `src/app/**/actions` |
| Servicios | Consultas y mutaciones a Supabase | `src/lib/services` |
| Infraestructura | Clientes de Supabase y de autenticación | `src/lib/supabase`, `src/lib/auth.ts` |
| Configuración | Constantes de producto y estilos | `src/config` |

Regla: las páginas no escriben en la base de datos directamente; llaman a acciones o servicios.

## Módulos

- **Identidad:** inicio de sesión con Discord y resolución del perfil interno.
- **Perfiles:** datos públicos, biografía, banner, enlaces sociales y reputación.
- **Personalización (Tier 2):** slides y estilos del perfil.
- **Descubrimiento:** directorio de creadores, top, "sorpréndeme" y búsqueda por categoría/tags.
- **Comentarios en perfiles:** comentarios en el perfil de un creador, con activación y moderación propias.
- **Noticias:** publicación administrada y lectura pública.
- **Comentarios:** creación, edición, eliminación propia, likes y moderación.
- **Notificaciones:** avisos in-app (postulación resuelta, comentario recibido, reputación, nueva noticia).
- **Monetización:** donaciones, sponsors y (a futuro) anuncios.
- **Administración:** gestión de hero, creadores, noticias, comentarios, sponsors y supporters.

Cada módulo debe poder leerse de forma aislada: sus tipos, acciones y componentes viven juntos o con referencias claras.

## Identidad y autenticación

### Decisión

La sesión de **NextAuth con Discord OAuth** es la fuente de autenticación de la aplicación. El identificador de Discord (`session.user.discordId`), obtenido del perfil OAuth y agregado al token en `src/lib/auth.ts`, es el identificador externo confiable para reconocer al usuario autenticado.

El servidor obtiene la identidad desde `getServerSession(authOptions)`. Las acciones protegidas no deben aceptar un email, Discord ID ni ID de perfil enviado por el cliente como prueba de identidad.

### Resolución del perfil

El perfil de la aplicación se resuelve buscando `profiles.discord_id` con el `discordId` de la sesión. El email se conserva como atributo del perfil y puede servir para búsquedas administrativas, pero no es la identidad principal.

`profiles.id` es la clave primaria interna que deben usar las relaciones con otras tablas. El código actual crea perfiles con `id = discord_id`; esa igualdad existe en los registros creados por el flujo actual, pero las nuevas operaciones no deben depender de ella. Cuando una acción necesite el ID interno, primero debe resolver el perfil mediante `discord_id` y después utilizar `profiles.id`.

### Flujo actual

1. El usuario inicia sesión mediante Discord y NextAuth.
2. El callback JWT guarda el ID de Discord en `token.discordId`; el callback de sesión lo expone como `session.user.discordId`.
3. `sincronizarPerfilDiscordAction` busca el perfil por `profiles.discord_id` y actualiza sus datos o crea uno si no existe.
4. Las acciones de servidor obtienen la sesión con `getServerSession(authOptions)` y deben resolver el perfil mediante `profiles.discord_id`.
5. Las tablas relacionadas usan `profiles.id` como clave foránea interna.

### Supabase y autorización

Supabase almacena los perfiles y los datos de la aplicación. La sesión de NextAuth no es, por sí misma, una sesión de Supabase Auth. La **verificación de redes sociales ya no usa Supabase Auth**: se hace con OAuth 2.0 directo contra cada plataforma (`src/lib/social-oauth`) y el resultado se guarda vía server action autenticada con `getServerSession(authOptions)`.

El cliente con `SUPABASE_SERVICE_ROLE_KEY` solo se usa en el servidor y puede omitir RLS. Por tanto, toda Server Action que lo utilice debe comprobar la sesión, la propiedad del recurso y los permisos aplicables antes de leer o modificar datos. Las políticas RLS siguen siendo necesarias para las operaciones que se hagan con la clave anon.

> **Cliente público (29 de octubre de 2026; actualizado 1 de noviembre de 2026):** `src/lib/supabase/public.ts` expone `createPublicClient()`, que usa `NEXT_PUBLIC_SUPABASE_ANON_KEY` y respeta RLS. Se emplea en `obtenerPerfilPublicoAction` para la lectura pública. Los GRANTs por columna que excluyen `email`, `is_admin`, `sub_expires_at`, `allow_gifs`, `custom_badge` y `custom_slides` del rol `anon` se aplicaron **manualmente en Supabase** y se verificaron (`select=*`/columnas sensibles → `401`). Queda pendiente **versionar** esos GRANTs como migración reproducible.

### Administración

El acceso administrativo se determina mediante `profiles.is_admin`, consultado para el perfil asociado a la sesión autenticada. Los permisos de administrador son independientes de `tier_level`.

`ADMIN_EMAIL` no está referenciada por el código actual y no forma parte del mecanismo de autorización. No debe configurarse ni documentarse como requisito mientras el sistema utilice `profiles.is_admin`.

> **Corregido (1 de noviembre de 2026):** las acciones y páginas de administración usan `getServerSession(authOptions)` y resuelven `profiles.is_admin` por `discord_id` mediante el helper `src/lib/admin.ts` (`requireAdmin`) y `getProfileByDiscordId`. `deleteNewsAction` ahora verifica `is_admin`.

## Inventario (cierre de Fase 1)

### Rutas

| Ruta | Tipo | Descripción |
| --- | --- | --- |
| `/` | Página | Reexporta la página de inicio. |
| `/inicio` | Página | Hero, colaboradores y noticias. |
| `/perfil` | Página cliente | Perfil propio y edición; requiere sesión. |
| `/u/[id]` | Página servidor | Perfil público por `discord_id` o nombre de usuario. |
| `/login` | Página | Inicio de sesión con Discord. |
| `/api/social/connect/[platform]` | Route Handler | Inicia el OAuth de verificación de redes sociales (X, Twitch, GitHub, YouTube). |
| `/api/social/callback/[platform]` | Route Handler | Callback OAuth de verificación de redes sociales. |
| `/admin` | Página servidor | Panel de administración; requiere `is_admin`. |
| `/admin/news` | Página | Gestión de noticias. |
| `/admin/comments` | Página | Moderación de comentarios. |
| `/admin/subs` | Página | Gestión de tiers. |
| `/api/auth/[...nextauth]` | Route Handler | Endpoints de NextAuth. |

### Server Actions principales

| Archivo | Acciones | Identidad usada | Estado de revisión |
| --- | --- | --- | --- |
| `src/actions/publicProfile.action.ts` | `obtenerPerfilPublicoAction` | Identificador público (lectura) | Remediado FASE2-02/FASE2-12. La lectura pública usa `createPublicClient()` (anon) y los GRANTs de columnas sensibles se aplicaron en Supabase; pendiente versionarlos como migración. |
| `src/actions/tier2.actions.ts` | `guardarSlideAction`, `eliminarSlideAction` | `getServerSession(authOptions)`; perfil resuelto por `discord_id` | Corregido en Paso 3: acciones limitadas al perfil de sesión y a Tier 2 vigente. |
| `src/app/perfil/actions.ts` | `guardarBiografiaAction`, `obtenerBiografiaAction`, `sincronizarPerfilDiscordAction`, `obtenerPerfilCompletoAction`, `guardarRedesAction`, `subirBannerAction`, `guardarCosmeticosVIPAction`, `toggleProfileReputationAction` | `getServerSession(authOptions)` | Remediado (FASE2-03/04/05/06/07/09/11), FASE2-08 (tier + `sub_expires_at` via `hasActiveTier`) y FASE2-10 (likes por `profiles.id`, toggle sin `.match()` + unicidad aplicada). La vinculación de redes se movió a `src/lib/social-oauth/linking.ts` (`vincularRedVerificada`). |
| `src/app/admin/subs/actions/subsAction.ts` | `getUsersListAction`, `updateUserTierAction` | `getServerSession(authOptions)` + `profiles.is_admin` por `discord_id` (`requireAdmin`) | Corregido el 1 de noviembre de 2026. |
| `src/app/admin/news/actions/newsAction.ts` | `getAdminNewsAction`, `saveNewsAction`, `deleteNewsAction` | `getServerSession(authOptions)` + `profiles.is_admin` por `discord_id` (`requireAdmin`) | Corregido el 1 de noviembre de 2026 (`deleteNewsAction` ahora verifica `is_admin`). |
| `src/app/admin/comments/actions/commentsActions.ts` | `getAdminCommentsAction`, `deleteCommentAction` | `getServerSession(authOptions)` + `profiles.is_admin` por `discord_id` (`requireAdmin`) | Corregido el 1 de noviembre de 2026. |
| `src/components/home/News/components/comments/actions/commentsAction.ts` | `obtenerComentariosAction`, `publicarComentarioAction`, `editarComentarioAction`, `eliminarComentarioAction` | `getServerSession(authOptions)` + perfil por `discord_id` | Corregido el 3 de noviembre de 2026 (Paso 2). |
| `src/components/home/News/components/comments/actions/likesAction.ts` | Likes de comentarios | `getServerSession(authOptions)` + `profiles.id` por `discord_id` | Corregido el 3 de noviembre de 2026 (Paso 2). |

### Tablas y recursos de Supabase

| Recurso | Uso |
| --- | --- |
| `profiles` | Perfiles: `id`, `discord_id`, `email`, `is_admin`, `tier_level`, `sub_expires_at` (en desuso), redes, banner y biografía. Nuevas columnas: `streamer_status`, `streamer_category`, `tags`, `profile_comments_enabled`, `profile_comments_moderated`. |
| `user_slides` | Slides VIP (Tier 2+), identificados por `user_id` y `slot_number`. Se reorganiza: `target_network` → `link_url` (enlace libre) y 3 slots con propósito (Portada / Agenda / CTA). |
| `profile_likes` | Reputación entre perfiles (`giver_id`, `receiver_id`). |
| `news` | Noticias publicadas. |
| `comments` | Comentarios de noticias (`news_id`). |
| `comment_likes` | Likes de comentarios (`comment_id`). |
| `hero_slides` | Slides del Hero editable desde `/admin` (título, subtítulo, imagen, CTA, orden, activo). |
| `profile_comments` | Comentarios en perfiles de creadores (`profile_id`, `author_id`, `content`, `status`). |
| `notifications` | Notificaciones in-app (`user_id`, `type`, `actor_id`, `payload`, `read`). |
| `supporters` | Muro de supporters (`profile_id`, `name`, `message`). |
| `sponsors` | Patrocinadores (`name`, `logo_url`, `link_url`, `placement`, `start_date`, `end_date`, `active`). |
| `user_networks` | Definida en los tipos generados; no se detectó uso en `src/`. |
| Función `reorder_slides_after_delete` | RPC que reordena slots tras eliminar uno. |
| Bucket `user_slides` | Imágenes de slides. |
| Bucket `user_banners` | Banners de perfil. |
| Bucket `news_images` | Imágenes de noticias. |
| Bucket `hero_images` | Imágenes del Hero editable (a crear). |

## Reglas de tiers (roles/estado)

Los tiers son **niveles de estado/rol**, guardados en `profiles.tier_level`. **No son de pago ni tienen vigencia** (`sub_expires_at` queda en desuso).

| Nivel | Rol | Beneficios | Cómo se obtiene |
| --- | --- | --- | --- |
| 0 | Miembro | Perfil público, comentar, likear. | Login con Discord. |
| 1 | Creador aprobado | Aparece en el directorio + redes destacadas. | Postulación aprobada por el admin. |
| 2 | Creador destacado | Lo anterior + slides/degradado de nombre/anillo + mayor peso en descubrimiento. | El admin lo destaca. |

Reglas:

1. Cada beneficio debe estar listado en esta tabla antes de implementarse.
2. Un nivel superior incluye los beneficios de los inferiores.
3. Un beneficio se valida en el servidor en cada operación que lo use (por ejemplo, guardar un slide exige nivel 2 o superior).
4. No hay vigencia ni degradación por tiempo; el estado solo cambia por acción del admin (aprobar/destacar) o del propio flujo de postulación.
5. Los administradores gestionan los niveles desde el panel; cualquier cambio debe quedar auditable.
6. Los permisos de administrador no se derivan del nivel de estado.

## Datos y almacenamiento

- PostgreSQL en Supabase para perfiles, noticias, comentarios, likes y slides.
- Supabase Storage para imágenes de usuario (banners, slides). Los archivos deben validarse en tipo y tamaño antes de subirse.
- El esquema de tipos se genera con `npm run sub-types`; no editar `database.types.ts` a mano.

## Decisiones pendientes

- Políticas RLS documentadas por tabla.
- Estrategia de pruebas automatizadas.
- Proveedor de automatización de supporters (Ko-fi recomendado vs StreamElements vs Stripe).
- Categorías/tags definitivos para la postulación.
