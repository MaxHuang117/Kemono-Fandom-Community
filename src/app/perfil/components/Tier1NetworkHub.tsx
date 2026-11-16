"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NETWORK_CONFIG } from "@/config/networks.config";
import { guardarRedesAction } from "../actions";

interface Props {
    socialLinks: Record<string, string>;
    onUpdate: () => void;
    tierLevel: number;
}

/*
|--------------------------------------------------------------------------
| Tier1NetworkHub — Verificación de redes (acordeón + etiquetas)
|--------------------------------------------------------------------------
| Mismo patrón de tarjeta desplegable que "Estilo de nombre" y "Tarjetas VIP".
|   - Tier 0 (Miembro): bloqueado ("Requiere Tier 1").
|   - Tier 1+: redes conectadas como etiquetas (logo + @usuario + quitar) y
|     las disponibles como chips "Conectar" (enlazan al OAuth).
|--------------------------------------------------------------------------
*/

export default function Tier1NetworkHub({ socialLinks, onUpdate, tierLevel }: Props) {
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const connectedNetworks = NETWORK_CONFIG.filter((net) => Boolean(socialLinks && socialLinks[net.key]));
    const availableNetworks = NETWORK_CONFIG.filter((net) => !(socialLinks && socialLinks[net.key]));

    // Desconectar una red (borra la clave de social_links vía server action)
    const handleDisconnect = async (networkKey: string) => {
        if (!confirm(`¿Estás seguro de desconectar tu cuenta de ${networkKey.toUpperCase()}?`)) return;

        setIsProcessing(networkKey);
        const updatedLinks = { ...socialLinks };
        delete updatedLinks[networkKey];

        const result = await guardarRedesAction(updatedLinks);

        if (result.success) {
            onUpdate();
        } else {
            alert(result.error);
        }
        setIsProcessing(null);
    };

    return (
        <div className="mt-8 font-sans relative">
            {/* Botón acordeón (igual que Estilo de nombre / Tarjetas VIP) */}
            <button
                onClick={() => tierLevel >= 1 && setIsOpen(!isOpen)}
                disabled={tierLevel < 1}
                aria-disabled={tierLevel < 1}
                aria-expanded={isOpen}
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
                            Redes
                        </span>
                        <h4 className={`text-xs font-mono uppercase tracking-widest transition-colors ${tierLevel >= 1 ? "text-white group-hover:text-neon-bright" : "text-zinc-500"}`}>
                            Verificación de redes
                        </h4>
                    </div>

                    {tierLevel >= 1 && connectedNetworks.length > 0 && (
                        <div className="hidden sm:flex items-center gap-2 bg-black/50 px-2 py-1 border border-white/5">
                            <span className="text-[9px] font-mono text-neon-bright uppercase tracking-widest">
                                {connectedNetworks.length} verificada{connectedNetworks.length !== 1 ? "s" : ""}
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
                        <div className="mt-1 p-6 bg-[#020202] border-x border-b border-white/5 shadow-inner backdrop-blur-sm relative">
                            {/* Línea decorativa superior */}
                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-neon/20 to-transparent" />

                            {/* ── Redes conectadas (etiquetas) ── */}
                            <span className="block text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-3">
                                Redes conectadas
                            </span>
                            {connectedNetworks.length === 0 ? (
                                <p className="text-xs font-mono text-zinc-600 mb-6">
                                    No tienes redes conectadas. Añade una abajo.
                                </p>
                            ) : (
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {connectedNetworks.map((net) => {
                                        const username = socialLinks ? socialLinks[net.key] : "";
                                        const isWorking = isProcessing === net.key;
                                        return (
                                            <div
                                                key={net.key}
                                                style={{ "--net-color": net.color } as React.CSSProperties}
                                                className="inline-flex items-center gap-2 bg-black border border-[var(--net-color)]/40 rounded-full pl-2 pr-1 py-1 shadow-[0_0_12px_rgba(0,0,0,0.5)]"
                                            >
                                                <span className="w-4 h-4 text-[var(--net-color)] [&>svg]:w-full [&>svg]:h-full flex items-center justify-center">
                                                    {net.icon}
                                                </span>
                                                <span className="text-xs font-mono text-white">@{username}</span>
                                                <button
                                                    onClick={() => handleDisconnect(net.key)}
                                                    disabled={isWorking}
                                                    aria-label={`Desconectar ${net.label}`}
                                                    className="w-5 h-5 flex items-center justify-center rounded-full text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                                                >
                                                    {isWorking ? "..." : "×"}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* ── Añadir red (chips de conexión) ── */}
                            {availableNetworks.length > 0 && (
                                <>
                                    <span className="block text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-3">
                                        Añadir red
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {availableNetworks.map((net) => (
                                            <a
                                                key={net.key}
                                                href={`/api/social/connect/${net.key}`}
                                                style={{ "--net-color": net.color } as React.CSSProperties}
                                                className="inline-flex items-center gap-2 bg-black border border-zinc-800 hover:border-[var(--net-color)] rounded-full pl-2 pr-3 py-1.5 transition-all duration-300 group"
                                            >
                                                <span className="w-4 h-4 text-zinc-500 group-hover:text-[var(--net-color)] [&>svg]:w-full [&>svg]:h-full flex items-center justify-center transition-colors">
                                                    {net.icon}
                                                </span>
                                                <span className="text-xs font-mono text-zinc-400 group-hover:text-white transition-colors">
                                                    Conectar {net.label}
                                                </span>
                                            </a>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
