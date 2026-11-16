"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITE_CONFIG, ALL_TAGS } from "@/config/site.config";
import { revalidatePath } from "next/cache";

const supabaseAdmin = createAdminClient();

const GENERIC_DB_ERROR = "Error interno al procesar la solicitud. Intenta de nuevo.";

/**
 * Devuelve el estado de postulación del usuario autenticado.
 */
export async function obtenerEstadoPostulacionAction() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.discordId) return { error: "No autorizado." };

    const { data: profile, error } = await supabaseAdmin
        .from("profiles")
        .select("streamer_status, streamer_category, tags")
        .eq("discord_id", session.user.discordId)
        .maybeSingle();

    if (error) {
        console.error("Error obteniendo estado de postulación:", error);
        return { error: GENERIC_DB_ERROR };
    }

    return {
        status: profile?.streamer_status ?? null,
        category: profile?.streamer_category ?? null,
        tags: profile?.tags ?? [],
    };
}

/**
 * Crea una postulación para convertirse en creador.
 * Solo se permite si el usuario no está pending ni approved.
 */
export async function postularCreadorAction(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.discordId) return { error: "No autorizado." };

    const category = formData.get("category") as string;
    const tagsRaw = formData.get("tags") as string;

    // Validación de categoría (allowlist)
    if (typeof category !== "string" || !(SITE_CONFIG.categories as readonly string[]).includes(category)) {
        return { error: "Categoría inválida." };
    }

    // Validación de tags (allowlist)
    let tags: string[] = [];
    if (tagsRaw) {
        try {
            const parsed = JSON.parse(tagsRaw);
            if (!Array.isArray(parsed)) return { error: "Tags inválidos." };
            tags = parsed.filter((tag: unknown): tag is string => typeof tag === "string");
        } catch {
            return { error: "Tags inválidos." };
        }
    }

    if (tags.length > 0 && !tags.every((tag) => ALL_TAGS.includes(tag))) {
        return { error: "Uno o más tags no son válidos." };
    }

    // Resolver perfil propio
    const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("id, streamer_status")
        .eq("discord_id", session.user.discordId)
        .single();

    if (profileError || !profile) {
        console.error("Error resolviendo perfil en postulación:", profileError);
        return { error: GENERIC_DB_ERROR };
    }

    // Bloquear si ya está pendiente o aprobado
    if (profile.streamer_status === "pending") {
        return { error: "Ya tienes una postulación en revisión." };
    }

    if (profile.streamer_status === "approved") {
        return { error: "Ya eres un creador aprobado." };
    }

    const { error } = await supabaseAdmin
        .from("profiles")
        .update({
            streamer_status: "pending",
            streamer_category: category,
            tags,
            updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

    if (error) {
        console.error("Error guardando postulación:", error);
        return { error: GENERIC_DB_ERROR };
    }

    revalidatePath("/postulate");
    return { success: true };
}
