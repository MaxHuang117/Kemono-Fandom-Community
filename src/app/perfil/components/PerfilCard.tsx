"use client";
import Image from "next/image";
import { useState, useRef } from "react";
import { subirBannerAction } from "../actions"; 
import Tier1NetworkHub from "./Tier1NetworkHub"; 
import Tier2Accordion from "@/components/profile/Tier2Accordion"; 
import type { CustomSlide } from "@/types/slides";
import Tier2CosmeticsHub from "./tier2/Tier2CosmeticsHub"; 
// 👇 IMPORTAMOS LOS ESTILOS VIP
import { VIP_STYLES, DEFAULT_STYLE } from "@/config/vipStyles.config";

interface Props {
    banner?: string;
    imagen: string;
    nombre: string;
    discordId: string;
    tierLevel: number;
    socialLinks: Record<string, string>;
    customSlides: CustomSlide[];
    nameColorGradient?: string | null;
    likesCount: number; 
    onSignOut: () => void;
    onUpdate: () => void;
}

export default function PerfilCard({
    banner, imagen, nombre, discordId, tierLevel, socialLinks, customSlides, nameColorGradient, likesCount: initialLikesCount, onSignOut, onUpdate
}: Props) {
    const [isUploading, setIsUploading] = useState(false);
    const [copied, setCopied] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const displayName = nombre.length > 20 ? nombre.slice(0, 20) + "..." : nombre;
    
    // 👇 LÓGICA DE ESTILOS VIP CENTRALIZADA 👇
    const activeStyle = VIP_STYLES[nameColorGradient || "pure"] || DEFAULT_STYLE;
    
    const isPremium = tierLevel >= 1;
    const renderTextClass = isPremium ? `text-transparent bg-clip-text bg-gradient-to-r ${activeStyle.textClass} hover:brightness-125` : "text-white";
    const renderRingClass = isPremium ? `bg-gradient-to-r ${activeStyle.ringClass} animate-[spin_4s_linear_infinite]` : "from-zinc-800 to-zinc-700";

    const getTierBadge = () => {
        switch(tierLevel) {
            case 3: return <span className="bg-[#0a0a0a] text-purple-400 border border-purple-500/30 px-2.5 py-1 rounded text-[9px] tracking-widest uppercase shadow-[0_0_15px_rgba(168,85,247,0.2)]">TIER 3 : SPONSOR</span>;
            case 2: return <span className="bg-[#0a0a0a] text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded text-[9px] tracking-widest uppercase shadow-[0_0_15px_rgba(59,130,246,0.2)]">TIER 2 : VIP</span>;
            case 1: return <span className="bg-[#0a0a0a] text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded text-[9px] tracking-widest uppercase shadow-[0_0_15px_rgba(16,185,129,0.2)]">TIER 1 : SUPPORTER</span>;
            default: return <span className="bg-[#0a0a0a] text-zinc-400 border border-zinc-700 px-2.5 py-1 rounded text-[9px] tracking-widest uppercase">FREE TIER</span>;
        }
    };

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        if (file.size > 2 * 1024 * 1024) {
            alert("⚠️ Acceso denegado: La imagen es demasiado pesada. El límite es 2MB.");
            return;
        }
        setIsUploading(true);
        const formData = new FormData();
        formData.append("banner", file);
        const res = await subirBannerAction(formData);
        if (res.success) onUpdate();
        else alert(res.error);
        setIsUploading(false);
    };

    const handleCopyId = () => {
        if (!discordId) return;
        navigator.clipboard.writeText(discordId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6 font-sans">
            {/* Header del Sistema omitido para brevedad... */}
            <div className="flex justify-between items-end border-b border-emerald-500/20 pb-3">
                <div className="border-l-4 border-emerald-500 pl-4">
                    <h1 className="text-2xl font-black uppercase tracking-wider text-white">Consola_Nodo</h1>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5 font-mono tracking-widest">
                        <button onClick={handleCopyId} className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 group cursor-pointer">
                            ID: {discordId || "unknown_node"}
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                                {copied ? <span className="text-emerald-400 font-bold">[ COPIADO ]</span> : <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
                            </span>
                        </button>
                    </div>
                </div>
                <button onClick={onSignOut} className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 hover:text-red-400 border border-transparent hover:border-red-500/30 bg-transparent hover:bg-red-500/10 px-4 py-2 transition-all rounded">[ DISCONNECT ]</button>
            </div>

            <div className="overflow-hidden bg-[#050505] border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.8)] rounded-xl">
                <div className="group h-56 w-full relative overflow-hidden bg-zinc-950 flex items-center justify-center">
                    {banner ? (
                        <Image src={banner} alt="Banner" fill priority sizes="(max-width: 896px) 100vw, 896px" className="object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                    ) : (
                        <div className="text-zinc-700 font-mono text-xs tracking-widest uppercase">NO_ASSET_LOADED</div>
                    )}
                    <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none z-10" />
                    {tierLevel >= 1 && (
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center backdrop-blur-sm z-20">
                            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleBannerUpload} className="hidden" />
                            <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="px-6 py-2 bg-black/50 text-emerald-400 font-mono text-xs uppercase tracking-widest border border-emerald-500/50 hover:bg-emerald-500 hover:text-black transition-colors rounded">
                                {isUploading ? "UPLOADING..." : "[ UPLOAD_BANNER 1200x400 ]"}
                            </button>
                        </div>
                    )}
                </div>

                <div className="px-8 pb-8 relative z-30">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 mb-8 relative">
                        
                        {/* 👇 AVATAR CON MARCO DINÁMICO Y HOVER GLOW 👇 */}
                        <div className="relative group/avatar shrink-0">
                            <div className={`absolute inset-[-4px] rounded-full ${renderRingClass} opacity-60 group-hover/avatar:opacity-100 transition-opacity duration-500`} />
                            <div className="relative h-32 w-32 rounded-full border-4 border-[#050505] bg-[#0a0a0a] overflow-hidden">
                                <Image src={imagen} fill alt="Perfil" sizes="128px" priority className="object-cover" />
                                {isPremium && (
                                    <div className="absolute inset-0 w-full h-[200%] bg-gradient-to-b from-transparent via-white/20 to-transparent -translate-y-full group-hover/avatar:translate-y-full transition-transform duration-1000 ease-in-out pointer-events-none" />
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col items-center sm:items-start pb-2">
                            {/* 👇 NOMBRE CON COLOR DINÁMICO 👇 */}
                            <h3 className={`font-black text-3xl sm:text-4xl uppercase tracking-wider drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] mb-2 transition-all duration-300 ${renderTextClass}`} title={nombre.length > 20 ? nombre : undefined}>
                                {displayName}
                            </h3>
                            
                            <div className="flex flex-wrap justify-center sm:justify-start gap-2.5 items-center">
                                <div className="inline-flex items-center gap-2 bg-[#0a0a0a] border border-emerald-500/20 px-2.5 py-1 rounded text-[9px] uppercase tracking-widest text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"/>ONLINE
                                </div>
                                {getTierBadge()}
                                <div className="group flex items-center gap-2 px-3 py-1 rounded border transition-all duration-300 shadow-[0_0_10px_rgba(239,68,68,0.1)] bg-[#0a0a0a] border-white/10 hover:border-red-500/30 text-zinc-400 hover:text-red-400 cursor-default" title="Esta es tu reputación actual">
                                    <svg className="w-3.5 h-3.5 transition-transform duration-300 fill-transparent stroke-current stroke-2 group-hover:scale-110" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
                                    <span className="text-[10px] font-mono font-bold tracking-wider">{initialLikesCount}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {tierLevel >= 1 && <Tier1NetworkHub socialLinks={socialLinks} onUpdate={onUpdate} />}
                    <Tier2CosmeticsHub tierLevel={tierLevel} currentStyleId={nameColorGradient || "matrix"} onUpdate={onUpdate} />
                    <Tier2Accordion tierLevel={tierLevel} slides={customSlides} socialLinks={socialLinks} onUpdate={onUpdate} />
                </div>
            </div>
        </div>
    );
}
