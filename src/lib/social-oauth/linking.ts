import "server-only";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasActiveTier } from "@/lib/tier";
import { ALLOWED_SOCIAL_PLATFORMS } from "./config";

const supabaseAdmin = createAdminClient();

const MAX_SOCIAL_VALUE_LENGTH = 100;

/**
 * Normaliza el JSON de redes frente al allowlist, descartando claves
 * desconocidas (incluidas `__proto__`/`constructor`) y valores inválidos.
 */
function normalizarRedesSociales(socialLinks: unknown): Record<string, string> {
    if (!socialLinks || typeof socialLinks !== "object" || Array.isArray(socialLinks)) {
        return {};
    }

    const limpias: Record<string, string> = {};
    for (const [plataforma, valor] of Object.entries(
        socialLinks as Record<string, unknown>
    )) {
        if (
            ALLOWED_SOCIAL_PLATFORMS.has(plataforma) &&
            typeof valor === "string" &&
            valor.trim().length > 0 &&
            valor.trim().length <= MAX_SOCIAL_VALUE_LENGTH
        ) {
            limpias[plataforma] = valor.trim();
        }
    }
    return limpias;
}

/**
 * Vincula una red social verificada por OAuth al perfil del usuario actual.
 * La identidad procede exclusivamente de la sesión de NextAuth (Discord).
 * Devuelve `{ success: true }` o `{ success: false, error }`.
 */
export async function vincularRedVerificada(
    platform: string,
    handle: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.discordId) {
            return { success: false, error: "No autorizado." };
        }

        if (!ALLOWED_SOCIAL_PLATFORMS.has(platform)) {
            return { success: false, error: "Plataforma no permitida." };
        }

        if (
            typeof handle !== "string" ||
            handle.trim().length === 0 ||
            handle.trim().length > MAX_SOCIAL_VALUE_LENGTH
        ) {
            return { success: false, error: "Identificador inválido." };
        }

        const handleLimpio = handle.trim();

        const { data: profile, error: fetchError } = await supabaseAdmin
            .from("profiles")
            .select("social_links, tier_level, sub_expires_at")
            .eq("discord_id", session.user.discordId)
            .single();

        if (fetchError) {
            console.error("vincularRedVerificada: no se pudo leer el perfil", fetchError);
            return { success: false, error: "No se pudo leer tu perfil." };
        }

        // Beneficio Tier 1 con suscripción vigente (FASE2-08).
        if (!hasActiveTier(profile.tier_level, 1, profile.sub_expires_at)) {
            return {
                success: false,
                error: "Requiere Tier 1 vigente o superior para vincular redes.",
            };
        }

        const redesActuales = normalizarRedesSociales(profile.social_links);
        const redesActualizadas: Record<string, string> = {
            ...redesActuales,
            [platform]: handleLimpio,
        };

        const { error: updateError } = await supabaseAdmin
            .from("profiles")
            .update({
                social_links: redesActualizadas,
                updated_at: new Date().toISOString(),
            })
            .eq("discord_id", session.user.discordId);

        if (updateError) {
            console.error("vincularRedVerificada: error al guardar", updateError);
            return { success: false, error: "Error al guardar la red vinculada." };
        }

        return { success: true };
    } catch (error) {
        console.error("vincularRedVerificada: excepción", error);
        return { success: false, error: "Fallo crítico al vincular la red." };
    }
}
