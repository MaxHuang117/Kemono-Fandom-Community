export type SlideFormat = "A" | "B"; 

export interface SlideStyleConfig {
    textColor: string;          // Hexadecimal (ej. #10B981)
    fontFamily: string;         // Nombre de la fuente curada (ej. 'Bebas Neue')
    positionY: number;          // Coordenada Y en porcentaje (0 a 100)
    positionX: number;          // Coordenada X en porcentaje (0 a 100)
    gradientTopOpacity: number; // Opacidad del degradado superior (0 a 1)
    gradientBottomOpacity?: number; // Opacidad del degradado inferior (0 a 1) (Solo formato B)
    backgroundColor?: string;   // Color del bloque inferior (Solo formato B)
}

export interface CustomSlide {
    id: number;
    format: SlideFormat;
    image_url: string;
    network_key: string;
    title: string;       // Máx 25 caracteres
    description?: string; // Máx 80 caracteres (Solo formato B)
    style_config: SlideStyleConfig; // NUEVO: Configuración estética in-line
}

// Fuentes curadas para mantener la estética Gamer
export const VIP_FONTS = [
    { id: 'font-sans', label: 'Inter (UI Default)' },
    { id: 'font-mono', label: 'JetBrains (Hacker)' },
    { id: 'font-bebas', label: 'Bebas Neue (Impacto)' },
    { id: 'font-oswald', label: 'Oswald (Cinemático)' }
];