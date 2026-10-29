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
- **Noticias:** publicación administrada y lectura pública.
- **Comentarios:** creación, edición, eliminación propia, likes y moderación.
- **Administración:** gestión de noticias, comentarios y tiers.

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

Supabase almacena los perfiles y los datos de la aplicación. La sesión de NextAuth no es, por sí misma, una sesión de Supabase Auth: los clientes de `@supabase/ssr` y la sesión Supabase temporal del callback de redes sociales son flujos separados.

El cliente con `SUPABASE_SERVICE_ROLE_KEY` solo se usa en el servidor y puede omitir RLS. Por tanto, toda Server Action que lo utilice debe comprobar la sesión, la propiedad del recurso y los permisos aplicables antes de leer o modificar datos. Las políticas RLS siguen siendo necesarias para las operaciones que se hagan con la clave anon.

> **Cliente público (29 de octubre de 2026):** `src/lib/supabase/public.ts` expone `createPublicClient()`, que usa `NEXT_PUBLIC_SUPABASE_ANON_KEY` y respeta RLS. Se emplea en `obtenerPerfilPublicoAction` para la lectura pública. FASE2-01 queda **parcial**: falta restringir por columna los privilegios del rol `anon` (GRANTs SQL) para excluir `email`, `is_admin`, `sub_expires_at`, `allow_gifs`, `custom_badge` y `custom_slides`.

### Administración

El acceso administrativo se determina mediante `profiles.is_admin`, consultado para el perfil asociado a la sesión autenticada. Los permisos de administrador son independientes de `tier_level`.

`ADMIN_EMAIL` no está referenciada por el código actual y no forma parte del mecanismo de autorización. No debe configurarse ni documentarse como requisito mientras el sistema utilice `profiles.is_admin`.

> **Nota de revisión (29 de octubre de 2026):** las acciones de administración actuales (`src/app/admin/subs/actions/subsAction.ts`, `src/app/admin/news/actions/newsAction.ts` y `src/app/admin/comments/actions/commentsActions.ts`) resuelven el perfil por `session.user.email` y usan `getServerSession()` sin `authOptions`. Eso no coincide con el modelo de identidad por `discord_id` descrito arriba y queda pendiente de remediación en Fase 2.

## Inventario (cierre de Fase 1)

### Rutas

| Ruta | Tipo | Descripción |
| --- | --- | --- |
| `/` | Página | Reexporta la página de inicio. |
| `/inicio` | Página | Hero, colaboradores y noticias. |
| `/perfil` | Página cliente | Perfil propio y edición; requiere sesión. |
| `/u/[id]` | Página servidor | Perfil público por `discord_id` o nombre de usuario. |
| `/login` | Página | Inicio de sesión con Discord. |
| `/auth/callback` | Página cliente | Vinculación de redes sociales mediante sesión temporal de Supabase. |
| `/admin` | Página servidor | Panel de administración; requiere `is_admin`. |
| `/admin/news` | Página | Gestión de noticias. |
| `/admin/comments` | Página | Moderación de comentarios. |
| `/admin/subs` | Página | Gestión de tiers. |
| `/api/auth/[...nextauth]` | Route Handler | Endpoints de NextAuth. |

### Server Actions principales

