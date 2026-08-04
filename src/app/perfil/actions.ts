"use server";

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
    discord_id: string,
    biografia: string
) {
    // Aquí puedes seguir usando supabaseAdmin si no quieres depender de políticas complejas en el servidor
    const { error } = await supabaseAdmin
        .from("profiles")
        .update({
            biografia: biografia,
            updated_at: new Date().toISOString(),
        })
        .eq("id", discord_id);

    if (error) return { error };
    return { success: true };
}

/*
|--------------------------------------------------------------------------
| Sincronizar perfil de Discord
|--------------------------------------------------------------------------
*/
export async function sincronizarPerfilDiscordAction({
    discordId,
    discordUsername,
    email,
    avatarUrl,
    bannerUrl,
}: {
    discordId: string;
    discordUsername: string;
    email: string;
    avatarUrl: string;
    bannerUrl: string | null;
}) {

    /* Buscar perfil existente */
    const { data: perfilExistente, error: errorBusqueda } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("discord_id", discordId)
        .maybeSingle();

    if (errorBusqueda) return { error: errorBusqueda };

    /* Si ya existe → actualizar información de Discord */
    if (perfilExistente) {
        const { error } = await supabaseAdmin
            .from("profiles")
            .update({
                discord_username: discordUsername,
                email: email,
                avatar_url: avatarUrl,
                banner_url: bannerUrl,
                updated_at: new Date().toISOString(),
            })
            .eq("discord_id", discordId);

        if (error) return { error };

        return { success: true, created: false };
    }

    /* Si no existe → crear perfil (Omitiendo RLS con service_role) */
    const { error } = await supabaseAdmin
        .from("profiles")
        .insert({
            id: discordId,
            discord_id: discordId,
            discord_username: discordUsername,
            email: email,
            avatar_url: avatarUrl,
            banner_url: bannerUrl,
            nombre_publico: discordUsername,
            biografia: "",
            updated_at: new Date().toISOString(),
        });

    if (error) return { error };

    return { success: true, created: true };
}
