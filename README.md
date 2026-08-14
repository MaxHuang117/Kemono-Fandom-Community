# Max Hub

Plataforma web desarrollada con Next.js para centralizar contenido, perfiles de usuario, noticias y funcionalidades de comunidad.

El proyecto forma parte del proceso de formación en Análisis y Desarrollo de Software (ADSO) y está siendo desarrollado con una arquitectura orientada a separar la interfaz, la lógica del servidor y el acceso a datos.

---

## 🚀 Tecnologías utilizadas

### Frontend

- **Next.js 16.2.10** — Framework principal de la aplicación.
- **React 19.2.4** — Construcción de la interfaz mediante componentes.
- **TypeScript 5** — Tipado estático y seguridad durante el desarrollo.
- **Tailwind CSS 4** — Estilos y diseño de la interfaz.
- **Framer Motion 12** — Animaciones y transiciones de la interfaz.

### Backend y autenticación

- **Next.js Server Actions** — Ejecución de lógica del servidor desde la aplicación.
- **NextAuth 4** — Gestión de sesiones y autenticación.
- **Discord OAuth** — Inicio de sesión mediante Discord.
- **Supabase JS 2** — Comunicación con la base de datos y servicios de Supabase.
- **Supabase Auth Helpers** — Utilidades de integración con Supabase.

### Base de datos

- **Supabase**
- **PostgreSQL**
- **Row Level Security (RLS)** — Control de acceso a los datos mediante políticas de PostgreSQL.

### Herramientas de desarrollo

- **Node.js**
- **npm**
- **ESLint 9** — Análisis estático y detección de problemas en el código.
- **TypeScript**
- **Turbopack** — Bundler utilizado por Next.js durante el desarrollo/build.
- **Git**
- **GitHub**

---

## ✨ Características

- 🔐 Autenticación mediante Discord.
- 👤 Perfiles de usuario.
- 🖼️ Avatares y banners de Discord.
- 📝 Biografía personal.
- 📰 Sistema de noticias.
- 💬 Sistema de comentarios.
- ❤️ Likes en comentarios.
- 👥 Visualización de usuarios que dieron like.
- ✏️ Edición de comentarios propios.
- 🗑️ Eliminación de comentarios propios.
- 👤 Visualización de perfiles desde los comentarios.
- 🎞️ Animaciones mediante Framer Motion.
- 📱 Interfaz responsive.
- 🛡️ Validación de comentarios.
- 🔒 Protección de operaciones sensibles mediante Server Actions.
- 🔑 Uso de Supabase Service Role exclusivamente desde el servidor.

---

## 🛡️ Seguridad

El proyecto utiliza una arquitectura donde las operaciones sensibles se ejecutan exclusivamente en el servidor.

Entre las medidas implementadas se encuentran:

- Las claves privadas de Supabase no se exponen al cliente.
- `SUPABASE_SERVICE_ROLE_KEY` se utiliza únicamente en código del servidor.
- Las operaciones sensibles utilizan **Next.js Server Actions**.
- Las acciones protegidas verifican la sesión mediante **NextAuth**.
- Las operaciones sobre comentarios verifican la propiedad del comentario antes de permitir modificaciones o eliminaciones.
- La identidad del usuario se obtiene desde la sesión autenticada.
- Las políticas **RLS** de Supabase controlan el acceso a las tablas.
- El token de acceso de Discord no se almacena ni se expone innecesariamente.
- Las variables sensibles se mantienen fuera del repositorio mediante variables de entorno.

---

## 📁 Estructura general

```text
max-hub/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   ├── api/
│   │   │   └── auth/
│   │   ├── inicio/
│   │   ├── login/
│   │   ├── perfil/
│   │   └── signup/
│   │
│   ├── components/
│   │   └── home/
│   │       └── News/
│   │           └── components/
│   │
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── constants/
│   │   ├── mappers/
│   │   ├── services/
│   │   ├── types/
│   │   └── validators/
│   │
│   └── types/
│       └── next-auth.d.ts
│
├── public/
├── .env.local
├── package.json
├── tsconfig.json
└── README.md

⚙️ Instalación

Clonar el repositorio:

git clone https://github.com/MaxHuang117/Kemono-Fandom-Community.git
cd max-hub

Instalar las dependencias:

npm install

Crear un archivo .env.local con las variables necesarias:

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_EMAIL=

DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=

NEXTAUTH_SECRET=
NEXTAUTH_URL=

Las claves privadas NO deben incluirse directamente en el código ni subirse al repositorio.

🧑‍💻 Desarrollo

Iniciar el servidor de desarrollo:

npm run dev

La aplicación estará disponible en:

http://localhost:3000
🔍 Lint

Ejecutar ESLint:

npm run lint
🏗️ Build

Crear una compilación de producción:

npm run build

Iniciar la aplicación compilada:

npm start
📦 Scripts disponibles
Comando	Descripción
npm run dev	Inicia el servidor de desarrollo
npm run build	Genera el build de producción
npm start	Inicia la aplicación en producción
npm run lint	Ejecuta ESLint
📌 Estado del proyecto

En desarrollo.

Actualmente se encuentran implementadas las funcionalidades principales de autenticación, perfiles, noticias y sistema de comentarios.

La arquitectura continúa evolucionando para mejorar la seguridad, organización del código, experiencia de usuario y escalabilidad del proyecto.

📄 Licencia

Este proyecto es privado y se encuentra actualmente en desarrollo.