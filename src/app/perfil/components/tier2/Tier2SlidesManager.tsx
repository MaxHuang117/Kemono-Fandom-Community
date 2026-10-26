"use client";

import { useMemo } from "react";
import SlideEditorSlot from "../tier2/SlideEditorSlot";
import type { CustomSlide } from "@/types/slides";

interface Props {
    tierLevel: number;
    socialLinks: Record<string, string>;
    customSlides: CustomSlide[];
    onUpdate: () => void; // Función para recargar la web tras guardar
}

const NETWORK_LABELS: Record<string, string> = {
    twitch: "TWITCH",
    youtube: "YOUTUBE",
    x: "X (TWITTER)",
    github: "GITHUB"
};

export default function Tier2SlidesManager({ tierLevel, socialLinks, customSlides = [], onUpdate }: Props) {
    
    // Filtramos dinámicamente las redes que tienen un usuario escrito
    const activeNetworks = useMemo(() => {
        if (!socialLinks) return [];
        return Object.entries(socialLinks)
            .filter(([_, value]) => Boolean(value)) 
            .map(([key]) => ({
                key,
                label: NETWORK_LABELS[key] || key.toUpperCase()
            }));
    }, [socialLinks]);

    const SLOTS = [1, 2, 3];

    return (
        <div className="mt-10 border-t border-white/5 pt-8 font-sans relative">
            <div className="flex justify-between items-center mb-6">
                <h4 className="text-xs font-mono uppercase tracking-widest text-blue-500">
                    &gt; TIER 2: VIP_PROMO_SLIDES
                </h4>
                <span className="text-[9px] font-mono text-zinc-500 border border-zinc-800 px-2 py-1">
                    TIER 2+ FEATURE
                </span>
            </div>

            {tierLevel < 2 ? (
                // ESTADO BLOQUEADO (Tier 0 y 1)
                <div className="bg-[#050505] border border-dashed border-zinc-800 p-10 text-center flex flex-col items-center justify-center opacity-80 select-none">
                    <svg className="w-8 h-8 text-zinc-700 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <h5 className="text-zinc-400 font-bold uppercase tracking-wider text-sm mb-2">Módulo Bloqueado</h5>
                    <p className="text-zinc-600 font-mono text-xs max-w-md">
                        Desbloquea el Nivel VIP (Tier 2) para habilitar hasta 3 paneles promocionales personalizables en tu perfil público.
                    </p>
                </div>
            ) : (
                // ESTADO DESBLOQUEADO (Tier 2+)
                <div className="space-y-4">
                    {/* Alerta si es VIP pero no tiene redes conectadas para enlazar */}
                    {activeNetworks.length === 0 && (
                        <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 mb-4 text-yellow-500/80 text-xs font-mono flex items-center gap-3">
                            <span className="text-lg">⚠</span>
                            <span>[WARNING] No tienes redes conectadas. Añade al menos una en el panel superior para poder configurar las redirecciones de tus slides.</span>
                        </div>
                    )}
                    
                    <div className="grid md:grid-cols-3 gap-6">
                        {SLOTS.map(slotId => (
                            <SlideEditorSlot 
                                key={slotId}
                                slideId={slotId}
                                existingSlide={customSlides.find(s => s.id === slotId)}
                                activeNetworks={activeNetworks}
                                onSaved={onUpdate}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
