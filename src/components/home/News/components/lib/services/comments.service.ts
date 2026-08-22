import { createAdminClient } from "@/lib/supabase/admin";

/*
|--------------------------------------------------------------------------
| Tipos
|--------------------------------------------------------------------------
*/

export interface CommentOwnerResult {

    success: boolean;

    error?: string;

}

const supabaseAdmin = createAdminClient();

/*
|--------------------------------------------------------------------------
| Crear comentario
|--------------------------------------------------------------------------
*/

export async function createComment(

    newsId: number,
    userId: string,
    message: string,

) {

    return await supabaseAdmin
        .from("comments")
        .insert({

            news_id: newsId,
            user_id: userId,
            message,

        });

}

/*
|--------------------------------------------------------------------------
| Obtener comentario por ID
|--------------------------------------------------------------------------
*/

export async function getCommentById(
    commentId: string,
) {

    return await supabaseAdmin
        .from("comments")
        .select("*")
        .eq("id", commentId)
        .single();

}

/*
|--------------------------------------------------------------------------
| Obtener comentarios de una noticia
|--------------------------------------------------------------------------
*/

export async function getCommentsByNewsId(
    newsId: number,
) {

    return await supabaseAdmin
        .from("comments")
        .select(`
            id,
            news_id,
            user_id,
            message,
            created_at,
            profiles (
                nombre_publico,
                avatar_url,
                banner_url,
                discord_username,
                biografia
            )
        `)
        .eq("news_id", newsId)
        .order("created_at", {
            ascending: false,
        });

}

/*
|--------------------------------------------------------------------------
| Eliminar comentario
|--------------------------------------------------------------------------
*/

export async function deleteComment(
    commentId: string,
) {

    return await supabaseAdmin
        .from("comments")
        .delete()
        .eq("id", commentId);

}

/*
|--------------------------------------------------------------------------
| Actualizar comentario
|--------------------------------------------------------------------------
*/

export async function updateComment(

    commentId: string,
    message: string,

) {

    return await supabaseAdmin
        .from("comments")
        .update({

            message,

        })
        .eq("id", commentId);

}

/*
|--------------------------------------------------------------------------
| Verificar propietario del comentario
|--------------------------------------------------------------------------
*/

export async function assertCommentOwner(

    commentId: string,
    userId: string,

): Promise<CommentOwnerResult> {

    const { data: comment, error } =
        await getCommentById(commentId);

    if (error || !comment) {

        return {

            success: false,

            error: "Comentario no encontrado.",

        };

    }

    if (comment.user_id !== userId) {

        return {

            success: false,

            error: "No tienes permiso para modificar este comentario.",

        };

    }

    return {

        success: true,

    };

}