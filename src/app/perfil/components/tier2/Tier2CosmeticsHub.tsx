"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { guardarCosmeticosVIPAction, guardarAnilloAction, guardarDegradadoAction } from "@/app/perfil/actions";
import { VIP_STYLES } from "@/config/vipStyles.config";

interface Props {
    tierLevel: number;
    currentStyleId: string | null;
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
| Rediseñado para los cosméticos por nivel:
|   - Anillo (Tier 1+): color sólido `ring_color`.
|   - Degradado (Tier 2): dos colores `gradient_from`/`gradient_to`.
|   - Presets (Tier 2): se conservan como fallback ("predeterminado").
|--------------------------------------------------------------------------
*/
export default function Tier2CosmeticsHub({ tierLevel, currentStyleId, ringColor, gradientFrom, gradientTo, onUpdate }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [ring, setRing] = useState(ringColor ?? "#61ff61");
    const [from, setFrom] = useState(gradientFrom ?? "#61ff61");
    const [to, setTo] = useState(gradientTo ?? "#8dff8d");
    const activeStyle = VIP_STYLES[currentStyleId || "matrix"] || VIP_STYLES.matrix;

    const handleSelectStyle = async (id: string) => {
        if (id === currentStyleId) return;
        setIsSaving(true);
        const res = await guardarCosmeticosVIPAction(id);
        setIsSaving(false);
        if (res.success) onUpdate();
        else alert(res.error);
    };

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

                    {tierLevel >= 1 && (
                        <div className="hidden sm:flex items-center gap-2 bg-black/50 px-2 py-1 border border-white/5">
                            <div className="w-1.5 h-1.5 rounded-full bg-neon motion-safe:animate-pulse" />
                            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Activo:</span>
                            <span className={`text-[10px] font-bold text-transparent bg-clip-text bg-gradient-to-r ${activeStyle.textClass} tracking-wider`}>
                                {activeStyle.label}
                            </span>
                        </div>
                    )}
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
                                    <p className="text-[9px] font-mono text-zinc-600">Si defines un degradado, tu nombre se anima con ese flujo de color. Si lo dejas en un preset, no se anima.</p>
                                </section>
                            )}

                            {/* 3. Presets (Tier 2, fallback / predeterminado) */}
                            {tierLevel >= 2 && (
                                <section className="space-y-3">
                                    <h5 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                        <span className="w-4 h-[1px] bg-neon/50" /> Presets (predeterminado)
                                    </h5>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {Object.values(VIP_STYLES).map((style) => (
                                            <button
                                                key={style.id}
                                                onClick={() => handleSelectStyle(style.id)}
                                                disabled={isSaving}
                                                className={`group relative flex items-center justify-between p-4 border transition-all duration-300 text-left overflow-hidden ${
                                                    currentStyleId === style.id
                                                        ? "border-neon/40 bg-neon/[0.03] shadow-[0_0_15px_rgba(97,255,97,0.05)]"
                                                        : "border-white/5 bg-[#050505] hover:border-white/10 hover:bg-[#080808]"
                                                }`}
                                            >
                                                <div className="flex items-center gap-4 relative z-10">
                                                    <div className={`w-8 h-8 rounded-full border border-[#050505] shadow-[0_0_10px_rgba(0,0,0,0.5)] bg-gradient-to-r ${style.ringClass} motion-safe:animate-[spin_4s_linear_infinite] opacity-80`} />
                                                    <div>
                                                        <h5 className={`font-black text-sm uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r ${style.textClass}`}>
                                                            {style.label}
                                                        </h5>
                                                        <p className="text-[9px] text-zinc-500 font-mono mt-0.5">{style.description}</p>
                                                    </div>
                                                </div>

                                                {currentStyleId === style.id && (
                                                    <span className="text-[9px] font-mono text-neon">Activo</span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
