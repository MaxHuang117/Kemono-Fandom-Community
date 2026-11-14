/**
 * Niveles de estado/rol (pivote a "hub de creadores").
 *
 *   - 0 = Miembro: perfil público, comentar y likear.
 *   - 1 = Creador aprobado: aparece en el directorio + redes destacadas.
 *   - 2 = Creador destacado: lo anterior + cosméticos (slides, degradado de
 *         nombre, anillo) + mayor peso en descubrimiento.
 *
 * Los niveles son un *estado* gestionado por el admin (postulación →
 * aprobación → destacado). No hay pago ni vigencia: `sub_expires_at` queda
 * en desuso y ya no se evalúa (ver PLAN_HUB_STREAMERS.md y
 * docs/architecture/overview.md, "Reglas de tiers (roles/estado)").
 */

/**
 * Comprueba si un perfil alcanza al menos el nivel requerido.
 * El nivel se re-valida en el servidor en cada operación que lo use; nunca
 * se confía en un `tier_level` enviado por el cliente.
 */
export function hasTier(
    tierLevel: number | null | undefined,
    requiredTier: number
): boolean {
    return (tierLevel ?? 0) >= requiredTier;
}
