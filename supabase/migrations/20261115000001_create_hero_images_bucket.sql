-- ─────────────────────────────────────────────────────────────────────────
-- FASE 2 — Bucket público para imágenes del Hero editable.
--
-- El bucket se usa desde la server action saveHeroSlideAction
-- (service_role). `public = true` permite servir imágenes por URL pública.
-- ─────────────────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, avif_autodetection)
VALUES ('hero_images', 'hero_images', true, false)
ON CONFLICT (id) DO NOTHING;
