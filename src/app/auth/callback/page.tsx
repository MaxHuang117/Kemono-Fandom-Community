"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { vincularRedSocialAction } from "@/app/perfil/actions";
import { obtenerHandleYouTubeAction } from "@/actions/youtube.action";
import { motion } from "framer-motion";

// Cliente estándar para interceptar el token temporal.
// `flowType: 'pkce'` para que el redirect use `?code=` (no `#access_token=`).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        flowType: 'pkce',
    },
});

/*
|--------------------------------------------------------------------------
| Mapeo proveedor Supabase → clave de plataforma interna
|--------------------------------------------------------------------------
| El proveedor se obtiene de `app_metadata.provider` (firmado por Supabase),
| NO de la URL. Esto evita que un usuario cambie `?provider=` para guardar
| su cuenta en la red equivocada.
|--------------------------------------------------------------------------
*/
const PROVIDER_MAP: Record<string, string> = {
    twitter: "x",
    twitch: "twitch",
    github: "github",
    google: "youtube",
};

function AuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Si Supabase falla antes de llegar aquí, lo reflejamos
    const urlError = searchParams.get("error_description");

    const [status, setStatus] = useState("Verificando identidad...");
    const [progress, setProgress] = useState(10);
    const [errorMsg, setErrorMsg] = useState<string | null>(urlError || null);
    const processed = useRef(false);

    useEffect(() => {
        if (processed.current || urlError) return;
        processed.current = true;

        const secureAuth = async () => {
            try {
                setProgress(30);
                setStatus("Leyendo sesión OAuth...");
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) throw error;
                if (!session) throw new Error("Token expirado o inválido.");

                // 🔒 Proveedor real desde la sesión (anti-suplantación)
                const supabaseProvider: string | undefined =
                    session.user?.app_metadata?.provider;

                const platformKey = supabaseProvider
                    ? PROVIDER_MAP[supabaseProvider]
                    : undefined;

                if (!platformKey) {
                    throw new Error(`Proveedor no soportado: ${supabaseProvider || "desconocido"}.`);
                }

                const metadata = session.user.user_metadata || {};

                setProgress(55);
                setStatus("Extrayendo tu usuario público...");

                let username: string | null = null;

                if (platformKey === "youtube") {
                    // YouTube: el handle real requiere YouTube Data API
                    const token = session.provider_token;
                    const yt = await obtenerHandleYouTubeAction(token || "");
                    if (yt.error || !yt.handle) {
                        throw new Error(yt.error || "No se pudo obtener el canal de YouTube.");
                    }
                    username = yt.handle;
                } else if (platformKey === "x") {
                    username = metadata.preferred_username || null;
                } else if (platformKey === "twitch") {
                    username = metadata.preferred_username || null;
                } else if (platformKey === "github") {
                    username = metadata.user_name || metadata.login || null;
                }

                if (!username) {
                    throw new Error("La red no proporcionó un nombre público válido.");
                }

                setProgress(80);
                setStatus(`Vinculando @${username} a tu perfil...`);

                const result = await vincularRedSocialAction(platformKey, username);
                if (!result.success) throw new Error(result.error);

                // 🛡️ Destruir la sesión temporal de Supabase
                setProgress(95);
                setStatus("Cerrando sesión temporal...");
                await supabase.auth.signOut();

                setProgress(100);
                setStatus("Red verificada.");
                setTimeout(() => router.push("/perfil"), 1200);
            } catch (err: any) {
                console.error(err);
                setErrorMsg(err.message || "Fallo en la verificación.");
                await supabase.auth.signOut();
                setTimeout(() => router.push("/perfil"), 4000);
            }
        };

        secureAuth();
    }, [router, urlError]);

    return (
        <div className="min-h-screen bg-[#020202] bg-[url('/grid-pattern.svg')] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-zinc-950 border border-zinc-800 p-8 rounded-2xl shadow-2xl relative overflow-hidden"
            >
                {/* Glow de fondo */}
                <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[80px] ${errorMsg ? 'bg-red-500/20' : 'bg-neon/20'}`} />

                <h2 className="text-zinc-300 font-mono text-xs tracking-[0.3em] uppercase mb-8 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full motion-safe:animate-pulse ${errorMsg ? 'bg-red-500' : 'bg-neon'}`} />
                    Verificación de red
                </h2>

                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between text-[10px] font-mono mb-2 uppercase tracking-widest text-zinc-500">
                            <span>{errorMsg ? 'Verificación cancelada' : status}</span>
                            <span>{progress}%</span>
                        </div>

                        <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                            <motion.div
                                className={`h-full ${errorMsg ? 'bg-red-500' : 'bg-neon'}`}
                                initial={{ width: "0%" }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                    </div>

                    {errorMsg && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-red-950/30 border border-red-900/50 rounded-lg">
                            <p className="text-red-400 font-mono text-[10px] uppercase tracking-wider">{errorMsg.replace(/\+/g, ' ')}</p>
                            <p className="text-red-500/50 font-mono text-[9px] mt-2">Redirigiendo a tu perfil...</p>
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
