"use server";

// Este archivo va a contener las acciones del perfil que se ejecutan en el servidor, 
// van a utilizar en el frontend, como guardar biografía, sincronizar con Discord, obtener perfil completo, etc.
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const supabaseAdmin = createAdminClient();

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

/*
|--------------------------------------------------------------------------
| Obtener perfil completo (Tiers, Redes, Slides VIP y Cosméticos)
| CON FILTRO DE SEGURIDAD PARA DOWNGRADES Y LIKES
|--------------------------------------------------------------------------
*/
export async function obtenerPerfilCompletoAction() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.discordId) return { error: "No autorizado." };

    // 1. AÑADIMOS "likes_count" al select para que el corazón funcione
    const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("id, biografia, tier_level, social_links, banner_url, name_color_gradient, likes_count")
        .eq("discord_id", session.user.discordId)
        .maybeSingle();

    if (profileError) return { error: profileError.message };
    if (!profile) return { error: "Perfil no encontrado" };

    const { data: slidesData, error: slidesError } = await supabaseAdmin
        .from("user_slides")
        .select("*")
        .eq("user_id", profile.id)
        .order("slot_number", { ascending: true });

    if (slidesError) console.error("SYS_ERR [Obtener_Slides]:", slidesError.message);

    type CustomSlide = {
        id: number;
        format: string | null;
        image_url: string | null;
        network_key: string | null;
        title: string | null;
        description: string | null;
        style_config: Record<string, unknown>;
    };

    let customSlidesParsed: CustomSlide[] = [];
    if (slidesData) {
        customSlidesParsed = slidesData.map((slide: any) => {
            const styleConfig = typeof slide.style_config === 'string'
                ? JSON.parse(slide.style_config)
                : slide.style_config;

            return {
                id: slide.slot_number,
                format: slide.format,
                image_url: slide.image_url,
                network_key: slide.target_network,
                title: slide.title,
                description: slide.description,
                style_config: styleConfig || {}
            } satisfies CustomSlide;
        });
    }

    // FILTRO DE SALIDA (DOWNGRADE)
    const currentTier = profile.tier_level ?? 0;
    
    // Si es menor a Tier 2, bloqueamos la salida de datos VIP (aunque existan guardados en la DB)
    const finalNameColorGradient = currentTier >= 2 ? profile.name_color_gradient : null;
    const finalCustomSlides = currentTier >= 2 ? customSlidesParsed : [];

    return {
        id: profile.id,
        biografia: profile.biografia ?? "",
        tier_level: currentTier,
        social_links: profile.social_links ?? {},
        banner_url: profile.banner_url ?? null,
        likes_count: profile.likes_count ?? 0,       // Enviamos los likes limpios
        name_color_gradient: finalNameColorGradient, // Datos VIP filtrados
        custom_slides: finalCustomSlides             // Slides VIP filtrados
    };
}

/*
|--------------------------------------------------------------------------
| Vincular Red Social (OAuth) - Fusión Segura
|--------------------------------------------------------------------------
*/
export async function vincularRedSocialAction(providerKey: string, username: string) {
    try {
        // 1. Verificación de seguridad central (NextAuth)
        const session = await getServerSession(authOptions);
        if (!session?.user?.discordId) {
            return { success: false, error: "No autorizado." };
        }

        const discordId = session.user.discordId;

        // 2. Obtener el estado actual de las redes sociales del usuario
        // Usamos supabaseAdmin para mantener la consistencia con el resto de tus actions
        const { data: profile, error: fetchError } = await supabaseAdmin
            .from("profiles")
            .select("social_links, tier_level")
            .eq("discord_id", discordId)
            .single();

        if (fetchError) {
            console.error("Error al obtener perfil en OAuth:", fetchError);
            return { success: false, error: "No se pudo leer el perfil para vincular la red." };
        }

        // Verificación de Tier (Opcional, pero recomendada ya que los links manuales lo piden)
        if ((profile.tier_level ?? 0) < 1) {
             return { success: false, error: "Requiere Tier 1 o superior para vincular redes." };
        }

        // 3. Fusión segura (Merge) de los datos JSON
        const redesActuales = (profile.social_links as Record<string, string>) || {};
        
        const redesActualizadas = {
            ...redesActuales,
            [providerKey]: username
        };

        // 4. Guardar el JSON actualizado en la base de datos
        const { error: updateError } = await supabaseAdmin
            .from("profiles")
            .update({ 
                social_links: redesActualizadas,
                updated_at: new Date().toISOString()
            })
            .eq("discord_id", discordId);

        if (updateError) {
            console.error("Error al actualizar redes en OAuth:", updateError);
            return { success: false, error: "Error al guardar la red vinculada en la base de datos." };
        }

        return { success: true };

    } catch (error: any) {
        console.error("Excepción en vincularRedSocialAction:", error);
        return { success: false, error: "Fallo crítico en el servidor al vincular la red." };
    }
}

