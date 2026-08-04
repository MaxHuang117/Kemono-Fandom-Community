import { mapProfile } from "./profileMapper";

export interface LikeDB {
    user_id: string;

    created_at: string;

    profiles: {
        nombre_publico: string | null;
        discord_username: string | null;
        avatar_url: string | null;
        banner_url?: string | null;
        biografia?: string | null;
    } | null;
}

export interface LikeUI {
    userId: string;

    createdAt: string;

    profile: ReturnType<typeof mapProfile>;
}

export function mapLike(like: LikeDB): LikeUI {

    return {

        userId: like.user_id,

        createdAt: like.created_at,

        profile: mapProfile({

            id: like.user_id,

            nombre_publico: like.profiles?.nombre_publico ?? null,

            discord_username: like.profiles?.discord_username ?? null,

            avatar_url: like.profiles?.avatar_url ?? null,

            banner_url: like.profiles?.banner_url ?? null,

            biografia: like.profiles?.biografia ?? null,

        }),

    };

}