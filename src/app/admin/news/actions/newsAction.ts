"use server";

import { getServerSession } from "next-auth/next";
import { createClient } from "@supabase/supabase-js";
import { getProfileByEmail } from "@/lib/services/profiles.service";
import { revalidatePath } from "next/cache";

// Usamos la clave de servicio para saltar el RLS de forma segura desde el servidor
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function saveNewsAction(formData: FormData) {
    const session = await getServerSession();
    if (!session?.user?.email) throw new Error("No autorizado");

    const { data: perfil } = await getProfileByEmail(session.user.email);
    if (!perfil?.is_admin) throw new Error("Permisos insuficientes");

    const id = formData.get("id") as string;
    const title = formData.get("title") as string;
    const description = (formData.get("description") as string) || null;
    const content = (formData.get("content") as string) || null;
    const category = (formData.get("category") as string) || null;
    const published = formData.get("published") === "true";
    let imageUrl = (formData.get("image_url") as string) || null;

    const imageFile = formData.get("imageFile") as File | null;

    // Subir imagen si existe
    if (imageFile && imageFile.size > 0) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabaseAdmin.storage
            .from("news_images")
            .upload(fileName, imageFile);
            
        if (uploadError) throw new Error("Error subiendo imagen");
        
        const { data } = supabaseAdmin.storage.from("news_images").getPublicUrl(fileName);
        imageUrl = data.publicUrl;
    }

    const payload = { title, description, content, category, published, image_url: imageUrl };

    if (id && id !== "0") {
        await supabaseAdmin.from("news").update(payload).eq("id", parseInt(id));
    } else {
        await supabaseAdmin.from("news").insert([payload]);
    }

    revalidatePath("/admin/news");
    return { success: true };
}

export async function deleteNewsAction(id: number) {
    const session = await getServerSession();
    if (!session?.user?.email) throw new Error("No autorizado");
    
    await supabaseAdmin.from("comments").delete().eq("news_id", id);
    await supabaseAdmin.from("news").delete().eq("id", id);
    
    revalidatePath("/admin/news");
    return { success: true };
}

export async function getAdminNewsAction() {
    const session = await getServerSession();
    if (!session?.user?.email) throw new Error("No autorizado");

    const { data: perfil } = await getProfileByEmail(session.user.email);
    if (!perfil?.is_admin) throw new Error("Permisos insuficientes");

    // Usa la clave maestra para traer todo saltando el RLS público
    const { data, error } = await supabaseAdmin
        .from("news")
        .select("*")
        .order("id", { ascending: false });

    if (error) throw new Error("Error al obtener noticias");
    
    return data;
}