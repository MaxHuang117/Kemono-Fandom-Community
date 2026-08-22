"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getSessionProfile } from "@/lib/session";
import { getAdminClient } from "@/lib/supabase/admin";

/*
|--------------------------------------------------------------------------
| Guardar biografía
|--------------------------------------------------------------------------
*/
export async function guardarBiografiaAction(
    biografia: string
) {
    const perfil = await getSessionProfile();

    if (!perfil) {
        return { error: "No autorizado." };
    }

    const { error } = await getAdminClient()
        .from("profiles")
        .update({
            biografia: biografia,
            updated_at: new Date().toISOString(),
        })
        .eq("id", perfil.id);

    if (error) {
        console.error("Error guardando biografía:", error);

        return {
            error: error.message,
        };
    }

    return {
        success: true,
    };
}

/*
|--------------------------------------------------------------------------
| Obtener biografía
|--------------------------------------------------------------------------
*/

export async function obtenerBiografiaAction() {
    const perfil = await getSessionProfile();

    if (!perfil) {
        return {
            error: "No autorizado.",
        };
    }

    const { data, error } = await getAdminClient()
        .from("profiles")
        .select("biografia")
        .eq("id", perfil.id)
        .maybeSingle();

    if (error) {
        console.error("Error obteniendo biografía:", error);

        return {
            error: error.message,
        };
    }

    return {
        biografia: data?.biografia ?? "",
    };
}

/*
|--------------------------------------------------------------------------
| Sincronizar perfil de Discord
|--------------------------------------------------------------------------
| El nombre y el avatar se toman de la sesión emitida por NextAuth, nunca
| de datos enviados por el cliente.
|--------------------------------------------------------------------------
*/
export async function sincronizarPerfilDiscordAction() {
    const session = await getServerSession(authOptions);

    const discordId = session?.user?.discordId;
    const email = session?.user?.email;

    if (!discordId || !email) {
        return {
            error: "No autorizado.",
        };
    }

    const discordUsername = session.user.name ?? "Usuario";

    const avatarUrl =
        session.user.image ??
        "https://cdn.discordapp.com/embed/avatars/0.png";

    const supabaseAdmin = getAdminClient();

    /* Buscar perfil existente */
    const {
        data: perfilExistente,
        error: errorBusqueda,
    } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("id", discordId)
        .maybeSingle();

    if (errorBusqueda) {
        return {
            error: errorBusqueda.message,
        };
    }

    /* Si ya existe → actualizar información de Discord */
    if (perfilExistente) {

        const { error } = await supabaseAdmin
            .from("profiles")
            .update({
                discord_username: discordUsername,
                email: email,
                avatar_url: avatarUrl,
                updated_at: new Date().toISOString(),
            })
            .eq("id", discordId);

        if (error) {
            return {
                error: error.message,
            };
        }

        return {
            success: true,
            created: false,
        };
    }

    /* Si no existe → crear perfil */
    const { error } = await supabaseAdmin
        .from("profiles")
        .insert({
            id: discordId,
            discord_id: discordId,
            discord_username: discordUsername,
            email: email,
            avatar_url: avatarUrl,
            nombre_publico: discordUsername,
            biografia: "",
            updated_at: new Date().toISOString(),
        });

    if (error) {
        return {
            error: error.message,
        };
    }

    return {
        success: true,
        created: true,
    };
}
