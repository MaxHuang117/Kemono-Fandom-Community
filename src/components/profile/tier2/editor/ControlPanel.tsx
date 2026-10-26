"use client";

import type { SlideFormat, SlideStyleConfig } from "@/types/slides";
import { VIP_FONTS } from "@/types/slides";

interface Props {
    format: SlideFormat;
    setFormat: (f: SlideFormat) => void;
    title: string;
    setTitle: (t: string) => void;
    description: string;
    setDescription: (d: string) => void;
    networkKey: string;
    setNetworkKey: (k: string) => void;
    activeNetworks: { key: string; label: string }[];
    styleConfig: SlideStyleConfig;
    onStyleChange: (updates: Partial<SlideStyleConfig>) => void;
    onSave: () => void;
    isSaving: boolean;
    onClose: () => void;
    slotId: number;
}

const TooltipInfo = ({ text }: { text: string }) => (
    <div className="group relative inline-flex items-center justify-center ml-2">
        <button type="button" className="flex items-center justify-center w-4 h-4 rounded-full border border-zinc-600 text-zinc-500 text-[10px] font-bold hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-500/10 focus:outline-none focus:border-emerald-500 focus:text-emerald-500 focus:bg-emerald-500/10 transition-colors">?</button>
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 p-3 bg-[#111] border border-zinc-700 text-zinc-300 text-[10px] leading-relaxed font-sans font-normal normal-case rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all z-50 text-center shadow-2xl">
            {text}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-zinc-700" />
        </div>
    </div>
);

// SUB-COMPONENTE OPTIMIZADO PARA SLIDERS
const GradientSlider = ({ label, tooltip, value, onChange }: { label: string, tooltip: string, value: number, onChange: (v: number) => void }) => (
    <div className="space-y-2 pt-2">
        <div className="flex justify-between items-center">
            <span className="flex items-center gap-1 text-[10px] font-mono text-zinc-500">
                {label} <TooltipInfo text={tooltip} />
            </span>
            <span className="text-[10px] text-emerald-500 font-mono">{Math.round((value || 0) * 100)}%</span>
        </div>
        <input type="range" min="0" max="1" step="0.1" value={value || 0} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full accent-emerald-500" />
    </div>
);

export default function ControlPanel(props: Props) {
    const { format, styleConfig, onStyleChange } = props;

    return (
        <div className="w-full md:w-[45%] h-[50vh] md:h-full bg-[#070707] flex flex-col relative">
            <div className="flex justify-between items-center p-5 border-b border-white/5 bg-[#030303] z-10">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <h3 className="text-white font-mono font-bold tracking-widest text-xs uppercase">
                        SLOT_0{props.slotId} <span className="text-zinc-600 font-normal">/ EDITAR</span>
                    </h3>
                </div>
                <button onClick={props.onClose} disabled={props.isSaving} className="text-zinc-500 hover:text-red-400 font-mono text-[10px] tracking-widest uppercase transition-colors px-2 py-1 border border-transparent hover:border-red-900/50 rounded">[ CERRAR ]</button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-10 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                
{/* 1. FORMATO */}
                <div className="space-y-4">
                    <label className="flex items-center gap-1 text-[10px] font-mono text-zinc-500 tracking-widest uppercase">
                        <span className="text-emerald-500/50">01.</span> Arquitectura Base
                        <TooltipInfo text="El estilo A (Cinematográfico) es imagen completa con texto libre. El estilo B (Banner) separa una foto arriba y un panel de lectura abajo." />
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => props.setFormat("A")} 
                            className={`group relative overflow-hidden p-4 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all duration-300 flex flex-col items-center justify-center gap-3 ${format === "A" ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]" : "border-white/5 bg-black text-zinc-500 hover:border-white/20 hover:text-zinc-300"}`}
                        >
                            {/* ÍCONO A: Imagen completa con texto central */}
                            <svg className="w-8 h-10 opacity-70 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 32" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <rect x="2" y="2" width="20" height="28" rx="3" />
                                <line x1="6" y1="16" x2="18" y2="16" strokeWidth="2" className={format === "A" ? "stroke-emerald-400" : "stroke-zinc-500"} />
                                <circle cx="12" cy="16" r="1" fill="currentColor" stroke="none" />
                            </svg>
                            A: Cinemático
                        </button>
                        
                        <button 
                            onClick={() => props.setFormat("B")} 
                            className={`group relative overflow-hidden p-4 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all duration-300 flex flex-col items-center justify-center gap-3 ${format === "B" ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]" : "border-white/5 bg-black text-zinc-500 hover:border-white/20 hover:text-zinc-300"}`}
                        >
                            {/* ÍCONO B: Imagen arriba, caja sólida abajo con líneas de texto */}
                            <svg className="w-10 h-10 opacity-70 group-hover:opacity-100 transition-opacity" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <rect x="2" y="2" width="28" height="28" rx="3" />
                                <path d="M2 18h28v9a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-9z" fill="currentColor" fillOpacity="0.2" className={format === "B" ? "text-emerald-400" : "text-zinc-500"} stroke="none" />
                                <line x1="2" y1="18" x2="30" y2="18" />
                                <line x1="6" y1="22" x2="20" y2="22" strokeWidth="2" className={format === "B" ? "stroke-emerald-400" : "stroke-zinc-500"} />
                                <line x1="6" y1="26" x2="26" y2="26" />
                            </svg>
                            B: Banner Info
                        </button>
                    </div>
                </div>

                {/* 2. CONTENIDO */}
                <div className="space-y-4">
                    <label className="flex items-center gap-1 text-[10px] font-mono text-zinc-500 tracking-widest uppercase">
                        <span className="text-emerald-500/50">02.</span> Redirección & Datos
                    </label>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                        {props.activeNetworks.length === 0 ? (
                            <span className="text-xs font-mono text-red-400 bg-red-500/10 px-3 py-1.5 rounded border border-red-500/20">NO HAY REDES CONECTADAS</span>
                        ) : (
                            props.activeNetworks.map(net => (
                                <button key={net.key} onClick={() => props.setNetworkKey(net.key)} className={`px-4 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${props.networkKey === net.key ? "bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.4)]" : "bg-[#111] text-zinc-400 border border-white/5 hover:border-white/20"}`}>
                                    {net.label}
                                </button>
                            ))
                        )}
                    </div>

                    <div className="space-y-3">
                        <div className="relative group">
                            <span className="absolute left-4 top-4 text-emerald-500 font-mono text-sm opacity-50 group-focus-within:opacity-100 transition-opacity">&gt;</span>
                            <textarea 
                                value={props.title} 
                                onChange={(e) => props.setTitle(e.target.value)} 
                                maxLength={20} // LÍMITE: 20 Caracteres
                                placeholder="TÍTULO_DEL_SLIDE" 
                                rows={2} 
                                className="w-full bg-black border border-white/5 focus:border-emerald-500/50 focus:bg-emerald-950/10 pl-9 pr-4 py-4 text-xs text-white font-mono outline-none transition-all rounded-lg resize-y min-h-[60px]" 
                            />
                            {/* Contador Visual Título */}
                            <span className={`absolute right-4 bottom-3 text-[9px] font-mono transition-colors ${props.title.length >= 20 ? 'text-red-400' : 'text-zinc-600'}`}>
                                {props.title.length}/20
                            </span>
                        </div>

                        {format === "B" && (
                            <div className="relative group">
                                <span className="absolute left-4 top-4 text-emerald-500 font-mono text-sm opacity-50 group-focus-within:opacity-100 transition-opacity">&gt;</span>
                                <textarea 
                                    value={props.description} 
                                    onChange={(e) => props.setDescription(e.target.value)} 
                                    maxLength={30} // LÍMITE: 30 Caracteres
                                    placeholder="Descripción breve..." 
                                    rows={3} 
                                    className="w-full bg-black border border-white/5 focus:border-emerald-500/50 focus:bg-emerald-950/10 pl-9 pr-4 py-4 text-xs text-white font-mono outline-none transition-all rounded-lg resize-y min-h-[80px]" 
                                />
                                {/* Contador Visual Descripción */}
                                <span className={`absolute right-4 bottom-3 text-[9px] font-mono transition-colors ${props.description.length >= 30 ? 'text-red-400' : 'text-zinc-600'}`}>
                                    {props.description.length}/30
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. ESTILOS */}
                <div className="space-y-4">
                    <label className="flex items-center gap-1 text-[10px] font-mono text-zinc-500 tracking-widest uppercase">
                        <span className="text-emerald-500/50">03.</span> Estilización Visual
                    </label>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black border border-white/5 p-3 rounded-lg flex flex-col gap-2">
                            <span className="text-[9px] font-mono text-zinc-500">COLOR TEXTO</span>
                            <div className="flex items-center gap-2">
                                <div className="relative w-6 h-6 rounded overflow-hidden border border-white/20 shrink-0">
                                    <input type="color" value={styleConfig.textColor} onChange={(e) => onStyleChange({ textColor: e.target.value })} className="absolute -top-2 -left-2 w-10 h-10 cursor-pointer" />
                                </div>
                                <input type="text" value={styleConfig.textColor} onChange={(e) => onStyleChange({ textColor: e.target.value })} className="w-full bg-transparent text-xs text-white font-mono outline-none uppercase" />
                            </div>
                        </div>

                        {format === "B" && (
                            <div className="bg-black border border-white/5 p-3 rounded-lg flex flex-col gap-2">
                                <span className="flex items-center gap-1 text-[9px] font-mono text-zinc-500">COLOR FONDO <TooltipInfo text="Color de la caja inferior que contiene el texto de tu banner." /></span>
                                <div className="flex items-center gap-2">
                                    <div className="relative w-6 h-6 rounded overflow-hidden border border-white/20 shrink-0">
                                        <input type="color" value={styleConfig.backgroundColor} onChange={(e) => onStyleChange({ backgroundColor: e.target.value })} className="absolute -top-2 -left-2 w-10 h-10 cursor-pointer" />
                                    </div>
                                    <input type="text" value={styleConfig.backgroundColor} onChange={(e) => onStyleChange({ backgroundColor: e.target.value })} className="w-full bg-transparent text-xs text-white font-mono outline-none uppercase" />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3 pt-2">
                        <span className="text-[9px] font-mono text-zinc-500">LIBRERÍA VIP FONTS</span>
                        <div className="grid grid-cols-2 gap-2">
                            {VIP_FONTS.map(font => (
                                <button key={font.id} onClick={() => onStyleChange({ fontFamily: font.id })} className={`py-3 px-2 rounded-lg text-xs transition-all ${font.id} ${styleConfig.fontFamily === font.id ? "border border-emerald-500 bg-emerald-500/10 text-emerald-400" : "border border-white/5 bg-black text-zinc-400 hover:border-white/20"}`}>{font.label}</button>
                            ))}
                        </div>
                    </div>

                    {/* SLIDERS OPTIMIZADOS REUTILIZABLES */}
                    <div className="space-y-4 pt-4 border-t border-white/5">
                        <GradientSlider 
                            label="SOMBRA SUPERIOR" 
                            tooltip="Oscurece la parte de arriba de la imagen para que destaque el borde."
                            value={styleConfig.gradientTopOpacity} 
                            onChange={(v) => onStyleChange({ gradientTopOpacity: v })} 
                        />
                        <GradientSlider 
                            label="SOMBRA INFERIOR" 
                            tooltip="Añade un fondo oscuro detrás del texto para hacerlo legible en imágenes brillantes."
                            value={styleConfig.gradientBottomOpacity ?? 0.8} 
                            onChange={(v) => onStyleChange({ gradientBottomOpacity: v })} 
                        />
                    </div>
                </div>
            </div>

            <div className="p-5 border-t border-white/5 bg-[#030303] z-10">
                <button onClick={props.onSave} disabled={props.isSaving} className="relative w-full overflow-hidden py-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest text-xs transition-all duration-300 disabled:opacity-50 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] group">
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        {props.isSaving ? <span className="animate-pulse">SINCRONIZANDO CON EL NODO...</span> : <><span>[ GUARDAR CONFIGURACIÓN ]</span><svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></>}
                    </span>
                </button>
            </div>
        </div>
    );
}