/*
|--------------------------------------------------------------------------
| Guardar Redes Sociales (Tier 1+)
|--------------------------------------------------------------------------
*/
export async function guardarRedesAction(socialLinks: Record<string, string>) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.discordId) return { error: "No autorizado." };

    // Verificamos el Tier por seguridad en el backend
    const { data: perfil } = await supabaseAdmin.from("profiles").select("tier_level").eq("discord_id", session.user.discordId).single();
    if (!perfil || (perfil.tier_level ?? 0) < 1) return { error: "Requiere Tier 1 o superior." };

    const { error } = await supabaseAdmin
        .from("profiles")
        .update({ social_links: socialLinks, updated_at: new Date().toISOString() })
        .eq("discord_id", session.user.discordId);

    if (error) return { error: error.message };
    return { success: true };
}

/*
|--------------------------------------------------------------------------
| Subir Banner a Storage (Tier 1+)
|--------------------------------------------------------------------------
*/
export async function subirBannerAction(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.discordId) return { error: "No autorizado." };

    const file = formData.get("banner") as File;
    if (!file) return { error: "No se proporcionó archivo." };

    const discordId = session.user.discordId;

    // Verificamos el Tier por seguridad
    const { data: perfil } = await supabaseAdmin.from("profiles").select("tier_level").eq("discord_id", discordId).single();
    if (!perfil || (perfil.tier_level ?? 0) < 1) return { error: "Requiere Tier 1 o superior." };

    const fileExt = file.name.split('.').pop();
    const fileName = `${discordId}-${Date.now()}.${fileExt}`;

    // Subimos al bucket
    const { error: uploadError } = await supabaseAdmin.storage
        .from("user_banners")
        .upload(fileName, file, { upsert: true });

    if (uploadError) return { error: uploadError.message };

    const { data: { publicUrl } } = supabaseAdmin.storage.from("user_banners").getPublicUrl(fileName);

    // Actualizamos el perfil con la nueva URL
    await supabaseAdmin.from("profiles").update({ banner_url: publicUrl }).eq("discord_id", discordId);

    return { success: true, banner_url: publicUrl };
}

/*
|--------------------------------------------------------------------------
| Guardar Cosméticos VIP (Tier 2+)
|--------------------------------------------------------------------------
*/
export async function guardarCosmeticosVIPAction(styleId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.discordId) return { error: "No autorizado." };

    // Verificamos nivel de seguridad
    const { data: perfil } = await supabaseAdmin.from("profiles").select("tier_level").eq("discord_id", session.user.discordId).single();
    if (!perfil || (perfil.tier_level ?? 0) < 2) return { error: "Requiere Tier 2 o superior." };

    const { error } = await supabaseAdmin
        .from("profiles")
        .update({ name_color_gradient: styleId, updated_at: new Date().toISOString() })
        .eq("discord_id", session.user.discordId);

    if (error) return { error: error.message };
    return { success: true };
}

/*
|--------------------------------------------------------------------------
| Sistema de Reputación: Dar o Quitar Like al Perfil (Escudo Anti-Sybil)
|--------------------------------------------------------------------------
*/
export async function toggleProfileReputationAction(receiverId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.discordId) return { error: "Debes iniciar sesión para dar reputación." };

    const giverId = session.user.discordId;

    if (giverId === receiverId) {
        return { error: "El sistema no permite otorgarse reputación a sí mismo." };
    }

    // 🛡️ ESCUDO ANTI-SYBIL
    const { data: giverProfile } = await supabaseAdmin
        .from("profiles")
        .select("tier_level, created_at")
        .eq("discord_id", giverId)
        .single();

    if (!giverProfile) return { error: "Perfil de origen no encontrado." };

    // Matemática exacta: Si no hay created_at (raro), asume 0 días.
    const creationDate = giverProfile.created_at ? new Date(giverProfile.created_at).getTime() : new Date().getTime();
    const accountAgeDays = (new Date().getTime() - creationDate) / (1000 * 3600 * 24);
    
    const isPremium = (giverProfile.tier_level ?? 0) >= 1;

    // Bloqueo preciso
    if (!isPremium && accountAgeDays < 7) {
        return { 
            error: "⚠️ Prime Requerido: Para evitar spam, debes ser Tier 1+ o tener una cuenta con más de 7 días de antigüedad para dar likes." 
        };
    }
    // -----------------------------------------------------------

    // Conexión a base de datos usando tabla en snake_case para que funcione con Supabase
    
    const { data: existingLike } = await supabaseAdmin
        .from("profile_likes")
        .select("id")
        .match({ giver_id: giverId, receiver_id: receiverId })
        .maybeSingle(); 

    if (existingLike) {
        const { error } = await supabaseAdmin
            .from("profile_likes")
            .delete()
            .match({ giver_id: giverId, receiver_id: receiverId });
            
        if (error) return { error: error.message };
        return { success: true, action: "unliked" };
    } else {
        const { error } = await supabaseAdmin
            .from("profile_likes")
            .insert({ giver_id: giverId, receiver_id: receiverId });
            
        if (error) return { error: "Error al otorgar reputación." };
        return { success: true, action: "liked" };
    }
}
