import { NextRequest, NextResponse } from "next/server";
import {
    SOCIAL_PROVIDERS,
    OAUTH_COOKIE_STATE,
    OAUTH_COOKIE_VERIFIER,
    OAUTH_COOKIE_PLATFORM,
} from "@/lib/social-oauth/config";
import { vincularRedVerificada } from "@/lib/social-oauth/linking";

function errorRedirect(request: NextRequest) {
    return NextResponse.redirect(new URL("/perfil?social=error", request.url));
}

function clearOAuthCookies(response: NextResponse) {
    const options = { path: "/", maxAge: 0 };
    response.cookies.set(OAUTH_COOKIE_STATE, "", options);
    response.cookies.set(OAUTH_COOKIE_VERIFIER, "", options);
    response.cookies.set(OAUTH_COOKIE_PLATFORM, "", options);
}

/**
 * Intercambia el `code` por un `access_token` contra el endpoint oficial.
 */
async function exchangeCode(
    provider: (typeof SOCIAL_PROVIDERS)[string],
    code: string,
    redirectUri: string,
    verifier: string
): Promise<string | null> {
    const clientId = process.env[provider.clientIdEnv];
    const clientSecret = process.env[provider.clientSecretEnv];

    if (!clientId || !clientSecret) {
        console.error(`callback/${provider.key}: faltan credenciales OAuth`);
        return null;
    }

    const body = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
    });

    body.set("code_verifier", verifier);

    const headers: Record<string, string> = {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
    };

    if (provider.tokenAuth === "basic") {
        const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
            "base64"
        );
        headers.Authorization = `Basic ${credentials}`;
    } else {
        body.set("client_id", clientId);
        body.set("client_secret", clientSecret);
    }

    const res = await fetch(provider.tokenUrl, {
        method: "POST",
        headers,
        body: body.toString(),
    });

    if (!res.ok) {
        console.error(
            `callback/${provider.key}: token exchange ${res.status} ${await res.text()}`
        );
        return null;
    }

    const data = (await res.json()) as { access_token?: string };
    return data.access_token ?? null;
}

/**
 * Callback OAuth: valida state (CSRF) + plataforma, intercambia el code,
 * obtiene el handle oficial y lo vincula al perfil. Redirige a /perfil.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ platform: string }> }
) {
    const { platform } = await params;
    const provider = SOCIAL_PROVIDERS[platform];

    if (!provider) {
        return errorRedirect(request);
    }

    const url = new URL(request.url);

    // El usuario canceló o la plataforma devolvió un error.
    if (url.searchParams.get("error")) {
        return errorRedirect(request);
    }

    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    const expectedState = request.cookies.get(OAUTH_COOKIE_STATE)?.value;
    const expectedPlatform = request.cookies.get(OAUTH_COOKIE_PLATFORM)?.value;
    const verifier = request.cookies.get(OAUTH_COOKIE_VERIFIER)?.value ?? "";

    // Anti-CSRF (state) + coincidencia de plataforma (la red iniciada).
    if (
        !code ||
        !state ||
        !expectedState ||
        state !== expectedState ||
        expectedPlatform !== platform
    ) {
        return errorRedirect(request);
    }

    // URL canónica para reconstruir el redirect_uri usado al iniciar.
    const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
    const origin = configured || new URL(request.url).origin;
    const redirectUri = `${origin}/api/social/callback/${platform}`;

    const accessToken = await exchangeCode(provider, code, redirectUri, verifier);
    if (!accessToken) {
        return errorRedirect(request);
    }

    const userRes = await fetch(provider.userInfoUrl, {
        headers: provider.userInfoHeaders(accessToken),
    });

    if (!userRes.ok) {
        console.error(
            `callback/${provider.key}: user info ${userRes.status} ${await userRes.text()}`
        );
        return errorRedirect(request);
    }

    const userData = await userRes.json();
    const handle = provider.extractHandle(userData);

    if (!handle) {
        console.error(`callback/${provider.key}: no se pudo extraer el handle`);
        return errorRedirect(request);
    }

    const result = await vincularRedVerificada(platform, handle);

    const response = result.success
        ? NextResponse.redirect(new URL("/perfil?social=ok", request.url))
        : errorRedirect(request);

    clearOAuthCookies(response);
    return response;
}
