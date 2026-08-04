import type { UserProfile } from "../types/profile";
import { DEFAULT_AVATAR } from "../../lib/constants/avatar";

export interface ProfileDB {

    id: string;

    nombre_publico: string | null;

    discord_username: string | null;

    avatar_url: string | null;

    banner_url: string | null;

    biografia: string | null;

}

export function mapProfile(profile: ProfileDB): UserProfile {

    return {

        id: profile.id,

        username:
            profile.nombre_publico ??
            profile.discord_username ??
            "Usuario",

        avatar:
            profile.avatar_url ??
            DEFAULT_AVATAR,

        banner: profile.banner_url ?? undefined,

        biografia: profile.biografia ?? undefined,

        discord: profile.discord_username ?? undefined,

    };

}