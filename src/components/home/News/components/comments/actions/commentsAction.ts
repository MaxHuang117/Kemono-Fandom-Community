"use server";

import { getSessionProfile } from "@/lib/session";
import { validateComment } from "../../lib/validators/commentValidator";
import { getProfileById } from "../../lib/services/profiles.service";
import {
    createComment,
    deleteComment,
    updateComment,
    assertCommentOwner,
    getCommentsByNewsId,
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

    // 1. Resolvemos el perfil autenticado desde el servidor
    const perfil = await getSessionProfile();

    if (!perfil) {
        return { error: "No autorizado" };
    }

    try {
        // 2. Insertamos el comentario con permisos de administrador
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

export async function obtenerComentariosAction(
    newsId: number,
) {

    const { data, error } =
        await getCommentsByNewsId(newsId);

    if (error) {

        console.error(
            "Error obteniendo comentarios:",
            error,
        );

        return {
            data: null,
            error: error.message,
        };

    }

    if (!data) {
        return {
            data: [],
            error: null,
        };
    }

    const normalizedData = data.map((comment) => {

        const rawProfile = comment.profiles as unknown;

        const profile = Array.isArray(rawProfile)
            ? rawProfile[0] ?? null
            : rawProfile ?? null;

        return {
            ...comment,
            profiles: profile,
        };

    });

    return {
        data: normalizedData,
        error: null,
    };

}

export async function eliminarComentarioAction(
    commentId: string
) {
    // 1. Resolvemos el perfil autenticado desde el servidor
    const perfil = await getSessionProfile();

    if (!perfil) {

        return {

            error: "No autorizado.",

        };

    }

    try {

        const owner =
            await assertCommentOwner(

                commentId,
                perfil.id,

            );
            // 2. Verificamos que el comentario pertenezca al usuario autenticado
        if (!owner.success) {

            return {

                error: owner.error,

            };

        }
        // 3. Eliminamos el comentario con permisos de administrador
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

    const perfil = await getSessionProfile();

    if (!perfil) {

        return {

            error: "No autorizado.",

        };

    }

    try {

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