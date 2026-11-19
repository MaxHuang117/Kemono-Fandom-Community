/*
|--------------------------------------------------------------------------
| Utilidades de URLs (Fase 3)
|--------------------------------------------------------------------------
| Valida URLs seguras http/https sin credenciales empotradas. Se usa tanto en
| el servidor (guardarSlideAction) como en el cliente (PublicVipCarousel)
| para no enlazar valores antiguos ("twitch") ni esquemas peligrosos
| (javascript:, data:).
|--------------------------------------------------------------------------
*/

export function esUrlSegura(url: unknown): url is string {
    if (typeof url !== "string") return false;

    let parsed: URL;
    try {
        parsed = new URL(url.trim());
    } catch {
        return false;
    }

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
    if (parsed.username || parsed.password) return false;

    return true;
}
