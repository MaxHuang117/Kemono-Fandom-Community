// src/app/u/[id]/page.tsx
import Image from "next/image";
import { notFound } from "next/navigation";

// 🔌 CONEXIÓN: Importamos la acción de DB y los Componentes. (Sin Hooks porque es un Server Component)
import { obtenerPerfilPublicoAction } from "@/actions/publicProfile.action"; 
import TierBadge from "@/components/profile/TierBadge"; 
import ProfileSocialNodes from "@/components/profile/ProfileSocialNodes";
import ShareProfileButton from "@/components/ui/ShareProfileButton"; 
import { VIP_STYLES, DEFAULT_STYLE } from "@/config/vipStyles.config";
import PublicVipCarousel from "@/components/profile/PublicVipCarousel";

// ⚡ OPTIMIZACIÓN NEXT 15: params ahora es una Promesa.
interface Props {
    params: Promise<{ id: string }>;
}

// 🚀 SERVER COMPONENT: Todo esto se ejecuta en el servidor, generando HTML estático súper rápido y excelente para SEO.
export default async function PublicProfilePage({ params }: Props) {
    // 1. Esperamos a que se resuelva la URL
    const resolvedParams = await params;
    const userId = resolvedParams.id;

    // 2. Buscamos al usuario en la Base de Datos usando nuestro buscador dual (.ilike / .eq)
    const response = await obtenerPerfilPublicoAction(userId);

    // 3. Manejo de Errores: Si maybeSingle devolvió null, lanzamos la pantalla 404 nativa de Next
    if (!response.success || !response.data) {
        notFound(); 
    }

    const user = response.data;
    
    // --- VARIABLES SEGURAS (Fallback si no hay datos) ---
    const profileName = user.discord_username || "Usuario";
    const finalTier = user.tier_level ?? 0;
    const finalLinks = (user.social_links as Record<string, string>) ?? {};
    
    // 🎨 LÓGICA VIP CENTRALIZADA (Ejecutada del lado del servidor)
    const styleId = user.name_color_gradient;
    const activeStyle = VIP_STYLES[styleId || "pure"] || DEFAULT_STYLE;
    
    const isPremium = finalTier >= 1;
    // Si no es VIP (Tier 0), inyecta clases blancas y grises estándar.
    const renderTextClass = isPremium ? `text-transparent bg-clip-text bg-gradient-to-r ${activeStyle.textClass} hover:brightness-125` : "text-white";
    const renderRingClass = isPremium ? `bg-gradient-to-r ${activeStyle.ringClass} animate-[spin_4s_linear_infinite]` : "from-zinc-800 to-zinc-700";

    return (
        <main className="min-h-screen bg-[#020202] text-white pt-24 pb-12 font-sans relative">
            
            {/* 🌌 UI: FONDO CYBERPUNK (Grid sutil y sombra esmeralda en la parte superior) */}
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03] pointer-events-none" />
            <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-emerald-900/10 to-transparent pointer-events-none" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
                
                {/* 🎴 CARD PRINCIPAL: Con 'group/card' activamos animaciones cuando el mouse entra a la tarjeta */}
                <div className="group/card relative overflow-hidden bg-[#070707] border border-white/5 hover:border-emerald-500/30 transition-all duration-700 shadow-[0_0_50px_rgba(0,0,0,0.8)] hover:shadow-[0_0_60px_rgba(16,185,129,0.1)] rounded-xl">
                    
                    {/* ESQUINAS DECORATIVAS: Reaccionan al hover de la tarjeta madre */}
                    <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-emerald-500/50 group-hover/card:border-emerald-400 transition-colors duration-500 z-20 pointer-events-none rounded-tl-xl" />
                    <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-emerald-500/50 group-hover/card:border-emerald-400 transition-colors duration-500 z-20 pointer-events-none rounded-br-xl" />

                    {/* 🖼️ ZONA BANNER: Más alta que en el modal (h-64 a h-80) */}
                    <div className="relative h-64 sm:h-80 w-full bg-zinc-950 border-b border-white/10 overflow-hidden">
                        {user.banner_url ? (
                            <Image 
                                src={user.banner_url} 
                                alt={profileName || "Banner"} 
                                fill 
                                sizes="(max-width: 1024px) 100vw, 1024px" // Optimización de carga de imágenes
                                // Escala ligera (scale-105) y brillo al hacer hover
                                className="object-cover opacity-70 group-hover/card:opacity-100 group-hover/card:scale-105 transition-all duration-1000 ease-out" 
                                priority 
                            />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center bg-[url('/grid-pattern.svg')] opacity-20"><span className="text-zinc-600 font-mono text-sm uppercase tracking-widest">NO_ASSET_LOADED</span></div>
                        )}
                        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#070707] via-[#070707]/80 to-transparent pointer-events-none" />
                        
                        {/* 🔗 UI INTEGRADA: Botón de Compartir incrustado en el banner (Client Component dentro de un Server Component) */}
                        <div className="absolute top-4 right-4 z-30">
                            <ShareProfileButton discordUsername={user.discord || user.discord_username || ""} />
                        </div>
                    </div>

                    {/* 🧑 ZONA PERFIL */}
                    <div className="px-6 sm:px-12 pb-12 relative z-10">
                        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-8 -mt-24 sm:-mt-28 mb-8 relative">
                            
                            {/* AVATAR + EFECTO VIP */}
                            <div className="relative group/avatar shrink-0">
                                {/* Anillo Dinámico VIP */}
                                <div className={`absolute inset-[-4px] rounded-full ${renderRingClass} opacity-60 group-hover/avatar:opacity-100 transition-opacity duration-500`} />
                                <div className="relative h-40 w-40 sm:h-48 sm:w-48 rounded-full border-[6px] border-[#070707] bg-[#0a0a0a] shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-hidden">
                                    <Image src={user.avatar_url || "https://cdn.discordapp.com/embed/avatars/0.png"} alt={profileName} fill sizes="192px" className="object-cover group-hover/avatar:scale-110 transition-transform duration-700" priority />
                                    {/* Brillo de luz blanco (Hover Glow) solo para Tier 1+ */}
                                    {isPremium && (
                                        <div className="absolute inset-0 w-full h-[200%] bg-gradient-to-b from-transparent via-white/30 to-transparent -translate-y-full group-hover/avatar:translate-y-full transition-transform duration-1000 ease-in-out pointer-events-none" />
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col items-center sm:items-start pb-2 w-full text-center sm:text-left">
                                {/* NOMBRE VIP DINÁMICO */}
                                <h1 className={`text-4xl sm:text-6xl font-black uppercase tracking-wider drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] mb-3 transition-all duration-300 ${renderTextClass}`}>
                                    {profileName}
                                </h1>
                                
                                <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3">
                                    <span className="text-xs font-mono text-zinc-400 bg-black/50 border border-white/10 px-3 py-1.5 uppercase tracking-widest rounded-sm backdrop-blur-md">
                                        @{user.discord_username}
                                    </span>
                                    <TierBadge tier={finalTier} />
                                    {/* LECTURA DE REPUTACIÓN: Aquí es solo informativo, protegemos la base de datos de spam externo */}
                                    <div className="flex items-center gap-2 px-4 py-1.5 rounded border border-red-500/30 bg-red-500/10 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.1)]">
                                        <svg className="w-4 h-4 fill-red-400 animate-pulse" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
                                        <span className="text-xs font-mono font-bold tracking-wider">{user.likes_count ?? 0} REP</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    {/* 📊 LAYOUT DASHBOARD (GRID): Dividimos el contenido inferior en columnas para pantallas grandes */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            
                            {/* COLUMNA 1 (Izquierda 33%): Nodos Sociales */}
                            <div className="lg:col-span-1 space-y-6">
                                <div className="bg-[#050505] border border-white/5 p-6 rounded-lg shadow-inner">
                                    <h3 className="text-xs font-mono text-zinc-500 tracking-widest uppercase mb-6 flex items-center gap-3">
                                        <span className="w-4 h-[1px] bg-emerald-500/50"></span>
                                        Nodos Activos
                                    </h3>
                                    <ProfileSocialNodes links={finalLinks} tierLevel={finalTier} />
                                </div>
                            </div>

                            {/* COLUMNA 2 (Derecha 66%): Biografía expandida */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="w-full bg-[#050505] border border-white/5 p-6 sm:p-8 text-base font-mono text-zinc-300 leading-relaxed min-h-[160px] rounded-lg shadow-inner relative overflow-hidden group/bio">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-500/50 to-transparent opacity-50 group-hover/bio:opacity-100 transition-opacity" />
                                    {user.biografia ? <p className="relative z-10">{user.biografia}</p> : <span className="text-zinc-600 italic relative z-10">No signal found. Biografía no establecida.</span>}
                                </div>
                            </div>
                        </div>

                        {/* 👇 CARRUSEL VIP👇 */}
                        {/* Como user.custom_slides ya viene filtrado desde backend (solo para Tier 2+), 
                            pasamos el array directamente. El componente se oculta si está vacío. */}
                        <PublicVipCarousel slides={user.custom_slides || []} />

                    </div>
                </div>
            </div>
        </main>
    );
}