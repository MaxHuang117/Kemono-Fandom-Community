"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SlideSlotButton from "./tier2/SlideSlotButton";
import SlidePowerEditorModal from "./tier2/SlidePowerEditorModal";
import type { CustomSlide } from "@/types/slides";
import { eliminarSlideAction } from "@/actions/tier2.actions";

interface Props {
    tierLevel: number;
    socialLinks: Record<string, string>;
    slides: CustomSlide[];
    onUpdate: () => void;
}

const NETWORK_LABELS: Record<string, string> = {
    twitch: "TWITCH",
    youtube: "YOUTUBE",
    x: "X (TWITTER)",
    github: "GITHUB"
};

export default function Tier2Accordion({ tierLevel, socialLinks = {}, slides = [], onUpdate }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
    const [isDeletingSlot, setIsDeletingSlot] = useState<number | null>(null);

    const activeNetworks = useMemo(() => {
        if (!socialLinks) return [];
        return Object.entries(socialLinks)
            .filter(([_, value]) => Boolean(value))
            .map(([key]) => ({
                key,
                label: NETWORK_LABELS[key] || key.toUpperCase()
            }));
    }, [socialLinks]);

    const sortedSlides = useMemo(() => {
        return [...slides].sort((a, b) => a.id - b.id);
    }, [slides]);

    const availableSlots = useMemo(() => {
        const slotsToRender = [];
        for (let i = 0; i < sortedSlides.length; i++) {
            slotsToRender.push(sortedSlides[i].id);
        }
        if (slotsToRender.length < 3) {
            slotsToRender.push(slotsToRender.length + 1);
        }
        return slotsToRender;
    }, [sortedSlides]);

    const handleDelete = async (slotId: number) => {
        if (!confirm(`¿Estás seguro de que deseas purgar el SLOT_0${slotId} del sistema? Esta acción es irreversible.`)) return;

        setIsDeletingSlot(slotId);
        const res = await eliminarSlideAction(slotId);
        setIsDeletingSlot(null);

        if (res.success) {
            setSelectedSlot(null);
            onUpdate();
        } else {
            alert(res.error);
        }
    };

    return (
        <div className="mt-4 font-sans relative">
            <button
                onClick={() => tierLevel >= 2 && setIsOpen(!isOpen)}
                disabled={tierLevel < 2}
                aria-disabled={tierLevel < 2}
                className={`w-full group relative flex justify-between items-center py-4 px-5 overflow-hidden transition-all duration-500 ${
                    tierLevel >= 2
                        ? "bg-gradient-to-r from-[#0a0a0a] to-[#050505] border-y border-r border-white/5 border-l-2 border-l-neon/70 hover:border-l-neon-bright hover:bg-[#0c0c0c] cursor-pointer shadow-lg"
                        : "bg-black border border-dashed border-zinc-900 cursor-not-allowed opacity-50"
                }`}
            >
                {/* Resplandor interno sutil en Hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-neon/0 via-neon/0 to-neon/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                <div className="flex items-center gap-5 relative z-10">
                    <div className="flex items-center gap-3">
                        <span className={`font-mono text-[10px] tracking-widest ${tierLevel >= 2 ? "text-neon" : "text-zinc-500"}`}>
                            Tarjetas
                        </span>
                        <h4 className={`text-xs font-mono uppercase tracking-widest transition-colors ${tierLevel >= 2 ? "text-white group-hover:text-neon-bright" : "text-zinc-500"}`}>
                            Tarjetas VIP
                        </h4>
                    </div>

                    {tierLevel >= 2 && (
                        <div className="hidden sm:flex gap-1 bg-black/50 p-1 border border-white/5">
                            {[1, 2, 3].map(i => {
                                const hasSlide = sortedSlides.length >= i;
                                return (
                                    <div
                                        key={i}
                                        className={`h-1.5 w-5 transition-all duration-500 ${
                                            hasSlide
                                                ? "bg-neon shadow-[0_0_8px_rgba(97,255,97,0.5)]"
                                                : "bg-zinc-800"
                                        }`}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3 relative z-10">
                    <span className={`text-[10px] font-mono uppercase tracking-widest transition-colors ${isOpen ? "text-neon-bright" : "text-zinc-500 group-hover:text-neon/50"}`}>
                        {tierLevel < 2 ? "Requiere Tier 2" : isOpen ? "Cerrar" : "Abrir"}
                    </span>
                </div>
            </button>

            <AnimatePresence>
                {isOpen && tierLevel >= 2 && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-1 p-6 bg-[#020202] border-x border-b border-white/5 shadow-inner backdrop-blur-sm relative">
                            {/* Línea decorativa superior */}
                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-neon/20 to-transparent" />
                            
                            <div className="flex flex-row gap-5 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                                {availableSlots.map(slotId => (
                                    <div key={slotId} className="snap-start shrink-0">
                                        <SlideSlotButton
                                            slotNumber={slotId}
                                            slide={slides.find(s => s.id === slotId)}
                                            isDeleting={isDeletingSlot === slotId}
                                            onClick={() => setSelectedSlot(slotId)}
                                            onDelete={() => handleDelete(slotId)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {selectedSlot !== null && (
                <SlidePowerEditorModal
                    isOpen={true}
                    slotId={selectedSlot}
                    existingSlide={slides.find(s => s.id === selectedSlot)}
                    activeNetworks={activeNetworks}
                    onClose={() => setSelectedSlot(null)}
                    onSaved={() => {
                        setSelectedSlot(null);
                        onUpdate(); 
                    }}
                />
            )}
        </div>
    );
}
