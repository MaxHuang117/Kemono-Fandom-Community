"use client";

import { useEffect, useState } from "react";
import { News } from "../../../data/NewsData";
import type { UserProfile } from "../../lib/types/profile";
import NewsCommentsModal from "../modal/NewsCommentsModal";
import { useCurrentProfile } from "@/hooks/useCurrentProfile";
import {
    eliminarComentarioAction,
    obtenerComentariosAction,
} from "../actions/commentsAction";
import {
    mapComments,
    type CommentUI,
} from "../../lib/mappers/commentMapper";

interface Props {
    news: News | null;
    onClose: () => void;
}

async function obtenerComentarios(newsId: number): Promise<CommentUI[]> {

    const result = await obtenerComentariosAction(newsId);

    if (result.error) {

        console.error(
            "Error cargando comentarios:",
            result.error
        );

        return [];
    }

    if (!result.data) {
        return [];
    }

    return mapComments(result.data);
}

export default function NewsComments({ news, onClose }: Props) {

    const { profile } = useCurrentProfile();

    const [comments, setComments] =
        useState<CommentUI[]>([]);

    const [selectedUser, setSelectedUser] =
        useState<UserProfile | null>(null);

    // 🔁 Estado de carga: alimenta el skeleton del modal mientras llegan los datos.
    const [loadingComments, setLoadingComments] =
        useState(true);

    async function loadComments() {

        if (!news) return;

        setLoadingComments(true);

        const comments =
            await obtenerComentarios(news.id);

        setComments(comments);

        setLoadingComments(false);
    }

    async function handleDeleteComment(
        commentId: string,
    ) {

        const confirmed = window.confirm(
            "¿Eliminar este comentario?"
        );

        if (!confirmed) return;

        const result =
            await eliminarComentarioAction(commentId);

        if (result.error) {

            alert(result.error);

            return;
        }

        await loadComments();
    }

    useEffect(() => {

        async function cargarComentarios() {

            await loadComments();

        }

        cargarComentarios();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [news]);

    if (!news) return null;

    return (
        <NewsCommentsModal
            currentUserId={profile?.id ?? null}
            news={news}
            comments={comments}
            loadingComments={loadingComments}
            selectedUser={selectedUser}
            onClose={onClose}
            onLoadComments={loadComments}
            onDeleteComment={handleDeleteComment}
            onCommentUpdated={loadComments}
            onSelectUser={setSelectedUser}
        />
    );
}