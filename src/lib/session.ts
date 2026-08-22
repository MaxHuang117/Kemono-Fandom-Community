import "server-only";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase/admin";

/*
|--------------------------------------------------------------------------
| Identidad canónica
|--------------------------------------------------------------------------
| El perfil se identifica siempre por `profiles.id`, que coincide con el
| ID de Discord de la sesión. Todas las acciones del servidor deben usar
| este helper en lugar de resolver el perfil por email o por discord_id.
|--------------------------------------------------------------------------
*/

export interface SessionProfile {
    id: string;
    email: string;
    isAdmin: boolean;
}

export async function getSessionProfile(): Promise<SessionProfile | null> {
    const session = await getServerSession(authOptions);

    const discordId = session?.user?.discordId;

    if (!discordId) {
        return null;
    }

    const { data, error } = await getAdminClient()
        .from("profiles")
        .select("id, email, is_admin")
        .eq("id", discordId)
        .maybeSingle();

    if (error) {
        console.error("Error obteniendo perfil de la sesión:", error);

        return null;
    }

    if (!data) {
        return null;
    }

    return {
        id: data.id,
        email: data.email,
        isAdmin: data.is_admin,
    };
}
