import "server-only";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Guarda de autorización de administrador (Fase 2).
 *
 * La identidad se obtiene desde `getServerSession(authOptions)` → `session.user.discordId`
 * (nunca desde `email`). El rol se consulta en `profiles.is_admin` resolviendo el perfil
 * por `discord_id`. Lanza `Error` si no hay sesión o el perfil no es administrador.
 */
export async function requireAdmin(): Promise<{ id: string; is_admin: boolean }> {
    const session = await getServerSession(authOptions);
    const discordId = session?.user?.discordId;

    if (!discordId) {
        throw new Error("SECURITY_BREACH: No se pudo resolver la sesión de administrador.");
    }

    const supabase = createAdminClient();
    const { data: profile, error } = await supabase
        .from("profiles")
        .select("id, is_admin")
        .eq("discord_id", discordId)
        .maybeSingle();

    if (error || !profile) {
        throw new Error("SECURITY_BREACH: Perfil de administrador no encontrado.");
    }

    if (!profile.is_admin) {
        throw new Error("SECURITY_BREACH: Acceso denegado. Se requieren privilegios de administrador.");
    }

    return profile;
}
