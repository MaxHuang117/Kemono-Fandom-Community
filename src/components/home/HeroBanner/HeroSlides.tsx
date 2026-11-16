/*
|--------------------------------------------------------------------------
| HeroSlides
|--------------------------------------------------------------------------
| Fallback estático y utilidades de mapeo para slides provenientes de la
| base de datos (`hero_slides`). El Hero ahora lee primero de la DB; si no
| hay slides activos, se usa este fallback.
|--------------------------------------------------------------------------
*/

export interface HeroSlide {
    title: string;
    subtitle: string;
    image: string;
    buttonText: string;
    url: string;
}

export interface HeroSlideDB {
    id: string;
    title: string;
    subtitle: string | null;
    image_url: string;
    cta_label: string | null;
    cta_url: string | null;
    position: number;
    active: boolean;
}

export const FALLBACK_HERO_SLIDES: HeroSlide[] = [
    {
        title: "Comunidad de Discord",
        subtitle: "Interactúa con los seguidores, enterate de los anuncios y habla con los creadores.",
        image: "/HeroSection/Max-wpp1.png",
        buttonText: "Ir al servidor de Discord",
        url: "https://discord.gg/Ef86ndx33f",
    },
    {
        title: "Canal de YouTube",
        subtitle: "Descubre nuestros proyectos, videos y toda la comunidad desde YouTube.",
        image: "/HeroSection/YT-wpp2.png",
        buttonText: "Ir al canal de YouTube",
        url: "https://www.youtube.com/@maxhuang117",
    },
    {
        title: "Streams en Twitch",
        subtitle: "Únete a los directos y comparte con toda la comunidad en vivo.",
        image: "/HeroSection/Twitch-wpp3.png",
        buttonText: "Ir al canal de Twitch",
        url: "https://www.twitch.tv/maxhuang117",
    },
];

/**
 * Mapea un slide de la DB al shape esperado por el Hero.
 * El CTA visual se unifica a estilo neón (D3); `cta_label`/`cta_url` del slide
 * configuran el botón principal del slide.
 */
export function mapHeroSlide(slide: HeroSlideDB): HeroSlide {
    return {
        title: slide.title,
        subtitle: slide.subtitle ?? "",
        image: slide.image_url,
        buttonText: slide.cta_label || "Ver más",
        url: slide.cta_url || "#",
    };
}
