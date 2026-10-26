# Estado del proyecto

**Actualizado:** 26 de octubre de 2026

## Completado hoy

- Cerrada formalmente la **Fase 1 — Fundación** en `docs/product/roadmap.md`.
- Documentados la arquitectura, la fuente de identidad, el inventario de rutas/acciones/datos y el flujo de desarrollo en `docs/`.
- Verificada la seguridad de las acciones de slides Tier 2: identidad obtenida con `getServerSession(authOptions)`, perfil resuelto por `discord_id`, validación de Tier 2 y vigencia, y acceso limitado al `profile.id` autenticado.
- Añadido un límite de `Suspense` en `/auth/callback` para el uso de `useSearchParams` durante el build de producción.

## Verificación

- `npm run lint`: correcto.
- `npm run build`: correcto; compilación, TypeScript y generación de páginas completados.

## Pendiente

- Continuar la Fase 2: revisión de Server Actions, validación de entradas, políticas RLS, `.env.example` y pruebas de permisos.

Nota del dev: detalle al abrir el editor de una tarjeta vip: ⚠ The requested resource "https://hrvhilxijhrblcgkrlrd.supabase.co/storage/v1/object/public/user_slides/603643066242301963/slide_1.gif?t=1792134109326" is an animated image so it will not be optimized. Consider adding the "unoptimized" property to the <Image>.