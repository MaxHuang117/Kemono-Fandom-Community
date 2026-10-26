"use client";

import { useState } from "react";
import type { NetworkConfig } from "@/config/networks.config";

interface Props {
    config: NetworkConfig;
    value: string;
    onChange: (val: string) => void;
    onRemove: () => void; // <-- Añadimos la función para quitar la tarjeta entera
}

export default function NetworkCard({ config, value, onChange, onRemove }: Props) {
    const [isFocused, setIsFocused] = useState(false);
    const isConnected = value.length > 0;

    const neonStyle = {
        borderColor: isFocused ? config.color : (isConnected ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)'),
        boxShadow: isFocused ? `0 0 15px ${config.color}33` : 'none',
        backgroundColor: isConnected || isFocused ? '#0a0a0a' : '#050505',
    } as React.CSSProperties;

    return (
        <div style={neonStyle} className="group flex items-center border rounded-xl overflow-hidden transition-all duration-300">
            {/* ICONO */}
            <div 
                style={{ 
                    color: isFocused ? config.color : (isConnected ? '#f4f4f5' : '#52525b'),
                    backgroundColor: isFocused ? `${config.color}10` : 'transparent'
                }} 
                className="p-4 flex items-center justify-center border-r border-white/5 transition-colors duration-300 shrink-0"
            >
                {config.icon}
            </div>
            
            {/* TEXTOS Y CONTROLES */}
            <div className="flex-1 flex flex-col justify-center px-4 py-2.5 relative">
                <div className="flex justify-between items-center mb-1.5">
                    
                    <span 
                        className="text-[10px] font-mono tracking-widest uppercase flex items-center gap-1.5 transition-colors" 
                        style={{ color: isFocused ? config.color : '#a1a1aa' }}
                    >
                        {config.label}
                        {isConnected && <span style={{ backgroundColor: config.color, boxShadow: `0 0 8px ${config.color}80` }} className="w-1.5 h-1.5 rounded-full" />}
                    </span>
                    
                    <div className="flex items-center gap-2">
                        {(isFocused || isConnected) && (
                            <span className={`text-[9px] font-mono ${value.length >= config.maxLength ? 'text-red-400' : 'text-zinc-500'}`}>
                                {value.length}/{config.maxLength}
                            </span>
                        )}
                        {/* Botón de Quitar Etiqueta */}
                        <button 
                            type="button" 
                            onClick={onRemove} 
                            className="text-zinc-600 hover:text-red-400 transition-colors bg-zinc-900/50 hover:bg-red-950 rounded-full p-1 ml-1" 
                            title="Quitar esta red"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
                
                {/* INPUT MÁS GRANDE (text-sm) */}
                <input
                    type="text"
                    value={value}
                    maxLength={config.maxLength}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={config.placeholder}
                    className="w-full bg-transparent text-sm text-white placeholder:text-zinc-600 outline-none font-sans"
                />
            </div>
        </div>
    );
}