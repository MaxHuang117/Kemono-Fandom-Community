-- ─────────────────────────────────────────────────────────────────────────
-- FASE 0 — Hub de creadores: columnas nuevas de `profiles` y tablas nuevas.
--
-- Contexto (PLAN_HUB_STREAMERS.md / PLAN_FASE_0.md):
--   - Los tiers pasan a ser roles/estado: 0 Miembro · 1 Creador aprobado ·
--     2 Creador destacado. Sin pago ni vigencia (`sub_expires_at` queda en
--     desuso; la columna se conserva hasta que se reemplace el módulo
--     admin "Tiers & Subs" en la Fase 2).
--   - Principio de acceso (docs/architecture/overview.md): las tablas nuevas
--     se leen/escriben SOLO vía server actions con `service_role` (bypass de
--     RLS) y verificación explícita de sesión/permisos en cada acción.
--     RLS habilitado en todas, SIN políticas para `anon`/`authenticated`.
--   - Las columnas nuevas de `profiles` NO se otorgan al rol `anon`:
--     la migración 20261103000000 hizo REVOKE ALL + GRANT por columna,
--     así que las columnas añadidas aquí quedan privadas automáticamente.
--     Se añadirá un GRANT solo si una lectura pública lo exige.
--   - `profiles.id` es `text` (convención histórica id = discord_id), por
--     eso las FKs hacia perfiles son `text`.
--
-- NOTA: aplicar esta migración en Supabase requiere autorización explícita.
-- ─────────────────────────────────────────────────────────────────────────

-- ── 1. `profiles`: postulación de creadores y comentarios de perfil ──────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS streamer_status text,          -- null | pending | approved | rejected
  ADD COLUMN IF NOT EXISTS streamer_category text,        -- categoría principal (Gaming, VTuber, ...)
  ADD COLUMN IF NOT EXISTS tags text[],                   -- tags para descubrimiento
  ADD COLUMN IF NOT EXISTS profile_comments_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS profile_comments_moderated boolean NOT NULL DEFAULT true;

-- Índice para el directorio: filtrar por `streamer_status = 'approved'`.
CREATE INDEX IF NOT EXISTS profiles_streamer_status_idx
  ON public.profiles (streamer_status);

-- ── 2. `hero_slides`: slides del Hero editable desde /admin ───────────────
-- Sustituyen a los slides hardcodeados en src/components/home/HeroBanner.

CREATE TABLE IF NOT EXISTS public.hero_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  image_url text NOT NULL,
  cta_label text,
  cta_url text,
  position integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

-- ── 3. `profile_comments`: comentarios en perfiles de creadores ──────────
-- El creador decide si habilitarlos (`profile_comments_enabled`) y si
-- moderarlos (`profile_comments_moderated`). Lectura/escritura solo vía
-- server actions con verificación de sesión y propiedad.

CREATE TABLE IF NOT EXISTS public.profile_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id text NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_id text NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  status text NOT NULL DEFAULT 'pending',  -- pending | approved | rejected
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profile_comments ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS profile_comments_profile_idx
  ON public.profile_comments (profile_id, status);

-- ── 4. `notifications`: avisos in-app ────────────────────────────────────
-- Tipos MVP: application_result · profile_comment_received ·
-- reputation_received · news_published. Privadas por diseño (solo el
-- destinatario puede leerlas, vía server action con sesión).

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  actor_id text REFERENCES public.profiles(id) ON DELETE SET NULL,
  payload jsonb,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS notifications_user_idx
  ON public.notifications (user_id, read, created_at DESC);

-- ── 5. `supporters`: muro de supporters ──────────────────────────────────
-- Poblada desde /admin al inicio; a futuro puede automatizarse vía webhook
-- (Ko-fi). `profile_id` nullable para supporters sin cuenta.

CREATE TABLE IF NOT EXISTS public.supporters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id text REFERENCES public.profiles(id) ON DELETE SET NULL,
  name text NOT NULL,
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.supporters ENABLE ROW LEVEL SECURITY;

-- ── 6. `sponsors`: patrocinadores con placement y vigencia ───────────────
-- Trato directo (sin pasarela): el admin crea el sponsor y define dónde
-- aparece (`placement`) y por cuánto (`start_date`/`end_date`).

CREATE TABLE IF NOT EXISTS public.sponsors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text,
  description text,
  link_url text,
  placement text NOT NULL DEFAULT 'hero',  -- hero | news | footer
  start_date date,
  end_date date,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
