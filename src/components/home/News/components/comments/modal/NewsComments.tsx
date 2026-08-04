"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { News } from "../../../data/NewsData";
import type { UserProfile } from "../../lib/types/profile";
import NewsCommentsModal from "../modal/NewsCommentsModal";
import { useCurrentProfile } from "@/hooks/useCurrentProfile";
import { eliminarComentarioAction } from "../actions/commentsAction";
import {
    mapComments,
    type CommentUI,
} from "../../lib/mappers/commentMapper";

interface Props {
    news: News | null;
    onClose: () => void;
}

export default function NewsComments({ news, onClose }: Props) {
    const { profile } = useCurrentProfile();
    const [comments, setComments] = useState<CommentUI[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

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

    async function loadComments() {
        if (!news) return;

        const { data } = await supabase
            .from("comments")
            .select(`
                *,
                profiles (
                    nombre_publico,
                    avatar_url,
                    banner_url, 
                    discord_username,
                    biografia
                )
            `)
            .eq("news_id", news.id)
            .order("created_at", { ascending: false });

        if (data) {
            setComments(mapComments(data));
        }
    }

    useEffect(() => {
        if (!news) return;

        loadComments();
    }, [news]);

    if (!news) return null;

    return (
        <NewsCommentsModal
            currentUserId={profile?.id ?? null}
            news={news}
            comments={comments}
            selectedUser={selectedUser}
            onClose={onClose}
            onLoadComments={loadComments}
            onDeleteComment={handleDeleteComment}
            onCommentUpdated={loadComments}
            onSelectUser={setSelectedUser}
        />
    );
}
