"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";

// Cliente con permisos de superusuario (Service Role)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getAdminCommentsAction() {
    await requireAdmin();

    // Traemos todos los comentarios sin restricciones
    const { data, error } = await supabaseAdmin
        .from("comments")
        .select("id, message, created_at, news_id, user_id")
        .order("created_at", { ascending: false });

    if (error) throw new Error("Error fetching comments from DB");
    return data;
}

export async function deleteCommentAction(commentId: string) {
    await requireAdmin();

    // 1. Purgar dependencias (likes) primero para evitar errores de llave foránea
    await supabaseAdmin.from("comment_likes").delete().eq("comment_id", commentId);
    
    // 2. Purgar el comentario
    const { error } = await supabaseAdmin.from("comments").delete().eq("id", commentId);
    
    if (error) throw new Error("DB_ERR: Error al eliminar el comentario");

    revalidatePath("/admin/comments");
    return { success: true };
}