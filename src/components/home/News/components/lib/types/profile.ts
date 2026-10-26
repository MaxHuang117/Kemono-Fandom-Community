export interface CustomSlide {
    id: number;
    image_url: string;
    redirect_link: string;
}

export interface UserProfile {
    id: string;
    username: string;
    avatar: string;
    banner?: string;
    biografia?: string;
    discord?: string;
    // Campos de monetización/tiers
    tier_level: number;
    social_links: Record<string, string>;
    custom_slides?: CustomSlide[];
    name_color_gradient?: string;
    custom_badge?: string;
    allow_gifs?: boolean;
}