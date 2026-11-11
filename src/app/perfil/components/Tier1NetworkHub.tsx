"use client";

import { useState } from "react";
import { NETWORK_CONFIG } from "@/config/networks.config";
import { guardarRedesAction } from "../actions";

interface Props {
    socialLinks: Record<string, string>;
    onUpdate: () => void;
}

export default function Tier1NetworkHub({ socialLinks, onUpdate }: Props) {
    const [isProcessing, setIsProcessing] = useState<string | null>(null);

    // 💔 FUNCIÓN DESCONECTAR: Borra la red de la BD
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
        <div className="mt-8 mb-4 font-sans">
            <div className="flex justify-between items-center mb-6 px-2">
                <div className="flex items-center gap-3">
                    <h4 className="text-[11px] font-mono uppercase tracking-widest text-zinc-400">
                        &gt; Verificación de redes
                    </h4>
                </div>
                <span className="text-[9px] font-mono text-zinc-500 border border-zinc-800 px-2 py-1 rounded hidden sm:block">
                    Verificación oficial
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {NETWORK_CONFIG.map((net) => {
                    const isConnected = Boolean(socialLinks && socialLinks[net.key]);
                    const username = socialLinks ? socialLinks[net.key] : "";
                    const isWorking = isProcessing === net.key;

                    return (
                        <div
                            key={net.key}
                            style={{ "--net-color": net.color } as React.CSSProperties}
                            className={`relative overflow-hidden rounded-xl border p-5 transition-all duration-300 ${
                                isConnected
                                    ? "bg-black border-[var(--net-color)] shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                                    : "bg-[#050505] border-zinc-800 hover:border-zinc-600"
                            }`}
                        >
                            {isConnected && (
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--net-color)] opacity-5 blur-[50px] pointer-events-none" />
                            )}

                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${isConnected ? 'bg-[var(--net-color)]/10 text-[var(--net-color)]' : 'bg-zinc-900 text-zinc-500'}`}>
                                        <div className="w-5 h-5 [&>svg]:w-full [&>svg]:h-full flex items-center justify-center">
                                            {net.icon}
                                        </div>
                                    </div>
                                    <div>
                                        <h5 className="text-xs font-bold text-white uppercase tracking-wider">{net.label}</h5>
                                        <span className={`text-[9px] font-mono ${isConnected ? 'text-neon-bright' : 'text-zinc-500'}`}>
                                            {isConnected ? '✓ Verificado' : 'No conectado'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {isConnected ? (
                                <div className="flex items-center justify-between mt-2 bg-zinc-900/50 p-3 rounded-lg border border-white/5">
                                    <span className="text-sm font-mono text-white truncate mr-4">@{username}</span>
                                    <button
                                        onClick={() => handleDisconnect(net.key)}
                                        disabled={isWorking}
                                        className="text-[10px] font-mono text-red-400 hover:text-red-300 uppercase tracking-widest px-3 py-1.5 border border-red-900/30 hover:border-red-500/50 rounded transition-all disabled:opacity-50"
                                    >
                                        {isWorking ? '...' : 'Desconectar'}
                                    </button>
                                </div>
                            ) : (
                                <a
                                    href={`/api/social/connect/${net.key}`}
                                    className="w-full mt-2 py-3 rounded-lg bg-[var(--net-color)]/10 hover:bg-[var(--net-color)]/20 text-[var(--net-color)] border border-[var(--net-color)]/30 hover:border-[var(--net-color)] text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group"
                                >
                                    <span>Conectar {net.label}</span>
                                    <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </a>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
