"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin";

const supabaseAdmin = createAdminClient();

const GENERIC_DB_ERROR = "Error interno al procesar la solicitud. Intenta de nuevo.";
const MAX_TITLE_LENGTH = 120;
const MAX_SUBTITLE_LENGTH = 240;
const MAX_CTA_LABEL_LENGTH = 40;
const MAX_URL_LENGTH = 2048;

const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB

function isValidUrl(url: string): boolean {
    if (!url || url.length > MAX_URL_LENGTH) return false;
    try {
        const parsed = new URL(url);
        return parsed.protocol === "https:" || parsed.protocol === "http:";
    } catch {
        return false;
    }
}

export async function getAdminHeroSlidesAction() {
    await requireAdmin();

    const { data, error } = await supabaseAdmin
        .from("hero_slides")
        .select("*")
        .order("position", { ascending: true });

    if (error) {
        console.error("Error obteniendo hero slides:", error);
        throw new Error(GENERIC_DB_ERROR);
    }

    return data || [];
}

export async function saveHeroSlideAction(formData: FormData) {
    await requireAdmin();

    const id = formData.get("id") as string;
    const title = (formData.get("title") as string || "").trim();
    const subtitle = (formData.get("subtitle") as string || "").trim();
    const ctaLabel = (formData.get("cta_label") as string || "").trim();
    const ctaUrl = (formData.get("cta_url") as string || "").trim();
    const positionRaw = formData.get("position") as string;
    const active = formData.get("active") === "true";
    const imageFile = formData.get("imageFile") as File | null;
    const imageUrlRaw = formData.get("image_url") as string | null;

    // Validaciones
    if (!title || title.length > MAX_TITLE_LENGTH) {
        return { error: `Título requerido (máx. ${MAX_TITLE_LENGTH} caracteres).` };
    }
    if (subtitle.length > MAX_SUBTITLE_LENGTH) {
        return { error: `Subtítulo demasiado largo (máx. ${MAX_SUBTITLE_LENGTH}).` };
    }
    if (ctaLabel.length > MAX_CTA_LABEL_LENGTH) {
        return { error: `CTA demasiado largo (máx. ${MAX_CTA_LABEL_LENGTH}).` };
    }
    if (ctaUrl && !isValidUrl(ctaUrl)) {
        return { error: "URL del CTA inválida." };
    }

    const position = Number(positionRaw);
    if (!Number.isInteger(position) || position < 0) {
        return { error: "Posición inválida." };
    }

    let imageUrl = imageUrlRaw?.trim() || null;

    // Subir imagen si viene un archivo
    if (imageFile && imageFile.size > 0) {
        if (!ALLOWED_IMAGE_MIME_TYPES.includes(imageFile.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
            return { error: "Tipo de imagen no permitido. Usa JPEG, PNG o WebP." };
        }
        if (imageFile.size > MAX_IMAGE_BYTES) {
            return { error: "La imagen supera los 2 MB." };
        }

        const extensionPorMime: Record<(typeof ALLOWED_IMAGE_MIME_TYPES)[number], string> = {
            "image/jpeg": "jpg",
            "image/png": "png",
            "image/webp": "webp",
        };

        const fileExt = extensionPorMime[imageFile.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number]];
        const fileName = `hero-${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabaseAdmin.storage
            .from("hero_images")
            .upload(fileName, imageFile, { contentType: imageFile.type });

        if (uploadError) {
            console.error("Error subiendo imagen del hero:", uploadError);
            return { error: "Error subiendo la imagen. Revisa que el bucket 'hero_images' exista." };
        }

        const { data: publicUrlData } = supabaseAdmin.storage.from("hero_images").getPublicUrl(fileName);
        imageUrl = publicUrlData.publicUrl;
    }

    if (!imageUrl) {
        return { error: "Se requiere una imagen de fondo (archivo o URL)." };
    }

    const payload = {
        title,
        subtitle,
        cta_label: ctaLabel,
        cta_url: ctaUrl,
        position,
        active,
        image_url: imageUrl,
    };

    try {
        if (id && id !== "0") {
            const { error } = await supabaseAdmin
                .from("hero_slides")
                .update(payload)
                .eq("id", id);
            if (error) throw error;
        } else {
            const { error } = await supabaseAdmin.from("hero_slides").insert(payload);
            if (error) throw error;
        }

        revalidatePath("/admin/hero");
        revalidatePath("/");
        revalidatePath("/inicio");
        return { success: true };
    } catch (error: any) {
        console.error("Error guardando hero slide:", error);
        return { error: GENERIC_DB_ERROR };
    }
}

export async function deleteHeroSlideAction(id: string) {
    await requireAdmin();

    if (typeof id !== "string" || id.length === 0 || id.length > 64) {
        return { error: "ID inválido." };
    }

    try {
        const { error } = await supabaseAdmin.from("hero_slides").delete().eq("id", id);
        if (error) throw error;

        revalidatePath("/admin/hero");
        revalidatePath("/");
        revalidatePath("/inicio");
        return { success: true };
    } catch (error: any) {
        console.error("Error eliminando hero slide:", error);
        return { error: GENERIC_DB_ERROR };
    }
}
