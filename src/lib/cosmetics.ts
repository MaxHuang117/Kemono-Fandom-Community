/*
|--------------------------------------------------------------------------
| Cosméticos de perfil (Fase 3)
|--------------------------------------------------------------------------
| Resolución centralizada del nombre, el anillo del avatar y el glow para
| todos los consumidores (PerfilCard, UserProfileModal, /u/[id] y roster).
|
| Plan A:
|   - Anillo del avatar = `ring_color` si existe; si no, el degradado; si no,
|     el neón por defecto. Así color plano y degradado son independientes.
|   - Nombre = degradado animado en Tier 2; blanco en Tier 1.
|   - Glow = combina ambos colores del degradado (o el color del anillo) y
|     late suavemente.
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

/** Añade un alpha hex de 2 dígitos a un #rrggbb. */
function withAlpha(hex: string, alpha: string): string {
    return `${hex}${alpha}`;
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
    /** Clases del anillo del avatar (incluye la animación de giro/latido). */
    ringClassName: string;
    /** Estilo inline del anillo (color sólido o degradado cónico). */
    ringStyle?: CSSProperties;
    /** Variables CSS del glow animado (`--glow` / `--glow-soft`). */
    glowVars?: Record<string, string>;
    /** Glow estático de fallback (reduced-motion o antes de animar). */
    ringGlow: string;
    /** Glow del contorno exterior de la tarjeta. */
    cardGlow: string;
    /** Color base (para el roster del home). */
    accentColor: string;
    /** Segundo color del degradado (o igual al base). */
    accentColor2: string;
    /** true si hay degradado propio de Tier 2 y debe animarse. */
    animatedGradient: boolean;
    /** true si el perfil tiene degradado propio. */
    hasGradient: boolean;
}

/** Atributos listos para el `<div>` del anillo (clases + estilo). */
export interface RingAttrs {
    className: string;
    style: CSSProperties;
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
            ringClassName: "",
            ringGlow: "none",
            cardGlow: "0 0 30px rgba(0,0,0,0.8)",
            accentColor: "#71717a",
            accentColor2: "#71717a",
            animatedGradient: false,
            hasGradient: false,
        };
    }

    const hasGradient = tier >= 2 && tieneDegradadoPropio(p);
    const hasRingColor = esHexColorValido(p.ring_color);
    const ringColor = hasRingColor ? (p.ring_color as string) : DEFAULT_RING_COLOR;

    // Plan A: el anillo usa ring_color si existe; si no, el degradado.
    const ringUsesGradient = !hasRingColor && hasGradient;
    const accentColor = ringUsesGradient ? (p.gradient_from as string) : ringColor;
    const accentColor2 = ringUsesGradient ? (p.gradient_to as string) : ringColor;

    // Nombre: degradado animado en Tier 2; blanco en Tier 1.
    const nameClassName = hasGradient
        ? "text-transparent bg-clip-text gradient-animate"
        : "text-white";
    const nameStyle: CSSProperties | undefined = hasGradient
        ? { backgroundImage: `linear-gradient(90deg, ${p.gradient_from}, ${p.gradient_to})` }
        : undefined;

    // Anillo: degradado cónico (flujo al girar) si usa degradado; sólido si no.
    const ringStyle: CSSProperties = ringUsesGradient
        ? { backgroundImage: `conic-gradient(from 0deg, ${accentColor}, ${accentColor2}, ${accentColor})` }
        : { backgroundColor: ringColor };

    return {
        nameClassName,
        nameStyle,
        ringClassName: ringUsesGradient ? "ring-spin-glow" : "ring-glow",
        ringStyle,
        glowVars: {
            "--glow": withAlpha(accentColor, "99"),
            "--glow-soft": withAlpha(accentColor2, "55"),
        },
        ringGlow: `0 0 14px ${withAlpha(accentColor, "99")}, 0 0 28px ${withAlpha(accentColor2, "55")}`,
        cardGlow: hasGradient
            ? `0 0 40px ${withAlpha(p.gradient_from as string, "40")}, 0 0 70px ${withAlpha(p.gradient_to as string, "26")}`
            : `0 0 40px ${withAlpha(ringColor, "40")}`,
        accentColor,
        accentColor2,
        animatedGradient: hasGradient,
        hasGradient,
    };
}

/** Combina las clases y el estilo del anillo (incluye glow animado). */
export function ringAttrs(r: CosmeticResolution): RingAttrs {
    return {
        className: r.ringClassName,
        style: {
            ...r.ringStyle,
            boxShadow: r.ringGlow,
            ...(r.glowVars ?? {}),
        } as CSSProperties,
    };
}
