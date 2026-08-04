"use server";

import { getServerSession } from "next-auth/next";
import { validateComment } from "../../lib/validators/commentValidator";
import {
    getProfileByEmail,
    getProfileById,
} from "../../lib/services/profiles.service";
import {
    createComment,
    deleteComment,
    updateComment,
    assertCommentOwner,
} from "../../lib/services/comments.service";

export async function publicarComentarioAction(
    newsId: number,
    message: string
) {
    const validation = validateComment(message);

    if (!validation.valid) {

        return {

            error: validation.error,

        };

    }

    // 1. Validamos la sesión desde el Servidor
    const session = await getServerSession();
    
    if (!session?.user?.email) {
        return { error: "No autorizado" };
    }

    try {
        // 2. Buscamos el perfil del usuario usando su email desde la sesión
        const { data: perfil, error: errorPerfil } =
        await getProfileByEmail(session.user.email);

        if (errorPerfil || !perfil) {
            return { error: "Perfil de usuario no encontrado" };
        }

        // 3. Insertamos el comentario con permisos de administrador
        const { error } = await createComment(
            newsId,
            perfil.id,
            message.trim(),
        );

        if (error) {
            return {
                error: error.message,
            };
        }

        return { success: true };

    } catch {
        return { error: "Error interno del servidor" };
    }
}

export async function eliminarComentarioAction(
    commentId: string
) {
    const session = await getServerSession();
    // 1. Validamos la sesión desde el Servidor
    if (!session?.user?.email) {

        return {

            error: "No autorizado.",

        };

    }

    try {
        // 2. Obtenemos el perfil del usuario usando su email desde la sesión
        const { data: perfil, error: errorPerfil } =
            await getProfileByEmail(session.user.email);

        if (errorPerfil) {

            console.error(errorPerfil);

        }

        if (!perfil) {

            return {

                error: "Perfil de usuario no encontrado.",

            };

        }

        const owner =
            await assertCommentOwner(

                commentId,
                perfil.id,

            );
            // 3. Verificamos que el comentario pertenezca al usuario autenticado
        if (!owner.success) {

            return {

                error: owner.error,

            };

        }
        // 4. Eliminamos el comentario con permisos de administrador
        const { error } =
            await deleteComment(commentId);

        if (error) {

            return {

                error: error.message,

            };

        }

        return {

            success: true,

        };

    } catch {

        return {

            error: "Error interno del servidor.",

        };

    }
}

export async function editarComentarioAction(

    commentId: string,
    message: string,

) {

    /*
    |--------------------------------------------------------------------------
    | Validar comentario
    |--------------------------------------------------------------------------
    */

    const validation = validateComment(message);

    if (!validation.valid) {

        return {

            error: validation.error,

        };

    }

    /*
    |--------------------------------------------------------------------------
    | Validar sesión
    |--------------------------------------------------------------------------
    */

    const session = await getServerSession();

    if (!session?.user?.email) {

        return {

            error: "No autorizado.",

        };

    }

    try {

        /*
        |--------------------------------------------------------------------------
        | Obtener perfil
        |--------------------------------------------------------------------------
        */

        const {

            data: perfil,
            error: errorPerfil,

        } = await getProfileByEmail(session.user.email);

        if (errorPerfil || !perfil) {

            return {

                error: "Perfil no encontrado.",

            };

        }

        /*
        |--------------------------------------------------------------------------
        | Verificar propietario
        |--------------------------------------------------------------------------
        */

        const owner = await assertCommentOwner(

            commentId,
            perfil.id,

        );

        if (!owner.success) {

            return {

                error: owner.error,

            };

        }

        /*
        |--------------------------------------------------------------------------
        | Actualizar comentario
        |--------------------------------------------------------------------------
        */

        const { error } = await updateComment(

            commentId,
            message.trim(),

        );

        if (error) {

            return {

                error: error.message,

            };

        }

        return {

            success: true,

        };

    } catch {

        return {

            error: "Error interno del servidor.",

        };

    }

}

export async function obtenerPerfilAction(
    userId: string,
) {

    return await getProfileById(userId);

}