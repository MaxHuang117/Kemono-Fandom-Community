"use server";

// Este archivo va a contener las acciones del perfil que se ejecutan en el servidor, 
// van a utilizar en el frontend, como guardar biografía, sincronizar con Discord, obtener perfil completo, etc.
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { VIP_STYLES } from "@/config/vipStyles.config";

const supabaseAdmin = createAdminClient();

/*
|--------------------------------------------------------------------------
| Validaciones y constantes de seguridad (Fase 2 — SECURITY_AUDIT.md)
|--------------------------------------------------------------------------
*/

/** Mensaje controlado: nunca devolvemos `error.message` de Supabase al cliente (FASE2-11). */
const GENERIC_DB_ERROR = "Error interno al procesar la solicitud. Intenta de nuevo.";

const MAX_BIOGRAFIA_LENGTH = 200; // FASE2-04
const MAX_USERNAME_LENGTH = 32;   // FASE2-05
const MAX_SOCIAL_VALUE_LENGTH = 100; // FASE2-09
const MAX_BANNER_BYTES = 2 * 1024 * 1024; // FASE2-06 (2 MB)

const ALLOWED_BANNER_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const; // FASE2-06

/** Allowlist de cosméticos VIP: las claves de `VIP_STYLES` (FASE2-07). */
const ALLOWED_VIP_STYLE_IDS: ReadonlySet<string> = new Set(Object.keys(VIP_STYLES));

/** Allowlist de plataformas sociales soportadas por el render (FASE2-09). */
const ALLOWED_SOCIAL_PLATFORMS: ReadonlySet<string> = new Set(["twitch", "youtube", "x", "github"]);

/** Dominios permitidos para `avatar_url` (FASE2-05): CDN de Discord + bucket propio de Supabase. */
function getAllowedAvatarHostnames(): ReadonlySet<string> | null {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!supabaseUrl) {
        console.error("Falta NEXT_PUBLIC_SUPABASE_URL: no se puede construir el allowlist de avatares.");
        return null;
    }

    let supabaseHostname: string;
    try {
        supabaseHostname = new URL(supabaseUrl).hostname;
    } catch {
        console.error("NEXT_PUBLIC_SUPABASE_URL no es una URL válida.");
        return null;
    }

    return new Set(["cdn.discordapp.com", supabaseHostname]);
}

/**
 * FASE2-05: la URL de avatar debe ser HTTPS y provenir del CDN de Discord
 * o del proyecto Supabase propio. Rechaza protocol-relative URLs, credenciales
 * empotradas y cualquier otro origen.
 */
function esAvatarUrlSeguro(avatarUrl: string): boolean {
    if (
        typeof avatarUrl !== "string" ||
        avatarUrl.length === 0 ||
        avatarUrl.length > 2048 ||
        !avatarUrl.startsWith("https://")
    ) {
        return false;
    }

    let parsed: URL;
    try {
        parsed = new URL(avatarUrl);
    } catch {
        return false;
    }

    if (parsed.protocol !== "https:" || parsed.username || parsed.password) {
        return false;
    }

    const allowedHostnames = getAllowedAvatarHostnames();
    if (!allowedHostnames) return false;

    return allowedHostnames.has(parsed.hostname.toLowerCase());
}

/**
 * FASE2-05: el username debe respetar el alfabeto de Discord
 * (letras, dígitos, . _ -) con longitud 2-32.
 */
function esDiscordUsernameValido(discordUsername: string): boolean {
    return (
        typeof discordUsername === "string" &&
        discordUsername.trim().length >= 2 &&
        discordUsername.length <= MAX_USERNAME_LENGTH &&
        /^[\p{L}\p{N}._-]+$/u.test(discordUsername)
    );
}

/**
 * FASE2-09: normaliza un registro de redes sociales frente al allowlist de
 * plataformas. Rechaza claves no esperadas (incluidas `__proto__`/`constructor`/
 * `prototype` por no estar en el allowlist) y valores que no sean strings válidos.
 * Devuelve `null` si algún par clave/valor es inválido.
 */
