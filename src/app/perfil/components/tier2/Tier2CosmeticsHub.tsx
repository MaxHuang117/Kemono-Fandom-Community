"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { guardarAnilloAction, guardarDegradadoAction } from "@/app/perfil/actions";
import { esHexColorValido, DEFAULT_RING_COLOR } from "@/lib/cosmetics";

interface Props {
    tierLevel: number;
    ringColor: string | null;
    gradientFrom: string | null;
    gradientTo: string | null;
    onUpdate: () => void;
}

/* Campo de color reutilizable con validación visual */
function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (hex: string) => void }) {
    const isValid = esHexColorValido(value);
    
    return (
        <div className="bg-black border border-white/5 p-3 rounded-lg flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">{label}</span>
                {!isValid && (
                    <span className="text-[9px] font-mono text-red-400">Inválido</span>
                )}
            </div>
            <div className="flex items-center gap-2">
                {/* Preview del color */}
                <div 
                    className={`relative w-10 h-10 rounded overflow-hidden border-2 shrink-0 ${isValid ? 'border-white/20' : 'border-red-500/50'}`}
                    style={{ backgroundColor: isValid ? value : '#000' }}
                >
                    <input
                        type="color"
                        value={isValid ? value : '#000000'}
                        onChange={(e) => onChange(e.target.value)}
                        className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                        aria-label={label}
                    />
                </div>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    maxLength={7}
                    placeholder="#61ff61"
                    className={`w-full bg-transparent text-xs text-white font-mono outline-none uppercase ${isValid ? '' : 'text-red-400'}`}
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
    const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
    const [ring, setRing] = useState(ringColor ?? DEFAULT_RING_COLOR);
    const [from, setFrom] = useState(gradientFrom ?? DEFAULT_RING_COLOR);
    const [to, setTo] = useState(gradientTo ?? DEFAULT_RING_COLOR);

    // Sincroniza el estado local con los props cuando el perfil se recarga
    // (evita indicadores/guardados desfasados tras `onUpdate`).
    useEffect(() => {
        setRing(ringColor ?? DEFAULT_RING_COLOR);
        setFrom(gradientFrom ?? DEFAULT_RING_COLOR);
        setTo(gradientTo ?? DEFAULT_RING_COLOR);
    }, [ringColor, gradientFrom, gradientTo]);
    
    // Detectar cambios sin guardar
    const hasRingChanges = ring !== (ringColor ?? DEFAULT_RING_COLOR);
    const hasGradientChanges = from !== (gradientFrom ?? DEFAULT_RING_COLOR) || to !== (gradientTo ?? DEFAULT_RING_COLOR);

    const handleSaveRing = async () => {
        if (!esHexColorValido(ring)) {
            setMessage({ type: "error", text: "El color del anillo no es válido. Usa un formato #RRGGBB." });
            return;
        }
        if (ring === ringColor) return;
        setIsSaving(true);
        setMessage(null);
        const res = await guardarAnilloAction(ring);
        setIsSaving(false);
        if (res.success) {
            setMessage({ type: "ok", text: "Anillo actualizado." });
            onUpdate();
        } else {
            setMessage({ type: "error", text: res.error ?? "No se pudo guardar el anillo." });
        }
    };

    const handleSaveGradient = async () => {
        if (!esHexColorValido(from) || !esHexColorValido(to)) {
            setMessage({ type: "error", text: "Los colores del degradado no son válidos. Usa un formato #RRGGBB." });
            return;
        }
        if (from === gradientFrom && to === gradientTo) return;
        setIsSaving(true);
        setMessage(null);
        const res = await guardarDegradadoAction({ from, to });
        setIsSaving(false);
        if (res.success) {
            setMessage({ type: "ok", text: "Degradado actualizado." });
            onUpdate();
        } else {
            setMessage({ type: "error", text: res.error ?? "No se pudo guardar el degradado." });
        }
    };

    const handleResetRing = () => {
        setRing(DEFAULT_RING_COLOR);
    };

    const handleResetGradient = () => {
        setFrom(DEFAULT_RING_COLOR);
        setTo(DEFAULT_RING_COLOR);
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

                            {/* Preview en tiempo real */}
                            <section className="flex items-center justify-center py-4">
                                <div className="relative">
                                    <div 
                                        className={`w-20 h-20 rounded-full ${hasRingChanges || hasGradientChanges ? 'motion-safe:animate-[spin_4s_linear_infinite]' : ''}`}
                                        style={{
                                            background: hasGradientChanges && tierLevel >= 2 
                                                ? `linear-gradient(90deg, ${from}, ${to})`
                                                : hasRingChanges 
                                                    ? ring 
                                                    : ringColor ?? DEFAULT_RING_COLOR,
                                            boxShadow: `0 0 30px ${
                                                hasGradientChanges && tierLevel >= 2 
                                                    ? from 
                                                    : hasRingChanges 
                                                        ? ring 
                                                        : ringColor ?? DEFAULT_RING_COLOR
                                            }80`
                                        }}
                                    />
                                    {(hasRingChanges || hasGradientChanges) && (
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-neon rounded-full animate-pulse" />
                                    )}
                                </div>
                            </section>

                            {/* 1. Anillo (Tier 1+) */}
                            <section className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h5 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                        <span className="w-4 h-[1px] bg-neon/50" /> Color del anillo
                                    </h5>
                                    {hasRingChanges && (
                                        <button
                                            onClick={handleResetRing}
                                            disabled={isSaving}
                                            className="text-[9px] font-mono text-zinc-500 hover:text-neon-bright transition-colors disabled:opacity-50"
                                        >
                                            Reset
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end">
                                    <ColorField label="Anillo" value={ring} onChange={setRing} />
                                    <button
                                        onClick={handleSaveRing}
                                        disabled={isSaving || !esHexColorValido(ring) || !hasRingChanges}
                                        className="px-5 py-3 rounded bg-neon/10 hover:bg-neon text-neon hover:text-black font-black text-[10px] uppercase tracking-widest border border-neon/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSaving ? "Guardando..." : "Aplicar anillo"}
                                    </button>
                                </div>
                            </section>

                            {/* 2. Degradado (Tier 2) */}
                            {tierLevel >= 2 && (
                                <section className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h5 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                            <span className="w-4 h-[1px] bg-neon/50" /> Degradado de nombre (2 colores)
                                        </h5>
                                        {hasGradientChanges && (
                                            <button
                                                onClick={handleResetGradient}
                                                disabled={isSaving}
                                                className="text-[9px] font-mono text-zinc-500 hover:text-neon-bright transition-colors disabled:opacity-50"
                                            >
                                                Reset
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
                                        <ColorField label="Desde" value={from} onChange={setFrom} />
                                        <ColorField label="Hasta" value={to} onChange={setTo} />
                                        <button
                                            onClick={handleSaveGradient}
                                            disabled={isSaving || !esHexColorValido(from) || !esHexColorValido(to) || !hasGradientChanges}
                                            className="px-5 py-3 rounded bg-neon/10 hover:bg-neon text-neon hover:text-black font-black text-[10px] uppercase tracking-widest border border-neon/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSaving ? "Guardando..." : "Aplicar"}
                                        </button>
                                    </div>
                                    <p className="text-[9px] font-mono text-zinc-600">Si defines un degradado, tu nombre se anima con ese flujo de color.</p>
                                </section>
                            )}

                            {/* Feedback inline del guardado */}
                            {message && (
                                <div
                                    role="status"
                                    className={`px-3 py-2 rounded-md text-[10px] font-mono border ${
                                        message.type === "ok"
                                            ? "bg-neon/10 border-neon/40 text-neon-bright"
                                            : "bg-red-500/10 border-red-500/40 text-red-400"
                                    }`}
                                >
                                    {message.text}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
