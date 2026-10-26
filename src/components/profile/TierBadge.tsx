"use client";

export default function TierBadge({ tier }: { tier: number }) {
    switch (tier) {
        case 3: 
            return <span className="bg-purple-500/10 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase shadow-[0_0_10px_rgba(168,85,247,0.1)]">TIER 3 : SPONSOR</span>;
        case 2: 
            return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase shadow-[0_0_10px_rgba(59,130,246,0.1)]">TIER 2 : VIP</span>;
        case 1: 
            return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase shadow-[0_0_10px_rgba(16,185,129,0.1)]">TIER 1 : SUPPORTER</span>;
        default: 
            return null; // Tier 0 no muestra insignia
    }
}