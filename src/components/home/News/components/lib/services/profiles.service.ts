import { getAdminClient } from "@/lib/supabase/admin";

/*
|--------------------------------------------------------------------------
| Obtener perfil por ID
|--------------------------------------------------------------------------
*/

export async function getProfileById(
    userId: string,
) {

    return await getAdminClient()
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