"use client";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { UserProfile } from "../home/News/components/lib/types/profile";

// 🔌 CONEXIÓN AL BACKEND: Importamos las acciones seguras
import { obtenerPerfilPublicoAction } from "@/actions/publicProfile.action"; 
import { toggleProfileReputationAction } from "@/app/perfil/actions";

// 🧩 COMPONENTES MODULARES: Reutilizamos piezas para mantener el código limpio
import TierBadge from "@/components/profile/TierBadge"; 
import Link from "next/link";
import ShareProfileButton from "@/components/ui/ShareProfileButton"; 

// 🎨 SISTEMA VIP: Importamos la configuración global de estilos (Single Source of Truth)
import { VIP_STYLES, DEFAULT_STYLE } from "@/config/vipStyles.config";

interface Props {
    user: UserProfile | null;
    onClose: () => void; // Función para cerrar el modal al hacer clic fuera o en un link
}

export default function UserProfileModal({ user, onClose }: Props) {
    // --- ESTADOS LOCALES ---
    const [dbData, setDbData] = useState<any>(null);
    
    // ⚡ OPTIMIZACIÓN (Optimistic UI): Estados para que el corazón reaccione instantáneamente
    const [isLiking, setIsLiking] = useState(false);
    const [localLikes, setLocalLikes] = useState<number>(0);
    const [hasLikedLocal, setHasLikedLocal] = useState(false);

    // 🔌 FETCH INICIAL: Al abrir el modal, buscamos la info fresca de Supabase
    useEffect(() => {
        if (!user?.id) return;
        const fetchFullProfile = async () => {
            const response = await obtenerPerfilPublicoAction(user.id);
            if (response.success && response.data) {
                setDbData(response.data);
                setLocalLikes(response.data.likes_count ?? 0); // Sincronizamos likes con la DB
            }
        };
        fetchFullProfile();
    }, [user?.id]);

    // --- VARIABLES DERIVADAS (Fallback: Si la DB tarda, usamos la info básica del 'user') ---
    const finalTier = dbData?.tier_level ?? user?.tier_level ?? 0;
    const finalBanner = dbData?.banner_url ?? user?.banner;
    const finalBio = dbData?.biografia ?? user?.biografia;

    // 🎨 LÓGICA DE COSMÉTICOS VIP (Seguridad Frontend)
    // 1. Obtenemos el ID del color desde la DB
    const styleId = dbData?.name_color_gradient ?? user?.name_color_gradient;
    // 2. Buscamos el estilo en config. Si no existe, usamos el DEFAULT_STYLE ("pure" / blanco)
    const activeStyle = VIP_STYLES[styleId || "pure"] || DEFAULT_STYLE;
    
    // 3. Evaluamos si tiene permiso (Tier 1+). Si es Free, forzamos texto blanco y anillo gris.
    const isPremium = finalTier >= 1;
    const renderTextClass = isPremium ? `text-transparent bg-clip-text bg-gradient-to-r ${activeStyle.textClass} hover:brightness-125` : "text-white";
    const renderRingClass = isPremium ? `bg-gradient-to-r ${activeStyle.ringClass} animate-[spin_4s_linear_infinite]` : "from-zinc-800 to-zinc-700";

    // 🔌 SISTEMA DE REPUTACIÓN (Anti-Sybil)
    const handleToggleLike = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Evita que un clic aquí cierre el modal por accidente
        if (!user?.id) return;
        
        setIsLiking(true);
        // Actualizamos la UI instantáneamente para el usuario
        setLocalLikes(prev => hasLikedLocal ? prev - 1 : prev + 1);
        setHasLikedLocal(!hasLikedLocal);

        // Disparamos la acción segura al backend
        const res = await toggleProfileReputationAction(user.id);
        if (res.error) {
            // Si el backend lo bloquea (por ser cuenta nueva, etc), revertimos la UI
            setLocalLikes(prev => hasLikedLocal ? prev + 1 : prev - 1);
            setHasLikedLocal(!hasLikedLocal);
            alert(res.error);
        }
        setIsLiking(false);
    };

    return (
        <AnimatePresence>
            {user && (
                <>
                    {/* OVERLAY: Fondo oscuro que cierra el modal al hacer clic */}
                    <motion.div
                        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm cursor-pointer"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* CONTENEDOR DEL MODAL: Animado y centrado */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 z-[101] w-[95%] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-[#050505] border border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.15)] font-sans rounded-xl"
                    >
                        {/* DECORACIÓN CYBERPUNK: Esquinas */}
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-emerald-500 z-20 pointer-events-none rounded-tl-xl" />
                        <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 bg-black/70 hover:bg-red-500 text-zinc-300 hover:text-white rounded-full backdrop-blur-md transition-colors border border-white/10 hover:border-red-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>

                        {/* BANNER: Más corto (h-28) porque es solo un "Teaser" */}
                        <div className="relative h-28 sm:h-32 overflow-hidden bg-zinc-950 border-b border-white/10">
                            {finalBanner ? (
                                <Image src={finalBanner} alt={user.username} fill sizes="(max-width: 768px) 100vw, 600px" className="object-cover opacity-80" priority />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center bg-[url('/grid-pattern.svg')] opacity-20"><span className="text-zinc-600 font-mono text-[10px] uppercase tracking-widest">NO_ASSET</span></div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
                        </div>

                        <div className="px-6 pb-6 relative">
                            <div className="flex flex-col items-center -mt-12 mb-4 relative z-10">
                                
                                {/* AVATAR + EFECTO VIP */}
                                <div className="relative group/avatar shrink-0 mb-3">
                                    {/* Anillo de color (Calculado en la variable renderRingClass) */}
                                    <div className={`absolute inset-[-4px] rounded-full ${renderRingClass} opacity-60 group-hover/avatar:opacity-100 transition-opacity duration-500`} />
                                    <div className="relative h-24 w-24 rounded-full border-[4px] border-[#050505] bg-[#0a0a0a] shadow-[0_0_20px_rgba(16,185,129,0.2)] overflow-hidden">
                                        <Image src={user.avatar} alt={user.username} fill sizes="96px" className="object-cover" priority />
                                        {/* Hover Glow blanco: Solo se inyecta si es Premium */}
                                        {isPremium && (
                                            <div className="absolute inset-0 w-full h-[200%] bg-gradient-to-b from-transparent via-white/30 to-transparent -translate-y-full group-hover/avatar:translate-y-full transition-transform duration-700 ease-in-out pointer-events-none" />
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col items-center text-center w-full">
                                    {/* NOMBRE VIP (Calculado en la variable renderTextClass) */}
                                    <h2 className={`text-2xl font-black uppercase tracking-wider drop-shadow-md leading-none transition-all duration-300 ${renderTextClass}`}>
                                        {user.username}
                                    </h2>
                                    
                                    <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                                        <TierBadge tier={finalTier} />
                                        {/* BOTÓN DE LIKE: Dispara la función handleToggleLike */}
                                        <button onClick={handleToggleLike} disabled={isLiking} className={`group flex items-center gap-1.5 px-2.5 py-0.5 rounded border transition-all duration-300 shadow-[0_0_10px_rgba(239,68,68,0.1)] ${hasLikedLocal ? "bg-red-500/10 border-red-500/50 text-red-400" : "bg-[#0a0a0a] border-white/10 hover:border-red-500/30 text-zinc-400 hover:text-red-400"}`} title="Dar Reputación">
                                            <svg className={`w-3 h-3 transition-transform duration-300 ${hasLikedLocal ? "fill-red-400 scale-110" : "fill-transparent stroke-current stroke-2 group-hover:scale-110"}`} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
                                            <span className="text-[10px] font-mono font-bold tracking-wider">{localLikes}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* BIO UX: Usamos 'line-clamp-2' para truncar textos largos y obligar a visitar el perfil */}
                            <div className="w-full text-center text-xs font-mono text-zinc-400 leading-relaxed mb-6 px-4 line-clamp-2">
                                {finalBio ? <p>{finalBio}</p> : <span className="italic opacity-50">Sin biografía...</span>}
                            </div>
                            
                            {/* NAVEGACIÓN Y COMPARTIR: Conectamos hacia /u/[discord_id] (Más seguro que username) */}
                            <div className="flex flex-col gap-2 w-full">
                                <Link 
                                    href={`/u/${user.discord}`} 
                                    onClick={onClose} 
                                    className="w-full group relative flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold uppercase tracking-widest border border-emerald-500/30 hover:bg-emerald-500 hover:text-black transition-all duration-300 rounded overflow-hidden"
                                >
                                    {/* Efecto de luz pasando al hacer hover en el botón */}
                                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                                    <span className="relative z-10 flex items-center gap-2">
                                        Inspeccionar Perfil
                                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                    </span>
                                </Link>
                                
                                {/* Componente de Compartir: Pide el usuario y toma el 100% del ancho */}
                                <ShareProfileButton discordUsername={user.discord || ""} fullWidth={true} />
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}