| Archivo | Acciones | Identidad usada | Estado de revisión |
| --- | --- | --- | --- |
| `src/actions/publicProfile.action.ts` | `obtenerPerfilPublicoAction` | Identificador público (lectura) | Remediado FASE2-02/FASE2-12. FASE2-01 **parcial**: la lectura pública de `profiles` y `user_slides` usa `createPublicClient()` (anon); pendiente restringir columnas sensibles con GRANTs SQL en Supabase. |
| `src/actions/tier2.actions.ts` | `guardarSlideAction`, `eliminarSlideAction` | `getServerSession(authOptions)`; perfil resuelto por `discord_id` | Corregido en Paso 3: acciones limitadas al perfil de sesión y a Tier 2 vigente. |
| `src/app/perfil/actions.ts` | `guardarBiografiaAction`, `obtenerBiografiaAction`, `sincronizarPerfilDiscordAction`, `obtenerPerfilCompletoAction`, `vincularRedSocialAction`, `guardarRedesAction`, `subirBannerAction`, `guardarCosmeticosVIPAction`, `toggleProfileReputationAction` | `getServerSession(authOptions)` | Remediado parcialmente (FASE2-03/04/05/06/07/09/11): resolución por `discord_id` y validación server-side de entradas. Pendiente FASE2-08 (vigencia `sub_expires_at` en acciones de tier) y FASE2-10 (likes atómicos). |
| `src/app/admin/subs/actions/subsAction.ts` | `getUsersListAction`, `updateUserTierAction` | `getServerSession()` sin `authOptions` | Pendiente en Fase 2: verificar que la sesión se resuelva correctamente. |
| `src/app/admin/news/actions/newsAction.ts` | `getAdminNewsAction`, `saveNewsAction`, `deleteNewsAction` | Verificación de `is_admin` | Pendiente en Fase 2. |
| `src/app/admin/comments/actions/commentsActions.ts` | `getAdminCommentsAction`, `deleteCommentAction` | Verificación de `is_admin` | Pendiente en Fase 2. |
| `src/components/home/News/components/comments/actions/commentsAction.ts` | `obtenerComentariosAction`, `publicarComentarioAction`, `editarComentarioAction`, `eliminarComentarioAction` | Sesión (no revisada en detalle) | Pendiente en Fase 2. |
| `src/components/home/News/components/comments/actions/likesAction.ts` | Likes de comentarios | `session.user.discordId` | Pendiente en Fase 2. |

### Tablas y recursos de Supabase

| Recurso | Uso |
| --- | --- |
| `profiles` | Perfiles: `id`, `discord_id`, `email`, `is_admin`, `tier_level`, `sub_expires_at`, redes, banner y biografía. |
| `user_slides` | Slides VIP (Tier 2+), identificados por `user_id` y `slot_number`. |
| `profile_likes` | Reputación entre perfiles (`giver_id`, `receiver_id`). |
| `news` | Noticias publicadas. |
| `comments` | Comentarios de noticias (`news_id`). |
| `comment_likes` | Likes de comentarios (`comment_id`). |
| `user_networks` | Definida en los tipos generados; no se detectó uso en `src/`. |
| Función `reorder_slides_after_delete` | RPC que reordena slots tras eliminar uno. |
| Bucket `user_slides` | Imágenes de slides. |
| Bucket `user_banners` | Banners de perfil. |
| Bucket `news_images` | Imágenes de noticias. |

## Reglas de tiers

Los tiers son niveles de beneficios de producto, guardados en `profiles.tier_level`.

| Tier | Estado | Beneficios actuales o previstos |
| --- | --- | --- |
| 0 | Implementado | Perfil público básico, comentarios y likes. |
| 1 | Implementado parcialmente | Enlaces a redes destacados y visibilidad en el perfil. |
| 2 | Implementado parcialmente | Personalización: estilo de nombre, anillo de avatar y slides propios. |
| 3 | Propuesta | Visibilidad para patrocinadores y empresas. **No implementado.** |

Reglas:

1. Cada beneficio debe estar listado en esta tabla antes de implementarse.
2. Un tier superior incluye los beneficios de los inferiores.
3. Un beneficio se valida en el servidor en cada operación que lo use (por ejemplo, guardar un slide exige Tier 2 o superior).
4. La vigencia (`sub_expires_at`) debe considerarse al evaluar un beneficio. *Pendiente:* definir qué ocurre al vencer (degradación inmediata o periodo de gracia) y aplicarlo de forma consistente.
5. Los administradores gestionan tiers desde el panel; cualquier cambio de tier debe quedar auditable.
6. Los permisos de administrador no se derivan del tier.

## Datos y almacenamiento

- PostgreSQL en Supabase para perfiles, noticias, comentarios, likes y slides.
- Supabase Storage para imágenes de usuario (banners, slides). Los archivos deben validarse en tipo y tamaño antes de subirse.
- El esquema de tipos se genera con `npm run sub-types`; no editar `database.types.ts` a mano.

## Decisiones pendientes

- Política de vigencia y degradación de tiers.
- Políticas RLS documentadas por tabla.
- Estrategia de pruebas automatizadas.
