"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasTier } from "@/lib/tier";
import type { Json } from "@/lib/supabase/database.types";
import type { SlideFormat, SlideStyleConfig } from "@/types/slides";
import { VIP_FONTS } from "@/types/slides";
import { SITE_CONFIG } from "@/config/site.config";
import { esUrlSegura } from "@/lib/url";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
};

const DEFAULT_STYLE: SlideStyleConfig = {
    textColor: "#ffffff",
    fontFamily: "font-sans",
    positionX: 50,
    positionY: 80,
    gradientTopOpacity: 0,
};

async function getAuthorizedTier2Profile() {
    const session = await getServerSession(authOptions);
    const discordId = session?.user?.discordId;

    if (!discordId) {
        return { profile: null, error: "Debes iniciar sesión para gestionar tus slides." };
    }

    const supabase = createAdminClient();
    const { data: profile, error } = await supabase
        .from("profiles")
        .select("id, tier_level")
        .eq("discord_id", discordId)
        .single();

    if (error || !profile) {
        return { profile: null, error: "No se pudo verificar tu perfil." };
    }

    if (!hasTier(profile.tier_level, 2)) {
        return { profile: null, error: "Requiere el nivel Creador destacado (2) o superior." };
    }

    return { profile, error: null };
}

function getText(formData: FormData, key: string): string {
    const value = formData.get(key);
    return typeof value === "string" ? value : "";
}

function parseStyleConfig(rawValue: string): SlideStyleConfig | null {
    if (!rawValue) return DEFAULT_STYLE;

    try {
        const value: unknown = JSON.parse(rawValue);
        if (!value || typeof value !== "object") return null;

        const config = value as Record<string, unknown>;
        const validColor = (color: unknown) =>
            typeof color === "string" && /^#[\da-f]{6}$/i.test(color);
        const validOpacity = (opacity: unknown) =>
            typeof opacity === "number" && opacity >= 0 && opacity <= 1;

        if (
            !validColor(config.textColor) ||
            typeof config.fontFamily !== "string" ||
            !VIP_FONTS.some(({ id }) => id === config.fontFamily) ||
            typeof config.positionX !== "number" || config.positionX < 0 || config.positionX > 100 ||
            typeof config.positionY !== "number" || config.positionY < 0 || config.positionY > 100 ||
            !validOpacity(config.gradientTopOpacity) ||
            (config.gradientBottomOpacity !== undefined && !validOpacity(config.gradientBottomOpacity)) ||
            (config.backgroundColor !== undefined && !validColor(config.backgroundColor))
        ) {
            return null;
        }

        return config as unknown as SlideStyleConfig;
    } catch {
        return null;
    }
}

/**
 * Valida un enlace libre de slide (Fase 3). Solo acepta http/https, sin
 * credenciales empotradas, con longitud máxima de 2048. Rechaza esquemas
 * peligrosos como `javascript:` o `data:`. Devuelve la URL recortada o null.
 */
function validarLinkUrl(raw: string): string | null {
    if (typeof raw !== "string") return null;
    const url = raw.trim();
    if (!url || url.length > 2048) return null;
    return esUrlSegura(url) ? url : null;
}

