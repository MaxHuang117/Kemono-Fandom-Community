"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProfileByDiscordId } from "@/lib/services/profiles.service";
import { mapLike } from "../../lib/mappers/likeMapper";

const supabaseAdmin = createAdminClient();

interface LikeProfile {

    nombre_publico: string | null;

    avatar_url: string | null;

    discord_username: string | null;

}

interface LikeRow {

    user_id: string;

    created_at: string | null;

    profiles: LikeProfile | LikeProfile[] | null;

}

export async function obtenerLikes(commentId: string) {

    const { data, error } = await supabaseAdmin
        .from("comment_likes")
        .select(`
            user_id,
            created_at,
            profiles!fk_comment_like_user(
                nombre_publico,
                avatar_url,
                discord_username
            )
        `)
        .eq("comment_id", commentId)
        .order("created_at", {
            ascending: false,
        });

    if (error) {
        console.error("Error obteniendo likes:", error);
    }

    const likes = (data ?? []).map((item: LikeRow) => {
        // profiles comes back as an array from the foreign key join; mapLike expects a single profile or null
        const profile = Array.isArray(item.profiles)
            ? item.profiles[0] ?? null
            : item.profiles;

        return mapLike({
            ...item,
            created_at: item.created_at ?? new Date(0).toISOString(),
            profiles: profile,
        });

    });

    return {
        likes,
        error,
    };

}

export async function darLike(commentId: string) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.discordId) {
        return { error: new Error("No autorizado") };
    }

    // Resolvemos el perfil por discord_id y usamos profiles.id para las relaciones.
    const { data: perfil, error: perfilError } =
        await getProfileByDiscordId(session.user.discordId);

    if (perfilError || !perfil) {
        console.error("Error resolviendo perfil para like:", perfilError);
        return { error: new Error("Perfil no encontrado") };
    }

    const { error } = await supabaseAdmin
        .from("comment_likes")
        .insert({
            comment_id: commentId,
            user_id: perfil.id,
        });

    if (error) {
        console.error("LIKES ERROR:", error);
        return { error: new Error("Error al dar like") };
    }

    return { error: null };
}

export async function quitarLike(commentId: string) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.discordId) {
        return { error: new Error("No autorizado") };
    }

    // Resolvemos el perfil por discord_id y usamos profiles.id para las relaciones.
    const { data: perfil, error: perfilError } =
        await getProfileByDiscordId(session.user.discordId);

    if (perfilError || !perfil) {
        console.error("Error resolviendo perfil para quitar like:", perfilError);
        return { error: new Error("Perfil no encontrado") };
    }

    const { error } = await supabaseAdmin
        .from("comment_likes")
        .delete()
        .eq("comment_id", commentId)
        .eq("user_id", perfil.id);

    if (error) {
        console.error("LIKE DELETE ERROR:", error);
        return { error: new Error("Error al quitar like") };
    }

    return { error: null };
}
