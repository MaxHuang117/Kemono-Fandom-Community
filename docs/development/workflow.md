# Flujo de desarrollo

Este documento describe cómo se propone, implementa, verifica y publica un cambio en Kemono Fandom Community.

## 1. Preparar el cambio

Antes de programar, documenta en el issue o en `STATUS.md`:

- **Problema o objetivo:** qué resuelve y para quién.
- **Tier afectado:** 0, 1, 2, 3 o administración.
- **Datos que maneja:** tablas, archivos, datos personales.
- **Criterios de aceptación:** cómo se verifica que funciona.

Si el cambio altera beneficios de un tier, actualiza primero `docs/architecture/overview.md`.

## 2. Diseñar

- Ubica el cambio en el módulo correcto (ver `docs/architecture/overview.md`).
- Si toca base de datos, describe el cambio de esquema y su migración antes de implementarlo.
- Si toca autenticación o permisos, revisa la sección de identidad y autorización.

## 3. Implementar

- Haz cambios pequeños y enfocados en un solo objetivo.
- Mantén la lógica de negocio en acciones o servicios, no en componentes de presentación.
- Valida toda entrada del usuario en el servidor.
- No introduzcas secretos en el código ni en variables `NEXT_PUBLIC_`.
- Next.js 16 introduce cambios de API: consulta la documentación incluida en `node_modules/next/dist/docs/` antes de escribir código relacionado con rutas, caché o Server Actions.

## 4. Verificar

Antes de abrir un pull request:

```bash
npm run lint
npm run build
```

Además, verifica manualmente el flujo afectado con la cuenta adecuada (usuario sin sesión, Tier 0, Tier 2 y administrador cuando aplique).

## 5. Revisar

Checklist para el revisor:

- [ ] El cambio cumple los criterios de aceptación.
- [ ] Las acciones de servidor verifican identidad y permisos.
- [ ] No hay claves ni datos sensibles en el diff.
- [ ] Los beneficios de tier usados están documentados.
- [ ] Los errores no exponen detalles internos al usuario.
- [ ] La documentación afectada fue actualizada.

## 6. Publicar

- Integra mediante pull request a la rama principal.
- Los cambios de base de datos se aplican primero en un entorno de prueba.
- Registra en `STATUS.md` qué se publicó, la fecha y cualquier efecto para los usuarios.

## 7. Después de publicar

- Revisa errores y comportamiento en producción durante el primer día.
- Si algo falla, revierte el cambio antes de intentar corregirlo en caliente.

## Convenciones

- **Commits:** mensajes en imperativo y en español o inglés, de forma consistente, describiendo el cambio.
- **Nombres:** componentes en PascalCase; hooks con prefijo `use`; acciones con sufijo `Action`.
- **Comentarios:** solo cuando expliquen algo que el código no dice por sí mismo.
- **Dependencias:** añadir solo cuando sea necesario; justificar en el pull request.

## Pendiente

- Definir pruebas automatizadas para permisos y acciones sensibles.
- Configurar integración continua que ejecute lint y build en cada pull request.
- Crear `.env.example` con las variables requeridas, sin valores.
