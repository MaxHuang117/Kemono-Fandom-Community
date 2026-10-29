// src/actions/publicProfile.action.ts
"use server";

import { createPublicClient } from "@/lib/supabase/public";

const supabasePublic = createPublicClient();

// Whitelist estricta del identificador de ruta /u/:id
// (Next.js ya decodifica params.id; no volver a decodificar — FASE2-12).
const MAX_IDENTIFIER_LENGTH = 32;
const SNOWFLAKE_PATTERN = /^[0-9]{1,20}$/;          // Discord ID numérico
const USERNAME_PATTERN = /^[a-z0-9._-]{1,32}$/i;    // Alfabeto válido de Discord

export async function obtenerPerfilPublicoAction(identifier: string) {
    if (
        typeof identifier !== "string" ||
        identifier.length === 0 ||
        identifier.length > MAX_IDENTIFIER_LENGTH
    ) {
        return { success: false, error: "ID de nodo no válido." };
    }

    try {
        // 1. Separar los casos de búsqueda y pasar el valor como parámetro
        // (Supabase escapa el valor; nunca interpolar en cadenas de filtro — FASE2-02).
        let query = supabasePublic
            .from("profiles")
            .select("id, discord_username, biografia, tier_level, social_links, banner_url, name_color_gradient, likes_count, avatar_url, discord_id");

        if (SNOWFLAKE_PATTERN.test(identifier)) {
            // Identificador numérico → buscar por discord_id.
            query = query.eq("discord_id", identifier);
        } else if (USERNAME_PATTERN.test(identifier)) {
            // Identificador de usuario → buscar por discord_username.
            query = query.eq("discord_username", identifier);
        } else {
            // Caracteres fuera de la whitelist ( % , ( ) y comodines incl. )
            return { success: false, error: "ID de nodo no válido." };
        }

        // maybeSingle evita que el servidor colapse si hay más de una fila
        const { data: profile, error } = await query.maybeSingle();

        if (error) {
            throw error;
        }

        // Si maybeSingle no encuentra nada, devuelve null limpiamente (Genera el 404 correcto)
        if (!profile) {
            return { success: false, error: "Perfil no encontrado." };
        }

        // 2. Lógica de Slides VIP
        let customSlidesParsed: any[] = [];
        const currentTier = profile.tier_level ?? 0;

        if (currentTier >= 2) {
            const { data: slidesData, error: slidesError } = await supabasePublic
                .from("user_slides")
                .select("*")
                .eq("user_id", profile.id)
                .order("slot_number", { ascending: true });

            if (!slidesError && slidesData) {
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
                    };
                });
            }
        }

        // 3. Filtro de Seguridad (Downgrade)
        const finalNameColorGradient = currentTier >= 2 ? profile.name_color_gradient : null;
        
        // 4. Formateamos los datos para tu página y modal
        const finalData = {
            id: profile.id, 
            discord: profile.discord_id, 
            username: profile.discord_username,
            discord_username: profile.discord_username,
            avatar: profile.avatar_url,
            avatar_url: profile.avatar_url,
            biografia: profile.biografia ?? "",
            tier_level: currentTier,
            social_links: profile.social_links ?? {},
            banner_url: profile.banner_url ?? null,
            likes_count: profile.likes_count ?? 0,
            name_color_gradient: finalNameColorGradient,
            custom_slides: customSlidesParsed
        };

        return { success: true, data: finalData };

    } catch (error: any) {
        console.error("SYS_ERR [PublicProfile]:", error.message || error);
        return { success: false, error: "Fallo al establecer conexión con el nodo del usuario." };
    }
}