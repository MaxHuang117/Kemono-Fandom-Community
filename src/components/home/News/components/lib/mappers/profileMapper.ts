import type { CustomSlide, UserProfile } from "../types/profile";
import { DEFAULT_AVATAR } from "../../lib/constants/avatar";

/*
|--------------------------------------------------------------------------
| Interfaz de Base de Datos
|--------------------------------------------------------------------------
*/
export interface ProfileDB {
    id: string;
    nombre_publico: string | null;
    discord_username: string | null;
    avatar_url: string | null;
    banner_url: string | null;
    biografia: string | null;
    
    // Al agregar el "?" le decimos a TypeScript que estos datos
    // podrían no venir si una consulta básica no los pide.
    // De esta manera, evitamos errores de "undefined" en tiempo de ejecución.
    tier_level?: number | null;
    social_links?: any | null; 
    name_color_gradient?: string | null;
    custom_badge?: string | null;
    allow_gifs?: boolean | null;
    custom_slides?: CustomSlide[] | null;
}

/*
|--------------------------------------------------------------------------
| Mapeador de Perfil
|--------------------------------------------------------------------------
*/
export function mapProfile(profile: ProfileDB): UserProfile {
    return {
        id: profile.id,
        username: profile.nombre_publico ?? profile.discord_username ?? "Usuario",
        avatar: profile.avatar_url ?? DEFAULT_AVATAR,
        banner: profile.banner_url ?? undefined,
        biografia: profile.biografia ?? undefined,
        discord: profile.discord_username ?? undefined,
        // Asignación con valores por defecto de seguridad
        tier_level: profile.tier_level ?? 0,
        social_links: (profile.social_links as Record<string, string>) || {},
        custom_slides: (profile.custom_slides as CustomSlide[]) || [],
        name_color_gradient: profile.name_color_gradient ?? undefined,
        custom_badge: profile.custom_badge ?? undefined,
        allow_gifs: profile.allow_gifs ?? false,
    };
}