function normalizarRedesSociales(
    socialLinks: Record<string, unknown> | null | undefined
): Record<string, string> | null {
    if (
        typeof socialLinks !== "object" ||
        socialLinks === null ||
        Array.isArray(socialLinks)
    ) {
        return null;
    }

    const limpias: Record<string, string> = {};

    for (const [plataforma, valor] of Object.entries(socialLinks)) {
        if (!ALLOWED_SOCIAL_PLATFORMS.has(plataforma)) {
            return null;
        }

        if (typeof valor !== "string") {
            return null;
        }

        const username = valor.trim();

        if (username.length > MAX_SOCIAL_VALUE_LENGTH) {
            return null;
        }

        if (username.length > 0) {
            limpias[plataforma] = username;
        }
    }

    return limpias;
}

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

    /* FASE2-04: validación server-side de la biografía */
    if (typeof biografia !== "string") {
        return { error: "Biografía inválida." };
    }

    const biografiaLimpia = biografia.trim();

    if (biografiaLimpia.length > MAX_BIOGRAFIA_LENGTH) {
        return { error: `La biografía no puede superar ${MAX_BIOGRAFIA_LENGTH} caracteres.` };
    }

    /* FASE2-03: resolver el perfil por `discord_id` (identidad externa), no por `id`,
       y verificar que la mutación afectó filas (`.select()` devuelve las filas actualizadas). */
    const { data: filasActualizadas, error } = await supabaseAdmin
        .from("profiles")
        .update({
            biografia: biografiaLimpia,
            updated_at: new Date().toISOString(),
        })
        .eq("discord_id", discordId)
        .select("id");

    if (error) {
        console.error("Error guardando biografía:", error);

        /* FASE2-11: detalle técnico solo en servidor; mensaje genérico al cliente */
        return {
            error: GENERIC_DB_ERROR,
        };
    }

    if (!filasActualizadas || filasActualizadas.length === 0) {
        console.error("guardarBiografiaAction: el perfil del usuario no existe para discord_id:", discordId);

        return {
            error: "No se encontró tu perfil. Vuelve a sincronizar Discord.",
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

        /* FASE2-11: detalle técnico solo en servidor */
        return {
            error: GENERIC_DB_ERROR,
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

    /* FASE2-05: validación server-side de los campos que llegan del cliente */
    if (!esDiscordUsernameValido(discordUsername)) {
        return {
            error: "Nombre de usuario de Discord inválido.",
        };
    }

    if (!esAvatarUrlSeguro(avatarUrl)) {
        return {
            error: "URL de avatar no permitida.",
        };
    }

    const discordId = session.user.discordId;
    const email = session.user.email;
    const usernameLimpio = discordUsername.trim();

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
        console.error("Error buscando perfil en sincronización:", errorBusqueda);

        /* FASE2-11 */
        return {
            error: GENERIC_DB_ERROR,
        };
    }

    /* Si ya existe → actualizar información de Discord */
    if (perfilExistente) {

        const { error } = await supabaseAdmin
            .from("profiles")
            .update({
                discord_username: usernameLimpio,
                email: email,
                avatar_url: avatarUrl,
                updated_at: new Date().toISOString(),
            })
            .eq("discord_id", discordId);

        if (error) {
            console.error("Error actualizando perfil en sincronización:", error);

            return {
                error: GENERIC_DB_ERROR,
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
            discord_username: usernameLimpio,
            email: email,
            avatar_url: avatarUrl,
            nombre_publico: usernameLimpio,
            biografia: "",
            updated_at: new Date().toISOString(),
        });

    if (error) {
        console.error("Error creando perfil en sincronización:", error);

        return {
            error: GENERIC_DB_ERROR,
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

    if (profileError) {
        console.error("Error obteniendo perfil completo:", profileError);
        return { error: GENERIC_DB_ERROR };
    }
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

        /* FASE2-09: allowlist estricta de plataformas y validación del valor */
        if (typeof providerKey !== "string" || !ALLOWED_SOCIAL_PLATFORMS.has(providerKey)) {
            return { success: false, error: "Plataforma no permitida." };
        }

        if (typeof username !== "string") {
            return { success: false, error: "Nombre de usuario inválido." };
        }

        const usernameLimpio = username.trim();

        if (usernameLimpio.length > MAX_SOCIAL_VALUE_LENGTH) {
            return { success: false, error: `El usuario no puede superar ${MAX_SOCIAL_VALUE_LENGTH} caracteres.` };
        }

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

        // 3. Fusión segura (Merge) de los datos JSON:
        //    se normaliza el estado actual frente al allowlist (descarta claves corruptas
        //    como `__proto__`) y se aplica la clave ya validada, sin computed-keys arbitrarias.
        const redesActuales = normalizarRedesSociales(
            (profile.social_links as Record<string, unknown>) || {}
        ) ?? {};

        const redesActualizadas: Record<string, string> = { ...redesActuales };

        if (usernameLimpio.length > 0) {
            redesActualizadas[providerKey] = usernameLimpio;
        } else {
            delete redesActualizadas[providerKey];
        }

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

    /* FASE2-09: rechazar claves/valores arbitrarios fuera del allowlist de plataformas */
    const redesValidadas = normalizarRedesSociales(socialLinks);

    if (redesValidadas === null) {
        return { error: "Alguna red social o su valor no es válido." };
    }

    // Verificamos el Tier por seguridad en el backend
    const { data: perfil, error: errorTier } = await supabaseAdmin
        .from("profiles")
        .select("tier_level")
        .eq("discord_id", session.user.discordId)
        .single();

    if (errorTier) {
        console.error("Error verificando tier en guardarRedesAction:", errorTier);
        return { error: GENERIC_DB_ERROR };
    }

    if (!perfil || (perfil.tier_level ?? 0) < 1) return { error: "Requiere Tier 1 o superior." };

    const { error } = await supabaseAdmin
        .from("profiles")
        .update({ social_links: redesValidadas, updated_at: new Date().toISOString() })
        .eq("discord_id", session.user.discordId);

    if (error) {
        console.error("Error guardando redes sociales:", error);
        return { error: GENERIC_DB_ERROR };
    }
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

    const file = formData.get("banner") as File | null;
    if (!file || typeof file === "string" || file.size === 0) return { error: "No se proporcionó archivo." };

    /* FASE2-06: validación de tipo MIME y tamaño máximo (2 MB) */
    if (!ALLOWED_BANNER_MIME_TYPES.includes(file.type as (typeof ALLOWED_BANNER_MIME_TYPES)[number])) {
        return { error: "Tipo de imagen no permitido. Usa JPEG, PNG o WebP." };
    }

    if (file.size > MAX_BANNER_BYTES) {
        return { error: "El banner supera el tamaño máximo de 2 MB." };
    }

    const discordId = session.user.discordId;

    // Verificamos el Tier por seguridad
    const { data: perfil, error: errorTier } = await supabaseAdmin
        .from("profiles")
        .select("tier_level")
        .eq("discord_id", discordId)
        .single();

    if (errorTier) {
        console.error("Error verificando tier en subirBannerAction:", errorTier);
        return { error: GENERIC_DB_ERROR };
    }

    if (!perfil || (perfil.tier_level ?? 0) < 1) return { error: "Requiere Tier 1 o superior." };

    /* FASE2-06: extensión derivada del MIME validado (nunca del nombre del cliente)
       y nombre aleatorio con crypto.randomUUID() en lugar de Date.now() predecible. */
    const extensionPorMime: Record<(typeof ALLOWED_BANNER_MIME_TYPES)[number], string> = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
    };

    const fileExt = extensionPorMime[file.type as (typeof ALLOWED_BANNER_MIME_TYPES)[number]];
    const fileName = `${discordId}-${crypto.randomUUID()}.${fileExt}`;

    // Subimos al bucket
    const { error: uploadError } = await supabaseAdmin.storage
        .from("user_banners")
        .upload(fileName, file, { upsert: false, contentType: file.type });

    if (uploadError) {
        console.error("Error subiendo banner a Storage:", uploadError);
        return { error: GENERIC_DB_ERROR };
    }

    const { data: { publicUrl } } = supabaseAdmin.storage.from("user_banners").getPublicUrl(fileName);

    // Actualizamos el perfil con la nueva URL
    const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({ banner_url: publicUrl })
        .eq("discord_id", discordId);

    if (updateError) {
        console.error("Error actualizando banner_url en perfil:", updateError);
        return { error: GENERIC_DB_ERROR };
    }

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

    /* FASE2-07: allowlist de estilos VIP (claves de VIP_STYLES) */
    if (typeof styleId !== "string" || !ALLOWED_VIP_STYLE_IDS.has(styleId)) {
        return { error: "Estilo de cosmético no válido." };
    }

    // Verificamos nivel de seguridad
    const { data: perfil, error: errorTier } = await supabaseAdmin
        .from("profiles")
        .select("tier_level")
        .eq("discord_id", session.user.discordId)
        .single();

    if (errorTier) {
        console.error("Error verificando tier en guardarCosmeticosVIPAction:", errorTier);
        return { error: GENERIC_DB_ERROR };
    }

    if (!perfil || (perfil.tier_level ?? 0) < 2) return { error: "Requiere Tier 2 o superior." };

    const { error } = await supabaseAdmin
        .from("profiles")
        .update({ name_color_gradient: styleId, updated_at: new Date().toISOString() })
        .eq("discord_id", session.user.discordId);

    if (error) {
        console.error("Error guardando cosméticos VIP:", error);
        return { error: GENERIC_DB_ERROR };
    }
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
            
        if (error) {
            console.error("Error al quitar reputación:", error);
            return { error: GENERIC_DB_ERROR };
        }
        return { success: true, action: "unliked" };
    } else {
        const { error } = await supabaseAdmin
            .from("profile_likes")
            .insert({ giver_id: giverId, receiver_id: receiverId });
            
        if (error) return { error: "Error al otorgar reputación." };
        return { success: true, action: "liked" };
    }
}
