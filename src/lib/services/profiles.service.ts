import { createAdminClient } from "@/lib/supabase/admin";

const supabaseAdmin = createAdminClient();

/*
|--------------------------------------------------------------------------
| Obtener perfil por email
|--------------------------------------------------------------------------
*/
export async function getProfileByEmail(email: string) {
    return await supabaseAdmin
        .from("profiles")
        .select("id, is_admin")
        .eq("email", email)
        .single();
}

/*
|--------------------------------------------------------------------------
| Obtener perfil por ID
|--------------------------------------------------------------------------
*/
export async function getProfileById(userId: string) {
    return await supabaseAdmin
        .from("profiles")
        .select(`
            id,
            nombre_publico,
            discord_username,
            avatar_url,
            banner_url,
            biografia,
            tier_level,
            social_links,
            likes_count,
            name_color_gradient,
            custom_badge,
            allow_gifs,
            custom_slides
        `)
        .eq("id", userId)
        .single();
}