export async function guardarSlideAction(formData: FormData) {
    const slideId = Number(getText(formData, "slideId"));
    const format = getText(formData, "format");
    const linkUrlRaw = getText(formData, "linkUrl");
    const title = getText(formData, "title").trim();
    const description = getText(formData, "description").trim();
    const styleConfig = parseStyleConfig(getText(formData, "styleConfig"));
    const imageValue = formData.get("image");
    const imageFile = imageValue instanceof File && imageValue.size > 0 ? imageValue : null;

    if (!Number.isInteger(slideId) || slideId < 1 || slideId > SITE_CONFIG.slides.maxSlides) {
        return { success: false, error: "El slot del slide no es válido." };
    }
    if (format !== "A" && format !== "B") {
        return { success: false, error: "El formato del slide no es válido." };
    }

    const linkUrl = validarLinkUrl(linkUrlRaw);
    if (!linkUrl) {
        return { success: false, error: "El enlace del slide debe ser una URL http:// o https:// válida." };
    }

    if (!title || title.length > SITE_CONFIG.slides.titleMax || (format === "B" && description.length > SITE_CONFIG.slides.descriptionMax)) {
        return { success: false, error: "Revisa los datos del slide antes de guardarlo." };
    }
    if (!styleConfig) {
        return { success: false, error: "La configuración visual del slide no es válida." };
    }
    if (imageFile && (!ALLOWED_IMAGE_TYPES[imageFile.type] || imageFile.size > MAX_IMAGE_SIZE)) {
        return { success: false, error: "La imagen debe ser JPG, PNG o WEBP y no superar 2MB." };
    }

    try {
        const { profile, error: authorizationError } = await getAuthorizedTier2Profile();
        if (!profile) return { success: false, error: authorizationError };

        const supabase = createAdminClient();
        const { data: existingSlide, error: existingSlideError } = await supabase
            .from("user_slides")
            .select("image_url")
            .eq("user_id", profile.id)
            .eq("slot_number", slideId)
            .maybeSingle();

        if (existingSlideError) throw existingSlideError;

        let imageUrlToSave = existingSlide?.image_url ?? null;
        if (imageFile) {
            const extension = ALLOWED_IMAGE_TYPES[imageFile.type];
            const filePath = `${profile.id}/slide_${slideId}.${extension}`;
            const { error: uploadError } = await supabase.storage
                .from("user_slides")
                .upload(filePath, imageFile, { upsert: true, cacheControl: "3600" });

            if (uploadError) throw uploadError;

            const { data: publicUrlData } = supabase.storage
                .from("user_slides")
                .getPublicUrl(filePath);
            imageUrlToSave = `${publicUrlData.publicUrl}?t=${Date.now()}`;
        }

        if (!imageUrlToSave) {
            return { success: false, error: "Es obligatorio subir una imagen." };
        }

        const { error: saveError } = await supabase
            .from("user_slides")
            .upsert(
                {
                    user_id: profile.id,
                    slot_number: slideId,
                    format: format as SlideFormat,
                    image_url: imageUrlToSave,
                    link_url: linkUrl,
                    title,
                    description: format === "B" ? description : null,
                    style_config: styleConfig as unknown as Json,
                },
                { onConflict: "user_id, slot_number" },
            );

        if (saveError) throw saveError;

        return { success: true, message: "Slide sincronizado correctamente." };
    } catch (error) {
        console.error("SYS_ERR [Tier2_Slide]:", error);
        return { success: false, error: "Fallo en la conexión segura." };
    }
}

export async function eliminarSlideAction(slotId: number) {
    if (!Number.isInteger(slotId) || slotId < 1 || slotId > 3) {
        return { success: false, error: "El slot del slide no es válido." };
    }

    try {
        const { profile, error: authorizationError } = await getAuthorizedTier2Profile();
        if (!profile) return { success: false, error: authorizationError };

        const supabase = createAdminClient();
        const { data: slide, error: slideError } = await supabase
            .from("user_slides")
            .select("image_url")
            .eq("user_id", profile.id)
            .eq("slot_number", slotId)
            .maybeSingle();

        if (slideError) throw slideError;

        const { error: deleteError } = await supabase
            .from("user_slides")
            .delete()
            .match({ user_id: profile.id, slot_number: slotId });

        if (deleteError) throw deleteError;

        if (slide?.image_url) {
            try {
                const imagePath = new URL(slide.image_url).pathname.split("/user_slides/")[1];
                if (imagePath?.startsWith(`${profile.id}/`)) {
                    const { error: removeError } = await supabase.storage
                        .from("user_slides")
                        .remove([decodeURIComponent(imagePath)]);

                    if (removeError) console.error("SYS_ERR [Slide_Storage_Delete]:", removeError);
                }
            } catch (error) {
                console.error("SYS_ERR [Slide_Storage_Path]:", error);
            }
        }

        const { error: reorderError } = await supabase.rpc("reorder_slides_after_delete", {
            p_user_id: profile.id,
            p_deleted_slot: slotId,
        });

        if (reorderError) {
            console.error("SYS_ERR [Reorder_Slides]:", reorderError);
            // Fase 3 (B3): no ocultar el fallo de reorden; informar al cliente
            // en lugar de devolver un éxito falso que deja los slots desincronizados.
            return { success: false, error: "Fallo al reordenar los slides." };
        }

        return { success: true, message: "Slide eliminado correctamente." };
    } catch (error) {
        console.error("SYS_ERR [Delete_Slide]:", error);
        return { success: false, error: "Fallo al eliminar el slide." };
    }
}
