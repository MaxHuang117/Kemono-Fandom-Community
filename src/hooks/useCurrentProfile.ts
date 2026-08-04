"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";

import type { UserProfile } from "@/components/home/News/components/lib/types/profile";
import { mapProfile } from "@/components/home/News/components/lib/mappers/profileMapper";

export function useCurrentProfile() {

    const { data: session } = useSession();

    const [profile, setProfile] = useState<UserProfile | null>(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        async function loadProfile() {

            if (!session?.user?.email) {

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
                    biografia
                `)
                .eq("email", session.user.email)
                .single();

            if (data) {

                setProfile(mapProfile(data));

            }

            setLoading(false);

        }

        loadProfile();

    }, [session]);

    return {

        profile,

        loading,

    };

}