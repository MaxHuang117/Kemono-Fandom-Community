-- ─────────────────────────────────────────────────────────────────────────
-- Fase 3 (fix B3) — Versionar y corregir `reorder_slides_after_delete`.
--
-- La función existía en Supabase creada a mano (no versionada) y reordenaba
-- mal bajo la restricción única `(user_id, slot_number)`: al borrar el slot 1,
-- el slot 2 no se re-numeraba a slot 1, dejando el estado desincronizado y
-- bloqueando borrados posteriores.
--
-- Solución: iterar los slides con `slot_number > p_deleted_slot` en orden
-- ASCENDENTE y renumerarlos secuencialmente. Así, al mover el slot N+1 → N,
-- el slot N ya quedó libre (el slide anterior ya se movió), evitando
-- violaciones de la unicidad.
--
-- Se ejecuta con `service_role` (bypass de RLS) desde `eliminarSlideAction`.
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.reorder_slides_after_delete(
    p_deleted_slot integer,
    p_user_id text
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    slide_row RECORD;
    next_slot integer := p_deleted_slot;
BEGIN
    FOR slide_row IN
        SELECT id
        FROM public.user_slides
        WHERE user_id = p_user_id AND slot_number > p_deleted_slot
        ORDER BY slot_number ASC
    LOOP
        UPDATE public.user_slides
        SET slot_number = next_slot
        WHERE id = slide_row.id;
        next_slot := next_slot + 1;
    END LOOP;
END;
$$;
