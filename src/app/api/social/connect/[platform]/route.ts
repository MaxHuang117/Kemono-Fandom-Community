import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
    SOCIAL_PROVIDERS,
    OAUTH_COOKIE_STATE,
    OAUTH_COOKIE_VERIFIER,
    OAUTH_COOKIE_PLATFORM,
} from "@/lib/social-oauth/config";
import {
    generateCodeVerifier,
    generateCodeChallenge,
    generateState,
} from "@/lib/social-oauth/pkce";

/** Duración de las cookies del flujo (10 minutos). */
const OAUTH_COOKIE_MAX_AGE = 600;

/**
 * Inicia el flujo OAuth de una red social:
 * verifica sesión (NextAuth/Discord), genera state + PKCE, guarda los
 * valores en cookies httpOnly y redirige al portal de la plataforma.
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ platform: string }> }
) {
    const { platform } = await params;
    const provider = SOCIAL_PROVIDERS[platform];

    const errorRedirect = (request: Request) =>
        NextResponse.redirect(new URL("/perfil?social=error", request.url));

    if (!provider) {
        return errorRedirect(request);
    }

    // Identidad: solo usuarios autenticados con Discord pueden vincular.
    const session = await getServerSession(authOptions);
    if (!session?.user?.discordId) {
        return errorRedirect(request);
    }

    const clientId = process.env[provider.clientIdEnv];
    if (!clientId) {
        console.error(`connect/${platform}: falta ${provider.clientIdEnv}`);
        return errorRedirect(request);
    }

    // URL canónica de la app (producción o dev), para armar el callback.
    const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
    const origin = configured || new URL(request.url).origin;
    const callbackUrl = `${origin}/api/social/callback/${platform}`;

    // PKCE + state anti-CSRF.
    const verifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);
    const state = generateState();

    const authorizeParams = new URLSearchParams({
        client_id: clientId,
        redirect_uri: callbackUrl,
        response_type: "code",
        state,
        code_challenge: challenge,
        code_challenge_method: "S256",
    });

    if (provider.scope) {
        authorizeParams.set("scope", provider.scope);
    }

    const authorizeUrl = `${provider.authorizeUrl}?${authorizeParams.toString()}`;

    const response = NextResponse.redirect(authorizeUrl);
    const cookieOptions = {
        httpOnly: true,
        sameSite: "lax" as const,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: OAUTH_COOKIE_MAX_AGE,
    };

    response.cookies.set(OAUTH_COOKIE_STATE, state, cookieOptions);
    response.cookies.set(OAUTH_COOKIE_VERIFIER, verifier, cookieOptions);
    response.cookies.set(OAUTH_COOKIE_PLATFORM, platform, cookieOptions);

    return response;
}
