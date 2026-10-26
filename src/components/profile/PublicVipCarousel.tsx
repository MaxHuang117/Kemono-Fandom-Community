"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import type { CustomSlide } from "@/types/slides";

interface Props {
    slides: CustomSlide[];
}

export default function PublicVipCarousel({ slides }: Props) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Filtramos solo los slides válidos (que tengan imagen)
    const validSlides = slides.filter(s => s.image_url);
    if (validSlides.length === 0) return null; // No renderiza nada si no hay tarjetas

    // 🔄 LÓGICA DE NAVEGACIÓN (Bucle)
    const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % validSlides.length);
    const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + validSlides.length) % validSlides.length);

    return (
        <div className="w-full mt-10 mb-6 font-sans relative">
            
            {/* Título de Sección */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-xs font-mono text-emerald-500 tracking-widest uppercase">
                    Tarjetas VIP
                </h3>
                <div className="flex-1 h-[1px] bg-gradient-to-r from-emerald-500/20 to-transparent" />
            </div>

            {/* 🎭 CONTENEDOR COVER FLOW (3D) */}
            <div className="relative w-full h-[350px] sm:h-[450px] flex items-center justify-center overflow-hidden rounded-xl bg-[#030303] border border-white/5 shadow-inner">                
                {/* 🌫️ DEGRADADOS LATERALES (Oscurecen los slides que no están en el centro) */}
                <div className="absolute top-0 left-0 w-16 sm:w-32 h-full bg-gradient-to-r from-[#020202] via-[#020202]/80 to-transparent z-30 pointer-events-none" />
                <div className="absolute top-0 right-0 w-16 sm:w-32 h-full bg-gradient-to-l from-[#020202] via-[#020202]/80 to-transparent z-30 pointer-events-none" />

                {/* 🎮 CONTROLES (Solo aparecen si hay más de 1 slide) */}
                {validSlides.length > 1 && (
                    <>
                        <button onClick={prevSlide} className="absolute left-2 sm:left-6 z-40 p-2 bg-black/50 hover:bg-black/80 border border-white/10 hover:border-emerald-500 hover:text-emerald-400 text-zinc-300 rounded-full backdrop-blur-md transition-all">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button onClick={nextSlide} className="absolute right-2 sm:right-6 z-40 p-2 bg-black/50 hover:bg-black/80 border border-white/10 hover:border-emerald-500 hover:text-emerald-400 text-zinc-300 rounded-full backdrop-blur-md transition-all">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </>
                )}

                {/* 🎴 RENDERIZADO DE SLIDES */}
                {validSlides.map((slide, index) => {
                    // Matemáticas para posicionar los slides (-1 Izquierda, 0 Centro, 1 Derecha)
                    let offset = index - currentIndex;
                    if (validSlides.length >= 3) {
                        if (offset < -1) offset += validSlides.length;
                        if (offset > 1) offset -= validSlides.length;
                    }

                    const isCenter = offset === 0;
                    const style = slide.style_config || {};

                    // Contenido del Slide (Renderiza el Formato A o B según corresponda)
                    const SlideContent = (
                        <div className="w-full h-full relative group/slide">
                            {slide.format === "A" ? (
                                // 🎨 FORMATO A 
                                <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
                                    <Image src={slide.image_url} alt={slide.title} fill sizes="(max-width: 640px) 280px, 400px" className="object-cover opacity-80 group-hover/slide:opacity-100 group-hover/slide:scale-105 transition-all duration-700" />
                                    
                                    <div className="absolute top-0 inset-x-0 h-1/3 bg-gradient-to-b from-black to-transparent pointer-events-none" style={{ opacity: style.gradientTopOpacity ?? 0.8 }} />
                                    <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" style={{ opacity: style.gradientBottomOpacity ?? 0.8 }} />
                                    
                                    <div className="absolute w-[90%] flex flex-col items-center" style={{ left: `${style.positionX}%`, top: `${style.positionY}%`, transform: 'translate(-50%, -50%)', color: style.textColor }}>
                                        {/* AÑADIDO: whitespace-pre-wrap y break-words */}
                                        <h4 className={`text-xl sm:text-3xl font-black uppercase text-center drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] whitespace-pre-wrap break-words leading-tight w-full ${style.fontFamily || 'font-sans'}`}>
                                            {slide.title}
                                        </h4>
                                    </div>
                                </div>

                            ) : (
                                // 🎨 FORMATO B (Dossier: Optimizado)
                                <div className="relative w-full h-full flex flex-col overflow-hidden" style={{ backgroundColor: style.backgroundColor ?? '#050505' }}>
                                    {/* Imagen: Ahora ocupa el 70-75% del alto */}
                                    <div className="relative w-full h-[70%] sm:h-[75%] bg-black border-b border-white/10 overflow-hidden">
                                        <Image src={slide.image_url} alt={slide.title} fill sizes="(max-width: 640px) 280px, 400px" className="object-cover opacity-80 group-hover/slide:opacity-100 group-hover/slide:scale-105 transition-all duration-700" />
                                        <div className="absolute top-0 inset-x-0 h-1/3 bg-gradient-to-b from-black to-transparent pointer-events-none" style={{ opacity: style.gradientTopOpacity ?? 0.8 }} />
                                    </div>
                                    
                                    {/* Texto: Alineación inteligente (Centrado si no hay descripción) */}
                                    <div className={`p-4 sm:p-5 flex flex-col ${slide.description ? 'justify-start text-left' : 'justify-center items-center text-center'} flex-1 w-full`} style={{ color: style.textColor }}>
                                        <h4 className={`text-xl sm:text-2xl font-black uppercase whitespace-pre-wrap break-words leading-tight w-full drop-shadow-md ${style.fontFamily || 'font-sans'} ${slide.description ? 'mb-2' : 'mb-0'}`}>
                                            {slide.title}
                                        </h4>
                                        {slide.description && (
                                            <p className={`text-sm sm:text-base opacity-80 whitespace-pre-wrap break-words leading-relaxed w-full ${style.fontFamily || 'font-sans'}`}>
                                                {slide.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* 🔗 ICONO DE REDIRECCIÓN EXTERNA */}
                            {slide.network_key && isCenter && (
                                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md border border-white/10 p-2 rounded shadow-lg opacity-0 group-hover/slide:opacity-100 transition-opacity duration-300 flex items-center gap-2">
                                    <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest">IR AL ENLACE</span>
                                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                </div>
                            )}
                        </div>
                    );

                    return (
                        <motion.div
                            key={slide.id}
                            initial={false}
                            animate={{
                                // Posición X: El del centro va a 0%, los de los lados se apartan
                                x: isCenter ? "0%" : `${offset * 85}%`,
                                // Escala: El del centro es grande (1), los de los lados se achican (0.8)
                                scale: isCenter ? 1 : 0.8,
                                // Z-Index: El del centro pasa por encima
                                zIndex: isCenter ? 20 : 10,
                                // Opacidad: Los de los lados se transparentan un poco
                                opacity: isCenter ? 1 : 0.4,
                                // Blur: Los de los lados se desenfocan para simular profundidad
                                filter: isCenter ? "blur(0px)" : "blur(2px)",
                            }}
                            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            className="absolute w-[280px] sm:w-[400px] h-[90%] sm:h-[95%] rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.9)] overflow-hidden cursor-pointer"
                            onClick={() => !isCenter && setCurrentIndex(index)} // Si haces clic en uno de los lados, se centra automáticamente
                        >
                            {/* Si es el centro y tiene enlace, envuelve todo en un <Link>. Si no, renderiza el div. */}
                            {isCenter && slide.network_key ? (
                                <Link href={slide.network_key} target="_blank" rel="noopener noreferrer" className="w-full h-full block">
                                    {SlideContent}
                                </Link>
                            ) : (
                                SlideContent
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}