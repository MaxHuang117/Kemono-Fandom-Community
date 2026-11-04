/*
|--------------------------------------------------------------------------
| Configuración de proveedores OAuth oficiales (verificación de redes)
|--------------------------------------------------------------------------
| Cada red se autentica directamente contra su API oficial (sin Supabase Auth).
| `key` es la clave interna que se guarda en `profiles.social_links`.
|--------------------------------------------------------------------------
*/

export interface SocialProvider {
    key: string;
    /** Nombre de la variable de entorno con el Client ID. */
    clientIdEnv: string;
    /** Nombre de la variable de entorno con el Client Secret. */
    clientSecretEnv: string;
    /** Endpoint de autorización. */
    authorizeUrl: string;
    /** Scopes (separados por espacio). Vacío = sin scope adicional. */
    scope: string;
    /** Endpoint para intercambiar el `code` por `access_token`. */
    tokenUrl: string;
    /** Cómo se envían las credenciales del cliente al intercambiar el token. */
    tokenAuth: "body" | "basic";
    /** Si el intercambio de token requiere `code_verifier` (PKCE). */
    usePkce: boolean;
    /** Endpoint para leer el usuario autenticado. */
    userInfoUrl: string;
    /** Headers para la petición de usuario (recibe el access_token). */
    userInfoHeaders: (accessToken: string) => Record<string, string>;
    /** Extrae el handle oficial desde la respuesta JSON de usuario. */
    extractHandle: (data: unknown) => string | null;
}

export const SOCIAL_PROVIDERS: Record<string, SocialProvider> = {
    twitch: {
        key: "twitch",
        clientIdEnv: "TWITCH_CLIENT_ID",
        clientSecretEnv: "TWITCH_CLIENT_SECRET",
        authorizeUrl: "https://id.twitch.tv/oauth2/authorize",
        scope: "",
        tokenUrl: "https://id.twitch.tv/oauth2/token",
        tokenAuth: "body",
        usePkce: false,
        userInfoUrl: "https://api.twitch.tv/helix/users",
        userInfoHeaders: (accessToken) => ({
            Authorization: `Bearer ${accessToken}`,
            "Client-Id": process.env.TWITCH_CLIENT_ID ?? "",
        }),
        extractHandle: (data) => {
            const item = (data as { data?: Array<{ login?: string }> })?.data?.[0];
            return item?.login ?? null;
        },
    },
    github: {
        key: "github",
        clientIdEnv: "GITHUB_CLIENT_ID",
        clientSecretEnv: "GITHUB_CLIENT_SECRET",
        authorizeUrl: "https://github.com/login/oauth/authorize",
        scope: "",
        tokenUrl: "https://github.com/login/oauth/access_token",
        tokenAuth: "body",
        usePkce: false,
        userInfoUrl: "https://api.github.com/user",
        userInfoHeaders: (accessToken) => ({
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github+json",
        }),
        extractHandle: (data) => (data as { login?: string })?.login ?? null,
    },
    x: {
        key: "x",
        clientIdEnv: "X_CLIENT_ID",
        clientSecretEnv: "X_CLIENT_SECRET",
        authorizeUrl: "https://twitter.com/i/oauth2/authorize",
        scope: "users.read tweet.read",
        tokenUrl: "https://api.twitter.com/2/oauth2/token",
        tokenAuth: "basic",
        usePkce: true,
        userInfoUrl: "https://api.twitter.com/2/users/me",
        userInfoHeaders: (accessToken) => ({
            Authorization: `Bearer ${accessToken}`,
        }),
        extractHandle: (data) => (data as { data?: { username?: string } })?.data?.username ?? null,
    },
    youtube: {
        key: "youtube",
        clientIdEnv: "GOOGLE_CLIENT_ID",
        clientSecretEnv: "GOOGLE_CLIENT_SECRET",
        authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
        scope: "openid profile email https://www.googleapis.com/auth/youtube.readonly",
        tokenUrl: "https://oauth2.googleapis.com/token",
        tokenAuth: "body",
        usePkce: false,
        userInfoUrl: "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
        userInfoHeaders: (accessToken) => ({
            Authorization: `Bearer ${accessToken}`,
        }),
        extractHandle: (data) => {
            const snippet = (data as { items?: Array<{ snippet?: { customUrl?: string; title?: string } }> })
                ?.items?.[0]?.snippet;
            if (!snippet) return null;
            // Preferimos el @handle (customUrl) y, si el canal no tiene uno, el título.
            return snippet.customUrl?.replace(/^@/, "") || snippet.title || null;
        },
    },
};

/** Claves internas permitidas (allowlist). */
export const ALLOWED_SOCIAL_PLATFORMS: ReadonlySet<string> = new Set(
    Object.keys(SOCIAL_PROVIDERS)
);

/** Nombres de cookies httpOnly usadas durante el flujo OAuth. */
export const OAUTH_COOKIE_STATE = "social_oauth_state";
export const OAUTH_COOKIE_VERIFIER = "social_oauth_verifier";
export const OAUTH_COOKIE_PLATFORM = "social_oauth_platform";
