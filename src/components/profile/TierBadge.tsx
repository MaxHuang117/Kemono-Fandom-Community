"use client";

import { SITE_CONFIG } from "@/config/site.config";

/*
|--------------------------------------------------------------------------
| TierBadge
|--------------------------------------------------------------------------
| Fase 2 (B2): los badges reflejan los roles/estado del hub de creadores
| (Miembro / Creador aprobado / Creador destacado), usando SITE_CONFIG
| como fuente única. Se elimina el tier 3 (SPONSOR) y los nombres legacy
| SUPPORTER/VIP.
|--------------------------------------------------------------------------
*/

export default function TierBadge({ tier }: { tier: number }) {
    // Tier 0 (Miembro) no muestra insignia; tier 3 ya no existe.
    if (tier !== 1 && tier !== 2) return null;

    const label = SITE_CONFIG.tierLabels[tier as 1 | 2];

    const styles =
        tier === 2
            ? "bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.1)]"
            : "bg-neon/10 text-neon-bright border-neon/30 shadow-[0_0_10px_rgba(97,255,97,0.1)]";

    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase border ${styles}`}>
            {label}
        </span>
    );
}
