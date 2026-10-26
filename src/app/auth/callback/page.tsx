"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { vincularRedSocialAction } from "@/app/perfil/actions";
import { motion } from "framer-motion";

// Cliente estándar para interceptar el token temporal
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function AuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const provider = searchParams.get("provider") || "red_social";
    
    // Si Supabase falla desde antes (como tu error de base de datos), lo atrapamos aquí
    const urlError = searchParams.get("error_description");

    const [status, setStatus] = useState("INTERCEPTANDO TOKEN DE SEGURIDAD...");
    const [progress, setProgress] = useState(10);
    const [errorMsg, setErrorMsg] = useState<string | null>(urlError || null);
    const processed = useRef(false);

    useEffect(() => {
        if (processed.current || urlError) return;
        processed.current = true;

        const secureAuth = async () => {
            try {
                setProgress(30);
                setStatus("DESENCRIPTANDO IDENTIDAD (ZERO-TRUST)...");
                const { data: { session }, error } = await supabase.auth.getSession();
                
                if (error) throw error;
                if (!session) throw new Error("Token expirado o inválido.");

                setProgress(60);
                setStatus("EXTRAYENDO HANDLE OFICIAL...");
                const metadata = session.user.user_metadata;
                
                // Extraemos el nombre dependiendo de qué red sea
                const username = metadata.preferred_username || metadata.user_name || metadata.name || metadata.full_name;
                if (!username) throw new Error("La red no proporcionó un nombre público válido.");

                setProgress(80);
                setStatus(`VINCULANDO @${username.toUpperCase()} AL PERFIL...`);
                
                const result = await vincularRedSocialAction(provider, username);
                if (!result.success) throw new Error(result.error);

                // 🛡️ EL BLINDAJE: DESTRUIR TOKEN Y SESIÓN TEMPORAL
                setProgress(95);
                setStatus("DESTRUYENDO RASTROS DEL TOKEN (ANTI-HACK)...");
                await supabase.auth.signOut();

                setProgress(100);
                setStatus("¡IDENTIDAD VERIFICADA Y BLINDADA!");
                setTimeout(() => router.push("/perfil"), 1500);

            } catch (err: any) {
                console.error(err);
                setErrorMsg(err.message || "Fallo crítico en la intercepción.");
                await supabase.auth.signOut();
                setTimeout(() => router.push("/perfil"), 4000);
            }
        };

        secureAuth();
    }, [provider, router, urlError]);

    return (
        <div className="min-h-screen bg-[#020202] bg-[url('/grid-pattern.svg')] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-zinc-950 border border-zinc-800 p-8 rounded-2xl shadow-2xl relative overflow-hidden"
            >
                {/* Glow de fondo */}
                <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[80px] ${errorMsg ? 'bg-red-500/20' : 'bg-emerald-500/20'}`} />
                
                <h2 className="text-zinc-300 font-mono text-xs tracking-[0.3em] uppercase mb-8 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full animate-pulse ${errorMsg ? 'bg-red-500' : 'bg-emerald-500'}`} />
                    Terminal de Verificación
                </h2>

                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between text-[10px] font-mono mb-2 uppercase tracking-widest text-zinc-500">
                            <span>{errorMsg ? 'PROTOCOLO ABORTADO' : status}</span>
                            <span>{progress}%</span>
                        </div>
                        
                        <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                            <motion.div 
                                className={`h-full ${errorMsg ? 'bg-red-500' : 'bg-emerald-500'}`}
                                initial={{ width: "0%" }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                    </div>

                    {errorMsg && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-red-950/30 border border-red-900/50 rounded-lg">
                            <p className="text-red-400 font-mono text-[10px] uppercase tracking-wider">{errorMsg.replace(/\+/g, ' ')}</p>
                            <p className="text-red-500/50 font-mono text-[9px] mt-2">Revise los Triggers de Supabase. Redirigiendo a zona segura...</p>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-[#020202] bg-[url('/grid-pattern.svg')] flex items-center justify-center p-4">
                    <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">
                        Cargando verificación...
                    </p>
                </div>
            }
        >
            <AuthCallbackContent />
        </Suspense>
    );
}
