// src/components/ui/ShareProfileButton.tsx
"use client";
import { useState } from "react";

interface Props {
    discordUsername: string; // Exigimos el usuario de discord
    fullWidth?: boolean;     // Para que se adapte si está en el modal
}

export default function ShareProfileButton({ discordUsername, fullWidth = false }: Props) {
    const [copiado, setCopiado] = useState(false);

    const copiarEnlace = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation(); // Evita que se cierre el modal si hacemos clic
        
        const url = `${window.location.origin}/u/${discordUsername}`;
        navigator.clipboard.writeText(url);
        
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
    };

    return (
        <button 
            onClick={copiarEnlace}
            className={`group relative flex items-center justify-center gap-2 px-6 py-2 border transition-all duration-300 rounded font-mono text-xs font-bold uppercase tracking-widest overflow-hidden
                ${copiado 
                    ? "bg-emerald-500 text-black border-emerald-500" 
                    : "bg-white/5 text-zinc-300 border-white/10 hover:border-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-400"
                } ${fullWidth ? 'w-full' : ''}`}
        >
            {copiado ? (
                <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    <span>Nodo Copiado</span>
                </>
            ) : (
                <>
                    <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                    <span>Copiar Enlace</span>
                </>
            )}
        </button>
    );
}