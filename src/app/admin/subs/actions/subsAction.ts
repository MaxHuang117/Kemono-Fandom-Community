"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";

// Cliente Admin: Solo se usa EN EL SERVIDOR.
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getUsersListAction() {
    await requireAdmin();

    const { data, error } = await supabaseAdmin
        .from("profiles")
        .select("id, nombre_publico, discord_username, email, tier_level, sub_expires_at, avatar_url")
        .order("tier_level", { ascending: false });

    if (error) throw new Error("Error extrayendo base de usuarios.");
    return data;
}

export async function updateUserTierAction(targetUserId: string, newTier: number, expiresAt: string | null) {
    await requireAdmin();

    // Validación estricta para evitar inyección de tiers falsos
    if (newTier < 0 || newTier > 3) {
        throw new Error("DATA_ERR: Nivel de Tier inválido.");
    }

    const { error } = await supabaseAdmin
        .from("profiles")
        .update({
            tier_level: newTier,
            sub_expires_at: expiresAt
        })
        .eq("id", targetUserId);

    if (error) throw new Error("DB_ERR: Fallo al actualizar el Tier del usuario.");

    revalidatePath("/admin/subs");
    return { success: true };
}