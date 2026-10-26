"use client";

import Image from "next/image";
import type { CustomSlide } from "@/types/slides";

interface Props {
    slotNumber: number;
    slide?: CustomSlide;
    isDeleting?: boolean;
    onClick: () => void;
    onDelete?: () => void;
}

export default function SlideSlotButton({ slotNumber, slide, isDeleting, onClick, onDelete }: Props) {
    // ESTADO VACÍO[cite: 16]
    if (!slide) {
        return (
            <button onClick={onClick} type="button" className="group relative h-40 w-full sm:w-56 shrink-0 overflow-hidden rounded-xl border-2 border-dashed border-zinc-700 bg-[#070707] transition-all duration-300 hover:border-emerald-500 hover:bg-[#0a0a0a] hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] focus:outline-none">
                <div className="flex h-full flex-col items-center justify-center space-y-3 opacity-70 transition-opacity group-hover:opacity-100">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-900 border border-zinc-700 group-hover:border-emerald-500 group-hover:bg-emerald-500/10 transition-colors">
                        <span className="text-xl font-light text-zinc-500 group-hover:text-emerald-400">+</span>
                    </div>
                    <span className="font-mono text-[10px] text-zinc-400 tracking-widest group-hover:text-emerald-300">[ CREAR_SLOT_0{slotNumber} ]</span>
                </div>
            </button>
        );
    }

    // ESTADO LLENO (Mini-Vista Previa + Papelera)
    const style = slide.style_config;
    
    return (
        <div className="flex flex-col gap-2 shrink-0 w-full sm:w-48">
            {/* BOTÓN DE EDICIÓN (La Miniatura) */}
            <button 
                onClick={onClick} 
                disabled={isDeleting}
                // CAMBIO: Aumentada la altura (h-64) para que sea rectangular
                className={`group relative h-64 w-full overflow-hidden rounded-xl border-2 border-zinc-800 bg-[#050505] transition-all duration-300 hover:border-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] ${isDeleting ? "opacity-50 blur-sm grayscale" : ""}`}
            >
                {/* Etiqueta de Sistema */}
                <div className="absolute top-2 left-2 z-20">
                    <span className="bg-emerald-500/20 border border-emerald-500/50 px-1.5 py-0.5 rounded font-mono text-[8px] font-bold tracking-widest text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                        SLOT_0{slotNumber}
                    </span>
                </div>

                {slide.format === "A" ? (
                    // MINI-VISTA: FORMATO A
                    <div className="relative w-full h-full bg-black flex items-center justify-center">
                        <Image src={slide.image_url} alt={slide.title} fill className="object-cover opacity-60 group-hover:opacity-80 transition-opacity" sizes="224px" />
                        <div className="absolute top-0 inset-x-0 h-12 bg-gradient-to-b from-black to-transparent pointer-events-none" style={{ opacity: style.gradientTopOpacity }} />
                        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none" style={{ opacity: style.gradientBottomOpacity ?? 0.8 }} />
                        
                        <div className="absolute w-[85%] flex flex-col items-center" style={{ left: `${style.positionX}%`, top: `${style.positionY}%`, transform: 'translate(-50%, -50%)', color: style.textColor }}>
                            <h4 className={`text-xs font-black uppercase text-center drop-shadow-md break-all leading-tight w-full ${style.fontFamily}`}>{slide.title}</h4>
                        </div>
                    </div>

                ) : (
                    // MINI-VISTA: FORMATO B (Optimizado)
                    <div className="relative w-full h-full flex flex-col overflow-hidden" style={{ backgroundColor: style.backgroundColor ?? '#050505' }}>
                        <div className="relative w-full h-[70%] bg-zinc-900 border-b border-white/10">
                            <Image src={slide.image_url} alt={slide.title} fill className="object-cover opacity-70 group-hover:opacity-90 transition-opacity" sizes="224px" />
                            <div className="absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-black to-transparent pointer-events-none" style={{ opacity: style.gradientTopOpacity }} />
                        </div>
                        <div className={`p-3 flex flex-col ${slide.description ? 'justify-start text-left' : 'justify-center items-center text-center'} flex-1 w-full`} style={{ color: style.textColor }}>
                            <h4 className={`text-[12px] font-black uppercase break-words leading-tight w-full ${style.fontFamily} ${slide.description ? 'mb-1' : 'mb-0'}`}>
                                {slide.title}
                            </h4>
                            {slide.description && (
                                <p className={`text-[9px] opacity-80 break-words leading-relaxed w-full line-clamp-2 ${style.fontFamily}`}>
                                    {slide.description}
                                </p>
                            )}
                        </div>
                    </div>
                )}
                
                {/* Overlay Hover */}
                <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                    <span className="bg-black/80 text-emerald-400 font-mono text-[9px] px-2 py-1 rounded border border-emerald-500/50 tracking-widest">[ EDITAR ]</span>
                </div>
            </button>

            {/* BOTÓN PAPELERA (Abajo) */}
            <button 
                onClick={onDelete}
                disabled={isDeleting}
                className="group/delete flex items-center justify-center gap-1.5 py-1.5 rounded bg-zinc-900/50 border border-transparent hover:border-red-900 hover:bg-red-950/30 transition-colors"
            >
                <svg className="w-3 h-3 text-zinc-600 group-hover/delete:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 group-hover/delete:text-red-400 transition-colors">
                    {isDeleting ? "BORRANDO..." : "ELIMINAR SLOT"}
                </span>
            </button>
        </div>
    );
}