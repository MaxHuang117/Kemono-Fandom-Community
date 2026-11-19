"use client";

interface Props {
    biografia: string;
    guardando: boolean;
    onChange: (value: string) => void;
    onGuardar: () => void;
}

/*
|--------------------------------------------------------------------------
| BiografiaEditor (Fase 3)
|--------------------------------------------------------------------------
| Rediseñado para concordar con el estilo y colores del resto del perfil:
| cabecera con acento neón (como los acordeones), tipografía mono y foco
| neón en el textarea. La biografía es multi-línea (Shift+Enter).
|--------------------------------------------------------------------------
*/
export default function BiografiaEditor({ biografia, guardando, onChange, onGuardar }: Props) {
    return (
        <div className="rounded-2xl border border-white/5 bg-[#0d0d0d] shadow-xl shadow-black/50 overflow-hidden font-sans">
            {/* Cabecera con acento neón (coherente con los acordeones) */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5 bg-[#0a0a0a]">
                <span className="font-mono text-[10px] tracking-widest text-neon">Perfil</span>
                <h3 className="text-xs font-mono uppercase tracking-widest text-white">Biografía</h3>
                <div className="flex-1 h-[1px] bg-gradient-to-r from-neon/20 to-transparent" />
                <span className={`text-[11px] font-mono ${biografia.length >= 200 ? "text-red-400" : "text-zinc-500"}`}>
                    {biografia.length} / 200
                </span>
            </div>

            <div className="p-5 space-y-4">
                <textarea
                    value={biografia}
                    onChange={(e) => onChange(e.target.value)}
                    maxLength={200}
                    placeholder="Escribe tu biografía pública… (usa Shift+Enter para saltos de línea)"
                    className="w-full min-h-[110px] max-h-[180px] resize-y rounded-xl bg-[#080808] border border-white/5 p-4 text-gray-300 placeholder-gray-700 focus:outline-none focus:border-neon/50 focus:shadow-[0_0_0_1px_rgba(97,255,97,0.3)] transition font-mono text-sm leading-relaxed"
                />
                <div className="flex justify-end">
                    <button
                        onClick={onGuardar}
                        disabled={guardando}
                        className="w-full sm:w-auto rounded-xl bg-neon hover:bg-neon-bright disabled:opacity-50 text-black font-black uppercase tracking-widest text-xs px-6 py-3 transition"
                    >
                        {guardando ? "Sincronizando..." : "Aplicar Cambios"}
                    </button>
                </div>
            </div>
        </div>
    );
}
