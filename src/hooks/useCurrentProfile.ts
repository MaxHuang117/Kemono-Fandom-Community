"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { createClient } from "@/lib/supabase/client";

import type { UserProfile } from "@/components/home/News/components/lib/types/profile";
import { mapProfile } from "@/components/home/News/components/lib/mappers/profileMapper";

export function useCurrentProfile() {
    const { data: session } = useSession();
    const supabase = createClient();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadProfile() {
            // Identidad: `discord_id` proviene de la sesión de NextAuth (servidor),
            // nunca del cliente. Tras los GRANTs de FASE2-01, el rol `anon` ya no
            // puede leer `email` ni `custom_badge`/`allow_gifs`; resolvemos por
            // `discord_id` y pedimos solo las columnas públicas expuestas a `anon`.
            if (!session?.user?.discordId) {
                setProfile(null);
                setLoading(false);
                return;
            }

            const { data } = await supabase
                .from("profiles")
                .select(`
                    id,
                    nombre_publico,
                    discord_username,
                    avatar_url,
                    banner_url,
                    biografia,
                    tier_level,
                    social_links,
                    name_color_gradient
                `)
                .eq("discord_id", session.user.discordId)
                .single();

            if (data) {
                setProfile(mapProfile(data));
            } else {
                setProfile(null);
            }

            setLoading(false);
        }

        loadProfile();
    }, [session, supabase]);

    return { profile, loading };
}
