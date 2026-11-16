"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin";

const supabaseAdmin = createAdminClient();

const GENERIC_DB_ERROR = "Error interno al procesar la solicitud. Intenta de nuevo.";

function isValidProfileId(id: string): boolean {
    return typeof id === "string" && id.length > 0 && id.length <= 64;
}

export async function getCreatorApplicationsAction() {
    await requireAdmin();

    const { data, error } = await supabaseAdmin
        .from("profiles")
        .select("id, discord_username, nombre_publico, avatar_url, streamer_status, streamer_category, tags, tier_level")
        .not("streamer_status", "is", null)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error obteniendo postulaciones:", error);
        throw new Error(GENERIC_DB_ERROR);
    }

    return data || [];
}

export async function approveCreatorAction(profileId: string) {
    await requireAdmin();

    if (!isValidProfileId(profileId)) return { error: "ID inválido." };

    const { data: profile, error: findError } = await supabaseAdmin
        .from("profiles")
        .select("streamer_status")
        .eq("id", profileId)
        .single();

    if (findError || !profile) {
        console.error("Error resolviendo perfil:", findError);
        return { error: GENERIC_DB_ERROR };
    }

    if (profile.streamer_status === "approved") {
        return { error: "Este creador ya está aprobado." };
    }

    const { error } = await supabaseAdmin
        .from("profiles")
        .update({
            streamer_status: "approved",
            tier_level: 1,
            updated_at: new Date().toISOString(),
        })
        .eq("id", profileId);

    if (error) {
        console.error("Error aprobando creador:", error);
        return { error: GENERIC_DB_ERROR };
    }

    revalidatePath("/admin/creators");
    revalidatePath("/");
    revalidatePath("/inicio");
    return { success: true };
}

export async function rejectCreatorAction(profileId: string) {
    await requireAdmin();

    if (!isValidProfileId(profileId)) return { error: "ID inválido." };

    const { error } = await supabaseAdmin
        .from("profiles")
        .update({
            streamer_status: "rejected",
            updated_at: new Date().toISOString(),
        })
        .eq("id", profileId);

    if (error) {
        console.error("Error rechazando creador:", error);
        return { error: GENERIC_DB_ERROR };
    }

    revalidatePath("/admin/creators");
    revalidatePath("/");
    revalidatePath("/inicio");
    return { success: true };
}

export async function featureCreatorAction(profileId: string) {
    await requireAdmin();

    if (!isValidProfileId(profileId)) return { error: "ID inválido." };

    const { data: profile, error: findError } = await supabaseAdmin
        .from("profiles")
        .select("streamer_status")
        .eq("id", profileId)
        .single();

    if (findError || !profile) {
        console.error("Error resolviendo perfil:", findError);
        return { error: GENERIC_DB_ERROR };
    }

    if (profile.streamer_status !== "approved") {
        return { error: "Solo se pueden destacar creadores aprobados." };
    }

    const { error } = await supabaseAdmin
        .from("profiles")
        .update({
            tier_level: 2,
            updated_at: new Date().toISOString(),
        })
        .eq("id", profileId);

    if (error) {
        console.error("Error destacando creador:", error);
        return { error: GENERIC_DB_ERROR };
    }

    revalidatePath("/admin/creators");
    revalidatePath("/");
    revalidatePath("/inicio");
    return { success: true };
}

export async function unfeatureCreatorAction(profileId: string) {
    await requireAdmin();

    if (!isValidProfileId(profileId)) return { error: "ID inválido." };

    const { error } = await supabaseAdmin
        .from("profiles")
        .update({
            tier_level: 1,
            updated_at: new Date().toISOString(),
        })
        .eq("id", profileId);

    if (error) {
        console.error("Error quitando destacado:", error);
        return { error: GENERIC_DB_ERROR };
    }

    revalidatePath("/admin/creators");
    revalidatePath("/");
    revalidatePath("/inicio");
    return { success: true };
}
