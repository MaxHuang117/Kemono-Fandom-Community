/*
|--------------------------------------------------------------------------
| Helpers PKCE y state (OAuth 2.0)
|--------------------------------------------------------------------------
| Generación de `code_verifier`, `code_challenge` (S256) y `state` (anti-CSRF)
| usando Web Crypto (disponible en el runtime de Node y Edge).
|--------------------------------------------------------------------------
*/

function base64url(input: ArrayBuffer | Uint8Array): string {
    const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
    let binary = "";
    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }
    return btoa(binary)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

/** Genera un `code_verifier` aleatorio (PKCE). */
export function generateCodeVerifier(): string {
    const bytes = new Uint8Array(64);
    crypto.getRandomValues(bytes);
    return base64url(bytes);
}

/** Deriva el `code_challenge` S256 a partir del `code_verifier`. */
export async function generateCodeChallenge(verifier: string): Promise<string> {
    const data = new TextEncoder().encode(verifier);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return base64url(new Uint8Array(digest));
}

/** Genera un `state` aleatorio para prevenir CSRF. */
export function generateState(): string {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return base64url(bytes);
}
