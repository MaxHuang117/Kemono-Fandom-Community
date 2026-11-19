/*
|--------------------------------------------------------------------------
| Cosméticos de perfil (Fase 3)
|--------------------------------------------------------------------------
| Resolución centralizada del nombre y del anillo del avatar para todos los
| consumidores (PerfilCard, UserProfileModal, /u/[id] y el roster).
|
| Los presets (`VIP_STYLES`) se eliminaron por completo; ahora solo existen:
|   - Anillo de color sólido (`ring_color`), Tier 1+.
|   - Degradado de 2 colores (`gradient_from`/`gradient_to`), Tier 2, animado.
|
| Reglas:
|   - Tier 2 con degradado propio → degradado animado: el nombre "fluye"
|     (clase `gradient-animate`) y el anillo rota.
|   - Tier 1+ con `ring_color` → anillo sólido de ese color.
|   - Tier 1+ sin color → anillo por defecto (verde neón de la marca).
|   - Tier 0 → nombre blanco y anillo neutro, sin animación.
|
| Los colores son hex arbitrarios, así que se devuelven como estilos inline
| (Tailwind no compila clases dinámicas en runtime).
|--------------------------------------------------------------------------
*/

import type { CSSProperties } from "react";

const HEX_COLOR_PATTERN = /^#[\da-f]{6}$/i;

/** Color de anillo por defecto (verde neón de la marca). */
export const DEFAULT_RING_COLOR = "#61ff61";

/** Valida un color hexadecimal de 6 dígitos (#RRGGBB). */
export function esHexColorValido(color: unknown): color is string {
    return typeof color === "string" && HEX_COLOR_PATTERN.test(color);
}

export interface CosmeticProfile {
    tier_level: number | null | undefined;
    ring_color?: string | null;
    gradient_from?: string | null;
    gradient_to?: string | null;
}

export interface CosmeticResolution {
    /** Clases del nombre (gradiente + clip de texto). */
    nameClassName: string;
    /** Estilo inline del nombre (degradado animado o estático). */
    nameStyle?: CSSProperties;
    /** Clases del anillo del avatar. */
    ringClassName: string;
    /** Estilo inline del anillo (color sólido o degradado). */
    ringStyle?: CSSProperties;
    /** true si hay degradado propio de Tier 2 y debe animarse. */
    animatedGradient: boolean;
}

function tieneDegradadoPropio(p: CosmeticProfile): boolean {
    return esHexColorValido(p.gradient_from) && esHexColorValido(p.gradient_to);
}

export function resolverCosmeticos(p: CosmeticProfile): CosmeticResolution {
    const tier = p.tier_level ?? 0;

    // Tier 0 (Miembro): sin cosméticos ni animación.
    if (tier < 1) {
        return {
            nameClassName: "text-white",
            ringClassName: "from-zinc-800 to-zinc-700",
            animatedGradient: false,
        };
    }

    // Tier 2 con degradado propio: nombre y anillo animados con ese degradado.
    if (tier >= 2 && tieneDegradadoPropio(p)) {
        const gradient = `linear-gradient(90deg, ${p.gradient_from}, ${p.gradient_to})`;
        return {
            nameClassName: "text-transparent bg-clip-text gradient-animate",
            nameStyle: { backgroundImage: gradient },
            ringClassName: "motion-safe:animate-[spin_4s_linear_infinite]",
            ringStyle: { backgroundImage: gradient },
            animatedGradient: true,
        };
    }

    // Anillo sólido (Tier 1+): usa ring_color si es válido, si no el neón.
    const ringColor = esHexColorValido(p.ring_color) ? p.ring_color : DEFAULT_RING_COLOR;
    return {
        nameClassName: "text-white",
        ringClassName: "motion-safe:animate-[spin_4s_linear_infinite]",
        ringStyle: { backgroundColor: ringColor },
        animatedGradient: false,
    };
}
