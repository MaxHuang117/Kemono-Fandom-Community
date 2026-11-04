"use server";

/*
|--------------------------------------------------------------------------
| YouTube Data API — verificación de canal
|--------------------------------------------------------------------------
| Dado el access_token de Google (provider_token de Supabase OAuth),
| obtiene el @handle (customUrl) o el título del canal real del usuario
| usando `channels.list(part=snippet, mine=true)`.

| Requisito: el token OAuth de Google debe incluir el scope
| `https://www.googleapis.com/auth/youtube.readonly`. Sin ese scope,
| la API responde 403 (insufficientPermissions) y devolvemos un error
| controlado.
|--------------------------------------------------------------------------
*/

const YOUTUBE_API_ENDPOINT =
    "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true";

interface YouTubeResult {
    handle?: string;
    error?: string;
}

export async function obtenerHandleYouTubeAction(
    accessToken: string
): Promise<YouTubeResult> {
    // Validación estricta del token entrante
    if (typeof accessToken !== "string" || accessToken.trim().length === 0) {
        return { error: "Token de Google inválido o ausente." };
    }

    const token = accessToken.trim();

    try {
        const res = await fetch(YOUTUBE_API_ENDPOINT, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
            cache: "no-store",
        });

        if (res.status === 403) {
            return {
                error:
                    "No se pudo leer tu canal de YouTube: falta el permiso youtube.readonly en el proveedor de Google.",
            };
        }

        if (!res.ok) {
            return { error: "Error al consultar el canal de YouTube." };
        }

        const data = await res.json();
        const channel = data?.items?.[0];

        if (!channel?.snippet) {
            return {
                error:
                    "No se encontró un canal de YouTube asociado a esta cuenta de Google.",
            };
        }

        // Preferimos el @handle (customUrl) y, si no existe, el título del canal.
        const handle =
            channel.snippet.customUrl?.replace(/^@/, "") ||
            channel.snippet.title ||
            null;

        if (!handle) {
            return { error: "No se pudo extraer el identificador del canal." };
        }

        return { handle };
    } catch (error) {
        console.error("obtenerHandleYouTubeAction:", error);
        return { error: "Fallo al conectar con YouTube Data API." };
    }
}
