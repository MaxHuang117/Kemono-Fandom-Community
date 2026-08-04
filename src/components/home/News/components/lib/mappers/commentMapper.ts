import { mapProfile } from "./profileMapper";

import type { UserProfile } from "../types/profile";

export interface CommentDB {

    id: string;

    user_id: string;

    message: string;

    created_at: string;

    profiles: {

        nombre_publico: string | null;

        discord_username: string | null;

        avatar_url: string | null;

        banner_url: string | null;

        biografia: string | null;

    } | null;

}

export interface CommentUI {

    id: string;

    userId: string;

    message: string;

    createdAt: string;

    profile: UserProfile;

}

export function mapComment(comment: CommentDB): CommentUI {

    return {

        id: comment.id,

        userId: comment.user_id,
        message: comment.message,
        createdAt: comment.created_at,

        profile: mapProfile({

            id: comment.user_id,

            nombre_publico: comment.profiles?.nombre_publico ?? null,

            discord_username: comment.profiles?.discord_username ?? null,

            avatar_url: comment.profiles?.avatar_url ?? null,

            banner_url: comment.profiles?.banner_url ?? null,

            biografia: comment.profiles?.biografia ?? null,

        }),

    };

}

export function mapComments(comments: CommentDB[]): CommentUI[] {

    return comments.map(mapComment);

}