export interface Comment {

    id: string;

    news_id: number;

    user_id: string;

    message: string;

    created_at: string;

    profile: {

        nombre_publico: string | null;

        avatar_url: string | null;

        discord_username: string | null;

    };

}