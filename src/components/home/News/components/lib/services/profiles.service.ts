import { createClient } from "@supabase/supabase-js";

/*
|--------------------------------------------------------------------------
| Cliente administrador
|--------------------------------------------------------------------------
*/

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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