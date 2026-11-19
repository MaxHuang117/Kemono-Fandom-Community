"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { obtenerCreadoresAction, CreatorProfile } from "@/actions/creators.action";
import UserProfileModal from "@/components/modals/UserProfileModal";
import { UserProfile } from "@/components/home/News/components/lib/types/profile";
import { resolverCosmeticos, CosmeticProfile } from "@/lib/cosmetics";

function mapCreatorToUserProfile(creator: CreatorProfile): UserProfile {
    return {
        // Fase 2 (H1): usar `discord_id` como identificador de fetch para no
        // depender de la convención `profiles.id === discord_id`. El modal
        // consulta `obtenerPerfilPublicoAction(user.id)`, que acepta el snowflake.
        id: creator.discord_id,
        username: creator.discord_username || creator.nombre_publico || "Usuario",
        avatar: creator.avatar_url || "https://cdn.discordapp.com/embed/avatars/0.png",
        banner: creator.banner_url ?? undefined,
        biografia: creator.biografia ?? undefined,
        // Username para el enlace/compartir (más legible), con fallback al id.
        discord: creator.discord_username ?? creator.discord_id,
        tier_level: creator.tier_level ?? 0,
        social_links: {},
        ring_color: creator.ring_color ?? undefined,
        gradient_from: creator.gradient_from ?? undefined,
        gradient_to: creator.gradient_to ?? undefined,
    };
}

function mapCreatorToCosmetic(creator: CreatorProfile): CosmeticProfile {
    return {
        tier_level: creator.tier_level ?? 0,
        ring_color: creator.ring_color ?? null,
        gradient_from: creator.gradient_from ?? null,
        gradient_to: creator.gradient_to ?? null,
    };
}

export default function HeroCreatorsRoster() {
    const [creators, setCreators] = useState<CreatorProfile[]>([]);
    const [selected, setSelected] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCreators = async () => {
            const response = await obtenerCreadoresAction();
            if (response.success) {
                setCreators(response.data);
            }
            setLoading(false);
        };

        fetchCreators();
    }, []);

    if (loading || creators.length === 0) return null;

    return (
        <>
            <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black via-black/90 to-transparent pt-16 pb-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-neon-bright mb-3 ml-1">
                        Creadores destacados
                    </p>
                    <div className="flex gap-4 overflow-x-auto py-4 px-1">
                        {creators.map((creator, index) => (
                            <motion.button
                                key={creator.id}
                                type="button"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => setSelected(mapCreatorToUserProfile(creator))}
                                className="group flex-shrink-0 flex flex-col items-center gap-2 w-20 focus:outline-none focus-visible:ring-2 focus-visible:ring-neon rounded-lg"
                            >
                                {(() => {
                                    const cosmeticos = resolverCosmeticos(mapCreatorToCosmetic(creator));
                                    return (
                                        <div className="relative h-14 w-14 rounded-full">
                                            {/* Anillo con glow sutil (estático, sin recorte) */}
                                            <div 
                                                className="absolute inset-[-2px] rounded-full transition-all duration-300 group-hover:scale-110"
                                                style={{ ...cosmeticos.ringStyle, boxShadow: `0 0 10px ${cosmeticos.accentColor}55` }}
                                            />
                                            {/* Avatar */}
                                            <div className="relative h-14 w-14 rounded-full overflow-hidden bg-[#0a0a0a] border-2 border-black">
                                                <Image
                                                    src={creator.avatar_url || "https://cdn.discordapp.com/embed/avatars/0.png"}
                                                    alt={creator.discord_username || "Creador"}
                                                    fill
                                                    sizes="56px"
                                                    className="object-cover"
                                                />
                                            </div>
                                            {/* Indicador online */}
                                            {creator.is_online && (
                                                <span className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full bg-neon border-2 border-black motion-safe:animate-pulse" />
                                            )}
                                        </div>
                                    );
                                })()}
                                <span className="text-[10px] font-medium text-zinc-300 group-hover:text-neon-bright truncate max-w-full transition-colors">
                                    {creator.discord_username || creator.nombre_publico || "Creador"}
                                </span>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>

            <UserProfileModal user={selected} onClose={() => setSelected(null)} />
        </>
    );
}
