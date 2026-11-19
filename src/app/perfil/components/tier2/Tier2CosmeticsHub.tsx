"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { guardarAnilloAction, guardarDegradadoAction } from "@/app/perfil/actions";

interface Props {
    tierLevel: number;
    ringColor: string | null;
    gradientFrom: string | null;
    gradientTo: string | null;
    onUpdate: () => void;
}

/* Campo de color reutilizable (swatch + hex). */
function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (hex: string) => void }) {
    return (
        <div className="bg-black border border-white/5 p-3 rounded-lg flex flex-col gap-2">
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">{label}</span>
            <div className="flex items-center gap-2">
                <div className="relative w-7 h-7 rounded overflow-hidden border border-white/20 shrink-0">
                    <input
                        type="color"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer"
                        aria-label={label}
                    />
                </div>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    maxLength={7}
                    placeholder="#61ff61"
                    className="w-full bg-transparent text-xs text-white font-mono outline-none uppercase"
                />
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Tier2CosmeticsHub (Fase 3)
|--------------------------------------------------------------------------
| Cosméticos por nivel (los presets `VIP_STYLES` fueron eliminados):
|   - Anillo (Tier 1+): color sólido `ring_color`.
|   - Degradado (Tier 2): dos colores `gradient_from`/`gradient_to` (animado).
|--------------------------------------------------------------------------
*/
export default function Tier2CosmeticsHub({ tierLevel, ringColor, gradientFrom, gradientTo, onUpdate }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [ring, setRing] = useState(ringColor ?? "#61ff61");
    const [from, setFrom] = useState(gradientFrom ?? "#61ff61");
    const [to, setTo] = useState(gradientTo ?? "#8dff8d");

    const handleSaveRing = async () => {
        if (ring === ringColor) return;
        setIsSaving(true);
        const res = await guardarAnilloAction(ring);
        setIsSaving(false);
        if (res.success) onUpdate();
        else alert(res.error);
    };

    const handleSaveGradient = async () => {
        if (from === gradientFrom && to === gradientTo) return;
        setIsSaving(true);
        const res = await guardarDegradadoAction({ from, to });
        setIsSaving(false);
        if (res.success) onUpdate();
        else alert(res.error);
    };

    return (
        <div className="mt-4 font-sans relative">
            <button
                onClick={() => tierLevel >= 1 && setIsOpen(!isOpen)}
                disabled={tierLevel < 1}
                aria-disabled={tierLevel < 1}
                className={`w-full group relative flex justify-between items-center py-4 px-5 overflow-hidden transition-all duration-500 ${
                    tierLevel >= 1
                        ? "bg-gradient-to-r from-[#0a0a0a] to-[#050505] border-y border-r border-white/5 border-l-2 border-l-neon/70 hover:border-l-neon-bright hover:bg-[#0c0c0c] cursor-pointer shadow-lg"
                        : "bg-black border border-dashed border-zinc-900 cursor-not-allowed opacity-50"
                }`}
            >
                {/* Resplandor interno sutil en Hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-neon/0 via-neon/0 to-neon/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                <div className="flex items-center gap-5 relative z-10">
                    <div className="flex items-center gap-3">
                        <span className={`font-mono text-[10px] tracking-widest ${tierLevel >= 1 ? "text-neon" : "text-zinc-500"}`}>
                            Estilos
                        </span>
                        <h4 className={`text-xs font-mono uppercase tracking-widest transition-colors ${tierLevel >= 1 ? "text-white group-hover:text-neon-bright" : "text-zinc-500"}`}>
                            Cosméticos
                        </h4>
                    </div>
                </div>

                <div className="flex items-center gap-3 relative z-10">
                    <span className={`text-[10px] font-mono uppercase tracking-widest transition-colors ${isOpen ? "text-neon-bright" : "text-zinc-500 group-hover:text-neon/50"}`}>
                        {tierLevel < 1 ? "Requiere Tier 1" : isOpen ? "Cerrar" : "Abrir"}
                    </span>
                </div>
            </button>

            <AnimatePresence>
                {isOpen && tierLevel >= 1 && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-1 p-6 bg-[#020202] border-x border-b border-white/5 shadow-inner backdrop-blur-sm relative space-y-6">
                            {/* Línea decorativa superior */}
                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-neon/20 to-transparent" />

                            {/* 1. Anillo (Tier 1+) */}
                            <section className="space-y-3">
                                <h5 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-4 h-[1px] bg-neon/50" /> Color del anillo
                                </h5>
                                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end">
                                    <ColorField label="Anillo" value={ring} onChange={setRing} />
                                    <button
                                        onClick={handleSaveRing}
                                        disabled={isSaving}
                                        className="px-5 py-3 rounded bg-neon/10 hover:bg-neon text-neon hover:text-black font-black text-[10px] uppercase tracking-widest border border-neon/50 transition-colors disabled:opacity-50"
                                    >
                                        {isSaving ? "Guardando..." : "Aplicar anillo"}
                                    </button>
                                </div>
                            </section>

                            {/* 2. Degradado (Tier 2) */}
                            {tierLevel >= 2 && (
                                <section className="space-y-3">
                                    <h5 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                        <span className="w-4 h-[1px] bg-neon/50" /> Degradado de nombre (2 colores)
                                    </h5>
                                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
                                        <ColorField label="Desde" value={from} onChange={setFrom} />
                                        <ColorField label="Hasta" value={to} onChange={setTo} />
                                        <button
                                            onClick={handleSaveGradient}
                                            disabled={isSaving}
                                            className="px-5 py-3 rounded bg-neon/10 hover:bg-neon text-neon hover:text-black font-black text-[10px] uppercase tracking-widest border border-neon/50 transition-colors disabled:opacity-50"
                                        >
                                            {isSaving ? "Guardando..." : "Aplicar"}
                                        </button>
                                    </div>
                                    <p className="text-[9px] font-mono text-zinc-600">Si defines un degradado, tu nombre se anima con ese flujo de color.</p>
                                </section>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
