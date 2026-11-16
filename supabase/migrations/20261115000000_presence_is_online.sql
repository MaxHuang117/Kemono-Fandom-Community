-- ─────────────────────────────────────────────────────────────────────────
-- FASE 1.5 — Presencia ONLINE de creadores.
--
-- El badge "ONLINE" de PerfilCard.tsx pasa de ser decorativo a reflejar
-- `profiles.is_online`, activado manualmente por el creador desde /perfil.
--
-- `is_online` NO es sensible, por lo que se otorga al rol `anon`: la lectura
-- pública (obtenerPerfilPublicoAction) usa la clave anon y el patrón
-- REVOKE ALL + GRANT por columna de 20261103000000 lo ocultaría si no se
-- añade este GRANT explícito.
--
-- No requiere políticas RLS nuevas: `profiles` ya tiene la política pública
-- `profiles_public_select` (SELECT TO anon USING (true)); las columnas
-- sensibles siguen protegidas por los GRANTs existentes.
-- ─────────────────────────────────────────────────────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_online boolean NOT NULL DEFAULT false;

GRANT SELECT (is_online) ON TABLE public.profiles TO anon;
