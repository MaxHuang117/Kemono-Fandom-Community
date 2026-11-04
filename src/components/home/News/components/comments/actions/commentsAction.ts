"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { validateComment } from "../../lib/validators/commentValidator";
import {
    getProfileByDiscordId,
    getProfileById,
} from "@/lib/services/profiles.service";
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
        return { error: validation.error };
    }

    // 1. La identidad autenticada viene exclusivamente de la sesión del servidor.
    const session = await getServerSession(authOptions);

    if (!session?.user?.discordId) {
        return { error: "No autorizado" };
    }

    try {
        // 2. Resolvemos el perfil por discord_id (identidad externa confiable).
        const { data: perfil, error: errorPerfil } =
            await getProfileByDiscordId(session.user.discordId);

        if (errorPerfil || !perfil) {
            return { error: "Perfil de usuario no encontrado" };
        }

        // 3. Insertamos el comentario usando el profiles.id interno.
        const { error } = await createComment(
            newsId,
            perfil.id,
            message.trim(),
        );

        if (error) {
            console.error("Error creando comentario:", error);
            return { error: "Error al publicar el comentario" };
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
        console.error("Error obteniendo comentarios:", error);
        return { data: null, error: "Error al obtener comentarios" };
    }

    if (!data) {
        return { data: [], error: null };
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
    // 1. La identidad autenticada viene exclusivamente de la sesión del servidor.
    const session = await getServerSession(authOptions);

    if (!session?.user?.discordId) {
        return { error: "No autorizado." };
    }

    try {
        // 2. Resolvemos el perfil por discord_id.
        const { data: perfil, error: errorPerfil } =
            await getProfileByDiscordId(session.user.discordId);

        if (errorPerfil) {
            console.error(errorPerfil);
        }

        if (!perfil) {
            return { error: "Perfil de usuario no encontrado." };
        }

        // 3. Verificamos que el comentario pertenezca al usuario autenticado.
        const owner = await assertCommentOwner(commentId, perfil.id);

        if (!owner.success) {
            return { error: owner.error };
        }

        // 4. Eliminamos el comentario.
        const { error } = await deleteComment(commentId);

        if (error) {
            console.error("Error eliminando comentario:", error);
            return { error: "Error al eliminar el comentario" };
        }

        return { success: true };

    } catch {
        return { error: "Error interno del servidor." };
    }
}

export async function editarComentarioAction(
    commentId: string,
    message: string,
) {
    const validation = validateComment(message);

    if (!validation.valid) {
        return { error: validation.error };
    }

    // 1. La identidad autenticada viene exclusivamente de la sesión del servidor.
    const session = await getServerSession(authOptions);

    if (!session?.user?.discordId) {
        return { error: "No autorizado." };
    }

    try {
        // 2. Resolvemos el perfil por discord_id.
        const { data: perfil, error: errorPerfil } =
            await getProfileByDiscordId(session.user.discordId);

        if (errorPerfil || !perfil) {
            return { error: "Perfil no encontrado." };
        }

        // 3. Los administradores pueden editar cualquier comentario;
        //    los usuarios solo los propios.
        if (!perfil.is_admin) {
            const owner = await assertCommentOwner(commentId, perfil.id);

            if (!owner.success) {
                return { error: owner.error };
            }
        }

        // 4. Actualizamos el comentario.
        const { error } = await updateComment(commentId, message.trim());

        if (error) {
            console.error("Error editando comentario:", error);
            return { error: "Error al editar el comentario" };
        }

        return { success: true };

    } catch {
        return { error: "Error interno del servidor." };
    }
}

export async function obtenerPerfilAction(
    userId: string,
) {
    return await getProfileById(userId);
}
