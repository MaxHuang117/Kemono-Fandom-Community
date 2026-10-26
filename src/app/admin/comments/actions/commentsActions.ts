"use server";

import { getServerSession } from "next-auth/next";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// Cliente con permisos de superusuario (Service Role)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Middleware interno de seguridad
async function verifyAdminAccess() {
    const session = await getServerSession();
    if (!session?.user?.email) throw new Error("SYSTEM_ERR: No session detected.");

    // Validar rol de admin en la BD
    const { data: adminProfile } = await supabaseAdmin
        .from("profiles")
        .select("is_admin")
        .eq("email", session.user.email)
        .single();

    if (!adminProfile?.is_admin) throw new Error("SECURITY_BREACH: Access Denied.");
}

export async function getAdminCommentsAction() {
    await verifyAdminAccess();

    // Traemos todos los comentarios sin restricciones
    const { data, error } = await supabaseAdmin
        .from("comments")
        .select("id, message, created_at, news_id, user_id")
        .order("created_at", { ascending: false });

    if (error) throw new Error("Error fetching comments from DB");
    return data;
}

export async function deleteCommentAction(commentId: string) {
    await verifyAdminAccess();

    // 1. Purgar dependencias (likes) primero para evitar errores de llave foránea
    await supabaseAdmin.from("comment_likes").delete().eq("comment_id", commentId);
    
    // 2. Purgar el comentario
    const { error } = await supabaseAdmin.from("comments").delete().eq("id", commentId);
    
    if (error) throw new Error("DB_ERR: Error al eliminar el comentario");

    revalidatePath("/admin/comments");
    return { success: true };
}