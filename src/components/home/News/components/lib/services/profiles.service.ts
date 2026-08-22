import { createAdminClient } from "@/lib/supabase/admin";

const supabaseAdmin = createAdminClient();

/*
|--------------------------------------------------------------------------
| Obtener perfil por email
|--------------------------------------------------------------------------
*/

export async function getProfileByEmail(
    email: string,
) {

    return await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("email", email)
        .single();

}

/*
|--------------------------------------------------------------------------
| Obtener perfil por ID
|--------------------------------------------------------------------------
*/

export async function getProfileById(
    userId: string,
) {

    return await supabaseAdmin
        .from("profiles")
        .select(`
            id,
            nombre_publico,
            discord_username,
            avatar_url,
            banner_url,
            biografia
        `)
        .eq("id", userId)
        .single();

}