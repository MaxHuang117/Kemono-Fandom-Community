-- FASE2-10 — Reputación de perfiles (toggle de likes).
--
-- Objetivo:
--   1) Eliminar duplicados existentes de (giver_id, receiver_id).
--   2) Añadir una restricción única para evitar likes duplicados y habilitar
--      el patrón de toggle atómico (delete-then-insert) sin condiciones de carrera.
--
-- NOTA: esta migración está versionada pero NO ha sido aplicada a Supabase.
--       Requiere autorización explícita antes de ejecutarla.

-- 1. Deduplicar conservando la fila más reciente (ctid mayor) de cada par.
DELETE FROM public.profile_likes a
USING public.profile_likes b
WHERE a.giver_id = b.giver_id
  AND a.receiver_id = b.receiver_id
  AND a.ctid < b.ctid;

-- 2. Restricción única sobre (giver_id, receiver_id).
ALTER TABLE public.profile_likes
  ADD CONSTRAINT profile_likes_giver_receiver_unique
  UNIQUE (giver_id, receiver_id);
