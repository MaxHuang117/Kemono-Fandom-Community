"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion } from "framer-motion";
import type { SlideFormat, SlideStyleConfig } from "@/types/slides";

interface Props {
    format: SlideFormat;
    previewUrl: string;
    title: string;
    description: string;
    styleConfig: SlideStyleConfig;
    onStyleChange: (updates: Partial<SlideStyleConfig>) => void;
    onImageClick: () => void;
}

export default function PreviewCanvas({ format, previewUrl, title, description, styleConfig, onStyleChange, onImageClick }: Props) {
    const canvasRef = useRef<HTMLDivElement>(null);

    const handleDragEnd = (event: any, info: any) => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current.getBoundingClientRect();
        
        let percentX = ((info.point.x - canvas.left) / canvas.width) * 100;
        let percentY = ((info.point.y - canvas.top) / canvas.height) * 100;
        
        onStyleChange({
            positionX: Math.max(15, Math.min(85, percentX)),
            positionY: Math.max(15, Math.min(85, percentY))
        });
    };

    return (
        <div className="w-full md:w-[55%] h-[40vh] md:h-full border-b md:border-b-0 md:border-r border-zinc-800 bg-[url('/grid-pattern.svg')] bg-[#020202] relative p-4 sm:p-10 flex items-center justify-center">
            <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-zinc-900 border border-zinc-700 text-zinc-500 font-mono text-[9px] px-2 py-1 rounded">VISTA EN VIVO</span>
                {format === "A" && <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-mono text-[9px] px-2 py-1 rounded animate-pulse">DRAG & DROP ACTIVO</span>}
            </div>

            <div 
                ref={canvasRef}
                // Proporción vertical tipo póster para ambas vistas
                className={`relative w-full max-w-[320px] rounded-xl overflow-hidden shadow-2xl border border-white/10 transition-all duration-300 ${format === "A" ? "aspect-[3/4]" : "h-[480px] flex flex-col"}`}
                style={format === "B" ? { backgroundColor: styleConfig.backgroundColor } : {}}
            >
                <div 
                    // En formato B, la imagen ocupa el 70% superior para darle proporción visual correcta
                    className={`relative w-full bg-zinc-900 flex items-center justify-center cursor-pointer group ${format === "A" ? "h-full" : "h-[70%]"}`}
                    onClick={onImageClick}
                >
                    {previewUrl ? (
                        <Image src={previewUrl} alt="Preview" fill sizes="(max-width: 640px) 280px, 320px" className="object-cover" />
                    ) : (
                        <span className="text-zinc-600 font-mono text-xs">+ CLICK: SUBIR IMAGEN</span>
                    )}
                    
                    <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black to-transparent pointer-events-none" style={{ opacity: styleConfig.gradientTopOpacity }} />
                    <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none" style={{ opacity: styleConfig.gradientBottomOpacity ?? 0.8 }} />
                </div>

                {format === "A" ? (
                    <motion.div 
                        drag 
                        dragConstraints={canvasRef}
                        dragElastic={0.2} 
                        dragTransition={{ bounceStiffness: 400, bounceDamping: 20 }} 
                        onDragEnd={handleDragEnd}
                        animate={{ 
                            left: `${styleConfig.positionX}%`, 
                            top: `${styleConfig.positionY}%`, 
                            x: "-50%", 
                            y: "-50%" 
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="absolute cursor-move flex flex-col items-center w-[90%] touch-none"
                        style={{ color: styleConfig.textColor }}
                    >
                        <h4 className={`text-2xl font-black uppercase text-center drop-shadow-md whitespace-pre-wrap break-words leading-tight w-full ${styleConfig.fontFamily}`}>
                            {title || "TÍTULO AQUÍ"}
                        </h4>
                    </motion.div>
                ) : (
                    // 🎨 FORMATO B: Alineación inteligente (Centrado si no hay desc., arriba si la hay)
                    <div className={`p-5 flex flex-col ${description ? 'justify-start text-left' : 'justify-center items-center text-center'} flex-1 relative z-10 w-full overflow-hidden`} style={{ color: styleConfig.textColor }}>
                        <h4 className={`text-xl font-black uppercase whitespace-pre-wrap break-words leading-tight w-full drop-shadow-md ${styleConfig.fontFamily} ${description ? 'mb-2' : 'mb-0'}`}>
                            {title || "TÍTULO AQUÍ"}
                        </h4>
                        {description && (
                            <p className={`text-xs opacity-80 whitespace-pre-wrap break-words leading-relaxed w-full ${styleConfig.fontFamily}`}>
                                {description}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}