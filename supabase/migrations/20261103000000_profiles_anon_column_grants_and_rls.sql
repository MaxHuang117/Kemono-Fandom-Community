-- FASE2-01 (cierre) — GRANTs por columna del rol `anon` y políticas RLS.
--
-- Objetivo:
--   1) Versionar los GRANTs por columna aplicados manualmente en Supabase:
--      el rol `anon` no debe poder leer las columnas sensibles de `profiles`
--      (`email`, `is_admin`, `sub_expires_at`, `allow_gifs`, `custom_badge`,
--      `custom_slides`).
--   2) Activar Row Level Security y versionar las políticas de lectura
--      pública de las tablas que se leen con la clave `anon`.
--
-- Contexto de autorización (docs/architecture/overview.md):
--   - La única lectura con clave `anon` es `obtenerPerfilPublicoAction`
--     (src/actions/publicProfile.action.ts): lee `profiles` (columnas
--     públicas) y `user_slides` (`select *`) de perfiles públicos.
--   - Todas las escrituras y el resto de lecturas usan `service_role`
--     (bypass de RLS) con verificación explícita de sesión/permisos en
--     cada Server Action.
--   - La sesión de NextAuth NO es una sesión de Supabase Auth; el rol
--     `authenticated` de Supabase no se usa como identidad de la app.
--
-- NOTA: esta migración está versionada pero NO ha sido aplicada a Supabase
--       (los GRANTs ya se aplicaron manualmente y se verificaron el 1 de
--       noviembre). Requiere autorización explícita antes de ejecutarla.

-- ─────────────────────────────────────────────────────────────────────────
-- 1. `profiles`: restringir el SELECT del rol `anon` a las columnas públicas.
-- ─────────────────────────────────────────────────────────────────────────

REVOKE ALL ON TABLE public.profiles FROM anon;

GRANT SELECT (
  id,
  discord_id,
  discord_username,
  nombre_publico,
  avatar_url,
  banner_url,
  biografia,
  name_color_gradient,
  social_links,
  likes_count,
  tier_level,
  created_at,
  updated_at
) ON TABLE public.profiles TO anon;

-- El rol `authenticated` conserva sus privilegios por defecto (no se usa como
-- identidad de la app). Si en el futuro se adopta Supabase Auth como identidad,
-- aplicar aquí la misma restricción de columnas para `authenticated`.

-- ─────────────────────────────────────────────────────────────────────────
-- 2. Row Level Security + políticas de lectura pública.
-- ─────────────────────────────────────────────────────────────────────────

-- `profiles`: lectura pública de las columnas permitidas (cualquier fila).
-- Las columnas sensibles quedan protegidas por los GRANTs del punto 1.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_public_select" ON public.profiles;
CREATE POLICY "profiles_public_select"
  ON public.profiles
  FOR SELECT
  TO anon
  USING (true);

-- `user_slides`: lectura pública de slides (se muestran en perfiles públicos).
-- No contiene columnas sensibles; el SELECT completo está permitido.
ALTER TABLE public.user_slides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_slides_public_select" ON public.user_slides;
CREATE POLICY "user_slides_public_select"
  ON public.user_slides
  FOR SELECT
  TO anon
  USING (true);

-- `news`: lectura pública SOLO de noticias publicadas. El feed de la home
-- (src/components/home/News/News.tsx) lee con la clave `anon` filtrando
-- `published = true`; la política reproduce ese límite también para peticiones
-- REST directas. Sin políticas de escritura, `anon` no puede crear/editar/
-- borrar noticias (antes era posible por tener RLS desactivado).
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "news_public_select" ON public.news;
CREATE POLICY "news_public_select"
  ON public.news
  FOR SELECT
  TO anon
  USING (published = true);

-- Resto de tablas: solo se acceden con `service_role` (bypass de RLS).
-- Se activa RLS sin políticas para `anon`/`authenticated` de modo que ningún
-- rol sin privilegios pueda leerlas o escribirlas directamente.
ALTER TABLE public.profile_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_networks ENABLE ROW LEVEL SECURITY;
