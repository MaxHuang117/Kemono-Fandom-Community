/**
 * Verificación central de beneficios de tier (FASE2-08).
 *
 * Un beneficio de tier exige dos condiciones:
 *   1. `tier_level` igual o superior al nivel requerido.
 *   2. Suscripción vigente (`sub_expires_at` en el futuro).
 *
 * Un `sub_expires_at` nulo o ausente se interpreta como suscripción perpetua,
 * consistente con la lógica histórica de `src/actions/tier2.actions.ts`.
 */

export function isSubscriptionActive(
    subExpiresAt: string | null | undefined
): boolean {
    return !subExpiresAt || new Date(subExpiresAt).getTime() > Date.now();
}

export function hasActiveTier(
    tierLevel: number | null | undefined,
    requiredTier: number,
    subExpiresAt: string | null | undefined
): boolean {
    return (tierLevel ?? 0) >= requiredTier && isSubscriptionActive(subExpiresAt);
}
