"use server";

import { createAdminClient } from "@/lib/supabase/admin";

const supabaseAdmin = createAdminClient();

export interface CreatorProfile {
    id: string;
    discord_id: string;
    discord_username: string | null;
    nombre_publico: string | null;
    avatar_url: string | null;
    banner_url: string | null;
    biografia: string | null;
    tier_level: number;
    likes_count: number;
    is_online: boolean;
    streamer_category: string | null;
    tags: string[] | null;
    name_color_gradient: string | null;
}

export async function obtenerCreadoresAction(): Promise<{ success: true; data: CreatorProfile[] } | { success: false; error: string }> {
    try {
        const { data, error } = await supabaseAdmin
            .from("profiles")
            .select("id, discord_id, discord_username, nombre_publico, avatar_url, banner_url, biografia, tier_level, likes_count, is_online, streamer_category, tags, name_color_gradient")
            .eq("streamer_status", "approved")
            .order("likes_count", { ascending: false });

        if (error) throw error;

        return { success: true, data: (data || []) as CreatorProfile[] };
    } catch (error: any) {
        console.error("SYS_ERR [Creadores]:", error.message || error);
        return { success: false, error: "Error al cargar creadores." };
    }
}
