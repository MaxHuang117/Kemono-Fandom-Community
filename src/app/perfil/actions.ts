"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

// CLIENTE ADMINISTRADOR: Omite el RLS de forma segura únicamente en el entorno del servidor
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Tu clave privada del archivo .env.local
);

/*
|--------------------------------------------------------------------------
| Guardar biografía
|--------------------------------------------------------------------------
*/
export async function guardarBiografiaAction(
    biografia: string
) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.discordId) {
        return { error: "No autorizado." };
    }

    const discordId = session.user.discordId;

    const { error } = await supabaseAdmin
        .from("profiles")
        .update({
            biografia: biografia,
            updated_at: new Date().toISOString(),
        })
        .eq("id", discordId);

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
    const session = await getServerSession(authOptions);

    if (!session?.user?.discordId) {
        return {
            error: "No autorizado.",
        };
    }

    const { data, error } = await supabaseAdmin
        .from("profiles")
        .select("biografia")
        .eq("discord_id", session.user.discordId)
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
*/
export async function sincronizarPerfilDiscordAction({
    discordUsername,
    avatarUrl,
}: {
    discordUsername: string;
    avatarUrl: string;
}) {

    const session = await getServerSession(authOptions);

    if (!session?.user?.discordId || !session.user.email) {
        return {
            error: "No autorizado.",
        };
    }

    const discordId = session.user.discordId;
    const email = session.user.email;

    /* Buscar perfil existente */
    const {
        data: perfilExistente,
        error: errorBusqueda,
    } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("discord_id", discordId)
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
            .eq("discord_id", discordId);

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
