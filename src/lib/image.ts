/**
 * Utilidades de imáginales. Sin dependencias de runtime para poder usarse
 * tanto en Server Components como en Client Components.
 */

// GIF y APNG son formatos siempre animados. `next/image` los optimiza a un
// frame estático, por lo que deben renderizarse con `unoptimized`.
const ANIMATED_EXTENSION_PATTERN = /\.(gif|apng)$/i;

/**
 * Indica si una URL de imagen corresponde a un formato siempre animado
 * (GIF/APNG). Se ignora la cadena de consulta y el fragmento antes de leer
 * la extensión (los objetos de Supabase Storage pueden terminar en `?...`).
 */
export function esImagenAnimada(url: string | null | undefined): boolean {
    if (typeof url !== "string" || url.length === 0) {
        return false;
    }

    const rutaLimpia = url.split(/[?#]/)[0];

    return ANIMATED_EXTENSION_PATTERN.test(rutaLimpia);
}
