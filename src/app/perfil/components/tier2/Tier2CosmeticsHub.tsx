"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { guardarCosmeticosVIPAction } from "@/app/perfil/actions";
import { VIP_STYLES } from "@/config/vipStyles.config";

interface Props {
    tierLevel: number;
    currentStyleId: string | null;
    onUpdate: () => void;
}

export default function Tier2CosmeticsHub({ tierLevel, currentStyleId, onUpdate }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const activeStyle = VIP_STYLES[currentStyleId || "matrix"] || VIP_STYLES.matrix;

    const handleSelectStyle = async (id: string) => {
        if (id === currentStyleId) return;
        setIsSaving(true);
        const res = await guardarCosmeticosVIPAction(id);
        setIsSaving(false);
        if (res.success) onUpdate();
        else alert(res.error);
    };

    return (
        <div className="mt-8 font-sans relative">
            <button 
                onClick={() => tierLevel >= 2 && setIsOpen(!isOpen)}
                className={`w-full group relative flex justify-between items-center py-4 px-5 overflow-hidden transition-all duration-500 ${
                    tierLevel >= 2 
                        ? "bg-gradient-to-r from-[#0a0a0a] to-[#050505] border-y border-r border-white/5 border-l-2 border-l-emerald-500/70 hover:border-l-emerald-400 hover:bg-[#0c0c0c] cursor-pointer shadow-lg" 
                        : "bg-black border border-dashed border-zinc-900 cursor-not-allowed opacity-50"
                }`}
            >
                {/* Resplandor interno sutil en Hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                <div className="flex items-center gap-5 relative z-10">
                    <div className="flex items-center gap-3">
                        <span className={`font-mono text-[10px] tracking-widest ${tierLevel >= 2 ? "text-emerald-500" : "text-zinc-600"}`}>
                            MOD_01
                        </span>
                        <h4 className={`text-xs font-mono uppercase tracking-widest transition-colors ${tierLevel >= 2 ? "text-white group-hover:text-emerald-100" : "text-zinc-600"}`}>
                            VIP_COSMETICS
                        </h4>
                    </div>
                    
                    {tierLevel >= 2 && (
                        <div className="hidden sm:flex items-center gap-2 bg-black/50 px-2 py-1 border border-white/5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">SYS_ACTIVE:</span>
                            <span className={`text-[10px] font-bold text-transparent bg-clip-text bg-gradient-to-r ${activeStyle.textClass} tracking-wider`}>
                                {activeStyle.label}
                            </span>
                        </div>
                    )}
                </div>
                
                <div className="flex items-center gap-3 relative z-10">
                    <span className={`text-[10px] font-mono uppercase tracking-widest transition-colors ${isOpen ? "text-emerald-400" : "text-zinc-500 group-hover:text-emerald-500/50"}`}>
                        {tierLevel < 2 ? "[ ACCESS_DENIED ]" : isOpen ? "[ DISCONNECT ]" : "[ CONNECT ]"}
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
                        <div className="mt-1 p-6 bg-[#020202] border-x border-b border-white/5 shadow-inner backdrop-blur-sm grid grid-cols-1 sm:grid-cols-2 gap-4 relative">
                            {/* Línea decorativa superior */}
                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

                            {Object.values(VIP_STYLES).map((style) => (
                                <button
                                    key={style.id}
                                    onClick={() => handleSelectStyle(style.id)}
                                    disabled={isSaving}
                                    className={`group relative flex items-center justify-between p-4 border transition-all duration-300 text-left overflow-hidden ${
                                        currentStyleId === style.id 
                                        ? "border-emerald-500/40 bg-emerald-500/[0.03] shadow-[0_0_15px_rgba(16,185,129,0.05)]" 
                                        : "border-white/5 bg-[#050505] hover:border-white/10 hover:bg-[#080808]"
                                    }`}
                                >
                                    {/* Decoración de esquina */}
                                    <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-white/10 group-hover:border-emerald-500/30 transition-colors" />

                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className={`w-8 h-8 rounded-full border border-[#050505] shadow-[0_0_10px_rgba(0,0,0,0.5)] bg-gradient-to-r ${style.ringClass} animate-[spin_4s_linear_infinite] opacity-80`} />
                                        <div>
                                            <h5 className={`font-black text-sm uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r ${style.textClass}`}>
                                                {style.label}
                                            </h5>
                                            <p className="text-[9px] text-zinc-500 font-mono mt-0.5">{style.description}</p>
                                        </div>
                                    </div>
                                    
                                    {currentStyleId === style.id ? (
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-mono text-emerald-500">INSTALLED</span>
                                        </div>
                                    ) : (
                                        <span className="text-[9px] font-mono text-zinc-600 group-hover:text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">APPLY</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}