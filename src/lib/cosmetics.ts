/*
|--------------------------------------------------------------------------
| Cosméticos de perfil (Fase 3)
|--------------------------------------------------------------------------
| Resolución centralizada del nombre y del anillo del avatar para todos los
| consumidores (PerfilCard, UserProfileModal, /u/[id] y el roster).
|
| Reglas:
|   - Tier 2 con degradado propio (gradient_from + gradient_to) → degradado
|     animado: el nombre "fluye" (clase `gradient-animate`) y el anillo rota.
|   - Tier 2 sin degradado propio → preset (VIP_STYLES) estático (fallback).
|   - Tier 1 → anillo de color sólido (ring_color) o preset por defecto.
|   - Tier 0 → nombre blanco y anillo neutro, sin animación.
|
| Los colores son hex arbitrarios, así que se devuelven como estilos inline
| (Tailwind no compila clases dinámicas en runtime).
|--------------------------------------------------------------------------
*/

import type { CSSProperties } from "react";
import { VIP_STYLES, DEFAULT_STYLE } from "@/config/vipStyles.config";

const HEX_COLOR_PATTERN = /^#[\da-f]{6}$/i;

/** Valida un color hexadecimal de 6 dígitos (#RRGGBB). */
export function esHexColorValido(color: unknown): color is string {
    return typeof color === "string" && HEX_COLOR_PATTERN.test(color);
}

export interface CosmeticProfile {
    tier_level: number | null | undefined;
    name_color_gradient?: string | null;
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

    const preset = VIP_STYLES[p.name_color_gradient || "pure"] || DEFAULT_STYLE;

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

    // Tier 1: anillo de color sólido (si lo definió) y nombre blanco.
    if (tier === 1) {
        if (esHexColorValido(p.ring_color)) {
            return {
                nameClassName: "text-white",
                ringClassName: "motion-safe:animate-[spin_4s_linear_infinite]",
                ringStyle: { backgroundColor: p.ring_color },
                animatedGradient: false,
            };
        }
        return {
            nameClassName: "text-white",
            ringClassName: `bg-gradient-to-r ${preset.ringClass} motion-safe:animate-[spin_4s_linear_infinite]`,
            animatedGradient: false,
        };
    }

    // Tier 2 con preset (fallback): nombre con degradado estático + anillo preset.
    return {
        nameClassName: `text-transparent bg-clip-text bg-gradient-to-r ${preset.textClass} hover:brightness-125`,
        ringClassName: `bg-gradient-to-r ${preset.ringClass} motion-safe:animate-[spin_4s_linear_infinite]`,
        animatedGradient: false,
    };
}
