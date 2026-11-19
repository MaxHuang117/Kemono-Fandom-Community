"use client";

import { useEffect, useState } from "react";
import { toggleProfileReputationAction, obtenerEstadoReputacionAction } from "@/app/perfil/actions";

interface Props {
    /** Identificador del perfil objetivo: discord_id (snowflake) o username. */
    receiverSelector: string;
    /** Contador inicial de reputación (se sincroniza cuando cambie). */
    initialLikes: number;
    /** Si el visitante tiene sesión; sin sesión se muestra un aviso. */
    isAuthenticated?: boolean;
    /** "sm" para el modal, "md" para la página de perfil. */
    size?: "sm" | "md";
    className?: string;
}

/*
|--------------------------------------------------------------------------
| ProfileReputationButton
|--------------------------------------------------------------------------
| Botón de reputación (like) reutilizable. Encapsula el estado y las
| Server Actions con actualización optimista y reversión en error. Se usa en
| /u/[id] (página) y en UserProfileModal (home).
|--------------------------------------------------------------------------
*/
export default function ProfileReputationButton({
    receiverSelector,
    initialLikes,
    isAuthenticated = true,
    size = "md",
    className = "",
}: Props) {
    const [isLiking, setIsLiking] = useState(false);
    const [likes, setLikes] = useState(initialLikes);
    const [hasLiked, setHasLiked] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Sincroniza el contador cuando el perfil padre termina de cargar.
    useEffect(() => {
        setLikes(initialLikes);
    }, [initialLikes]);

    // Consulta si el usuario actual ya dio reputación a este perfil.
    useEffect(() => {
        if (!receiverSelector || !isAuthenticated) return;
        let active = true;
        (async () => {
            const res = await obtenerEstadoReputacionAction(receiverSelector);
            if (active && res && !("error" in res)) {
                setHasLiked(res.hasLiked);
            }
        })();
        return () => {
            active = false;
        };
    }, [receiverSelector, isAuthenticated]);

    const handleToggle = async (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        if (!receiverSelector) return;
        if (!isAuthenticated) {
            setError("Inicia sesión para dar reputación.");
            return;
        }
        if (isLiking) return;

        setIsLiking(true);
        setError(null);

        const prevLikes = likes;
        const prevLiked = hasLiked;

        // Actualización optimista.
        setHasLiked(!prevLiked);
        setLikes(prevLiked ? prevLikes - 1 : prevLikes + 1);

        const res = await toggleProfileReputationAction(receiverSelector);

        if (res.error) {
            // Revierte si el backend lo bloquea (cuenta nueva, auto-like, etc).
            setHasLiked(prevLiked);
            setLikes(prevLikes);
            setError(res.error);
        }

        setIsLiking(false);
    };

    const isSm = size === "sm";

    return (
        <div className={`inline-flex flex-col items-center ${className}`}>
            <button
                type="button"
                onClick={handleToggle}
                disabled={isLiking}
                aria-pressed={hasLiked}
                aria-disabled={isLiking}
                aria-label={hasLiked ? "Quitar reputación" : "Dar reputación"}
                title={hasLiked ? "Quitar reputación" : "Dar reputación"}
                className={`group flex items-center gap-1.5 rounded border transition-all duration-300 shadow-[0_0_10px_rgba(239,68,68,0.1)] ${
                    isSm ? "px-2.5 py-0.5" : "px-4 py-1.5"
                } ${
                    hasLiked
                        ? "bg-red-500/10 border-red-500/50 text-red-400"
                        : "bg-[#0a0a0a] border-white/10 hover:border-red-500/30 text-zinc-400 hover:text-red-400"
                } ${isLiking ? "opacity-50 cursor-not-allowed" : ""}`}
            >
                <svg
                    className={`${isSm ? "w-3 h-3" : "w-4 h-4"} transition-transform duration-300 ${
                        hasLiked ? "fill-red-400 scale-110" : "fill-transparent stroke-current stroke-2 group-hover:scale-110"
                    }`}
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
                <span className={`${isSm ? "text-[10px]" : "text-xs"} font-mono font-bold tracking-wider`}>
                    {likes}
                    {!isSm && " REP"}
                </span>
            </button>
            {error && (
                <span role="alert" className="mt-1 max-w-[220px] text-center text-[9px] font-mono text-red-400">
                    {error}
                </span>
            )}
        </div>
    );
}
