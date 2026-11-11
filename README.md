# Kemono Fandom Community

Plataforma web para creadores de contenido y su comunidad. Reúne perfiles públicos, enlaces a redes, noticias y comentarios, y está pensada para crecer hacia beneficios de visibilidad para creadores y, a futuro, para patrocinadores.

Nació como proyecto del programa **Análisis y Desarrollo de Software (ADSO) del SENA** y se está diseñando para escalar como producto real.

---

## Propósito

- **Comunidad:** un espacio donde los fans pueden seguir noticias, participar en comentarios y valorar contenido.
- **Creadores:** un perfil público con enlaces a sus plataformas (Twitch, YouTube, X, GitHub) y, en niveles superiores, herramientas de personalización y presentación.
- **Patrocinadores (planificado):** visibilidad dentro de la plataforma. Aún no está implementado ni definido comercialmente.

---

## Stack tecnológico

### Frontend
- **Next.js 16** (App Router) — renderizado en servidor y cliente, rutas y Server Actions.
- **React 19** — interfaz basada en componentes.
- **TypeScript 5** — tipado estático en todo el código.
- **Tailwind CSS 4** — estilos.
- **Framer Motion 12** — animaciones.
- **Heroicons** — iconografía.

### Backend y datos
- **Supabase** — PostgreSQL, almacenamiento de archivos (Storage) y cliente de datos.
- **@supabase/ssr** — gestión de sesiones de Supabase en Next.js.
- **NextAuth 4** — autenticación con **Discord OAuth**.
- **Server Actions y Route Handlers** — lógica de negocio que se ejecuta en el servidor.

### Herramientas
- **ESLint 9**, **npm**, **Git / GitHub**.

---

## Funcionalidades actuales

- Inicio de sesión con Discord.
- Perfiles públicos en `/u/[id]` con avatar, banner, biografía y enlaces sociales.
- Niveles de usuario (tiers) que habilitan beneficios de perfil.
- Noticias y comentarios con likes, edición y eliminación de comentarios propios.
- Panel de administración (`/admin`) para noticias, comentarios y gestión de tiers.

---

## Estructura del proyecto

```text
max-hub/
├── src/
│   ├── app/              # Rutas (App Router): inicio, perfil, u/[id], login, admin, API de auth
│   ├── components/       # Componentes de interfaz por área (home, profile, Navbar, modals…)
│   ├── actions/          # Server Actions de perfil público y personalización
│   ├── config/           # Configuración de estilos VIP y redes sociales
│   ├── hooks/            # Hooks reutilizables
│   ├── lib/
│   │   ├── auth.ts       # Configuración de NextAuth
│   │   ├── services/     # Acceso a datos
│   │   └── supabase/     # Clientes de Supabase (navegador, servidor, admin)
│   └── types/            # Tipos compartidos
├── docs/                 # Documentación de producto, arquitectura y desarrollo
├── public/               # Recursos estáticos
├── STATUS.md             # Bitácora de desarrollo
└── README.md
```

---

## Instalación

Requisitos: **Node.js 20 o superior** y **npm**.

```bash
git clone https://github.com/MaxHuang117/Kemono-Fandom-Community.git
cd max-hub
npm install
```

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=

NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

# URL canónica para el callback OAuth de verificación de redes.
# En producción pon tu dominio real (sin barra final).
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# OAuth de redes sociales (verificación oficial)
TWITCH_CLIENT_ID=
TWITCH_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
X_CLIENT_ID=
X_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

> **Importante:** `SUPABASE_SERVICE_ROLE_KEY` y los `*_CLIENT_SECRET` son secretos. Nunca los expongas en el cliente, no les agregues el prefijo `NEXT_PUBLIC_` y no los subas al repositorio.

### Verificación de redes (OAuth directo)

El botón «Conectar» de X, Twitch, GitHub y YouTube usa **OAuth 2.0 directo contra cada plataforma** (sin Supabase Auth). Para que funcione:

1. Crea una app OAuth en cada portal (X Developer, Twitch dev, GitHub, Google Cloud) y pega sus credenciales en `.env.local`.
2. Registra en cada portal el callback URL:
   `https://tu-dominio.com/api/social/callback/<plataforma>` (y `http://localhost:3000/...` para desarrollo).
3. **Google/YouTube:** habilita **YouTube Data API v3** y añade el scope `https://www.googleapis.com/auth/youtube.readonly` al consent screen.
4. Configura `NEXTAUTH_URL` y `NEXT_PUBLIC_SITE_URL` con tu dominio real en producción.

---

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Inicia el servidor de desarrollo en `http://localhost:3000` |
| `npm run build` | Genera la compilación de producción |
| `npm start` | Inicia la aplicación compilada |
| `npm run lint` | Ejecuta ESLint |
| `npm run sub-types` | Regenera `src/lib/supabase/database.types.ts` desde el esquema de Supabase |

---

## Documentación

- [`docs/product/roadmap.md`](docs/product/roadmap.md) — fases y prioridades del producto.
- [`docs/architecture/overview.md`](docs/architecture/overview.md) — arquitectura modular y reglas de diseño.
- [`docs/development/workflow.md`](docs/development/workflow.md) — flujo de desarrollo, revisión y publicación.
- [`STATUS.md`](STATUS.md) — bitácora de avances.

---

## Estado del proyecto

En desarrollo activo. La autenticación, perfiles, noticias, comentarios y administración básica están implementados; la seguridad de las acciones del servidor, las pruebas automatizadas y los beneficios de cada tier se están consolidando según la hoja de ruta.

---

## Licencia

Proyecto privado en desarrollo. Todos los derechos reservados por su autor.
