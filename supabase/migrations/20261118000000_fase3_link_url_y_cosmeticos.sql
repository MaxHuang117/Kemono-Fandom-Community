-- ─────────────────────────────────────────────────────────────────────────
-- FASE 3 — Perfil de creador: enlace libre en slides + cosméticos.
--
-- Contexto (PLAN_FASE_3.md):
--   - `user_slides.target_network` guardaba una *clave* de red ("twitch"),
--     pero el carousel público la usaba como URL → enlace roto. Se renombra
--     a `link_url` (URL libre http/https), validada en el servidor.
--   - `profiles` gana `ring_color` (hex, Tier 1+) y `gradient_from`/
--     `gradient_to` (hex, Tier 2), que reemplazan los presets por un
--     degradado propio de 2 colores (los presets quedan como fallback).
--   - Los cosméticos son datos NO sensibles (solo colores); se otorgan a
--     `anon` para que `/u/[id]` y el modal (que leen con el cliente anon)
--     puedan mostrarlos, igual que `is_online` (Fase 1.5).
-- ─────────────────────────────────────────────────────────────────────────

-- 1. Renombrar la columna de destino del slide (idempotente).
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'user_slides'
          AND column_name = 'target_network'
    ) THEN
        ALTER TABLE public.user_slides RENAME COLUMN target_network TO link_url;
    END IF;
END $$;

-- 2. Cosméticos de perfil.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS ring_color text,
  ADD COLUMN IF NOT EXISTS gradient_from text,
  ADD COLUMN IF NOT EXISTS gradient_to text;

-- 3. Lectura pública de los cosméticos (datos NO sensibles).
GRANT SELECT (ring_color, gradient_from, gradient_to) ON public.profiles TO anon;
