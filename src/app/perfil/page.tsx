"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { usePerfil } from "./hooks/usePerfil";

import LoginCard from "./components/LoginCard";
import PerfilCard from "./components/PerfilCard";
import BiografiaEditor from "./components/BiografiaEditor";
import ShareProfileButton from "@/components/ui/ShareProfileButton";

export default function PerfilPage() {
    const [socialToast, setSocialToast] = useState<{ type: "ok" | "error"; msg: string } | null>(null);

    // Feedback del flujo OAuth de redes (viene de /api/social/callback -> ?social=ok|error)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const social = params.get("social");

        if (social === "ok") {
            setSocialToast({ type: "ok", msg: "Red vinculada correctamente." });
        } else if (social === "error") {
            setSocialToast({ type: "error", msg: "No se pudo vincular la red. Intenta de nuevo." });
        }

        if (social) {
            const url = new URL(window.location.href);
            url.searchParams.delete("social");
            window.history.replaceState({}, "", url.pathname + url.search);
        }

        const timer = setTimeout(() => setSocialToast(null), 5000);
        return () => clearTimeout(timer);
    }, []);

    const {
        session,
        user,
        dbId,
        tierLevel,
        socialLinks,
        customSlides,
        nameColorGradient,
        banner,
        biografia,
        guardando,
        isLoading, 
        guardarBiografia,
        setBiografia,
        cargarDatos,
        likesCount,
    } = usePerfil();

    if (!session) {
        return <LoginCard />;
    }

    // Renderizamos el Skeleton Cyberpunk mientras carga la BD
    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto px-6 py-12 space-y-8 font-sans">
                <div className="space-y-6">
                    <div className="flex justify-between items-end border-b border-neon/10 pb-3">
                        <div className="border-l-4 border-neon/30 pl-4 space-y-2">
                            <div className="h-6 w-48 bg-zinc-900 animate-pulse" />
                            <div className="h-3 w-32 bg-[#0a0a0a] animate-pulse" />
                        </div>
                    </div>
                    <div className="bg-[#050505] border border-white/5 h-96 shadow-[0_0_40px_rgba(0,0,0,0.8)]">
                        <div className="h-56 bg-zinc-900/50 w-full animate-pulse" />
                        <div className="px-8 relative -mt-16">
                            <div className="h-32 w-32 bg-zinc-900 border-2 border-neon/20 rounded-full animate-pulse" />
                            <div className="mt-4 space-y-3">
                                <div className="h-8 w-64 bg-zinc-900 animate-pulse" />
                                <div className="h-4 w-24 bg-neon-deep/30 animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const nombreFinal = user?.name || "Usuario";
    const imagenFinal = user?.image || "https://cdn.discordapp.com/embed/avatars/0.png";
    const discordIdFinal = user?.discordId || "";
    
    return (
        <div className="max-w-4xl mx-auto px-6 py-12 space-y-8 text-white font-sans">
            {socialToast && (
                <div
                    role="status"
                    className={`px-4 py-3 rounded-lg border text-sm font-mono ${
                        socialToast.type === "ok"
                            ? "bg-neon/10 border-neon/40 text-neon-bright"
                            : "bg-red-500/10 border-red-500/40 text-red-400"
                    }`}
                >
                    {socialToast.msg}
                </div>
            )}

            <PerfilCard
                banner={banner}
                imagen={imagenFinal}
                nombre={nombreFinal}
                discordId={discordIdFinal}
                tierLevel={tierLevel}
                socialLinks={socialLinks}
                likesCount={likesCount}
                customSlides={customSlides || []}
                nameColorGradient={nameColorGradient}
                onUpdate={cargarDatos}
                onSignOut={() => signOut()}
            />

            <BiografiaEditor
                biografia={biografia}
                guardando={guardando}
                onChange={setBiografia}
                onGuardar={guardarBiografia}
            />
        </div>
    );
}
