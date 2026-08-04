"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

import {
    guardarBiografiaAction,
    sincronizarPerfilDiscordAction,
} from "../actions";

export function usePerfil() {

    const { data: session } = useSession();

    const [biografia, setBiografia] = useState("");

    const [guardando, setGuardando] = useState(false);

    const [banner, setBanner] = useState<string>();


    useEffect(() => {

        if (!session?.user) return;

        const sincronizarPerfil = async () => {

            const discordId = session.user.discordId;

            const email = session.user.email;

            const accessToken = session.accessToken;

            if (!discordId || !email) return;

            const discordUsername =
                session.user.name || "Usuario";

            const avatarUrl =
                session.user.image ||
                "https://cdn.discordapp.com/embed/avatars/0.png";

            let bannerUrl: string | null = null;

            if (accessToken) {

                const response = await fetch(
                    "https://discord.com/api/v10/users/@me",
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    }
                );

                if (response.ok) {

                    const discordUser = await response.json();

                    if (discordUser.banner) {

                        const extension =
                            discordUser.banner.startsWith("a_")
                                ? "gif"
                                : "png";

                        bannerUrl =
                            `https://cdn.discordapp.com/banners/${discordUser.id}/${discordUser.banner}.${extension}?size=1024`;

                        setBanner(bannerUrl);

                    }

                }

            }

            const result =
                await sincronizarPerfilDiscordAction({

                    discordId,

                    discordUsername,

                    email,

                    avatarUrl,

                    bannerUrl,

                });

            if (result.error) {

                console.error(result.error);

                return;

            }

            const { data } = await supabase

                .from("profiles")

                .select("biografia,banner_url")

                .eq("discord_id", discordId)

                .maybeSingle();

            if (data?.biografia) {

                setBiografia(data.biografia);

            }

            if (data?.banner_url) {

                setBanner(data.banner_url);

            }

        };

        sincronizarPerfil();

    }, [session]);


    async function guardarBiografia() {
        // 1. Nos Aseguramos de obtener el discordId desde la sesión
        const discordId = session?.user?.discordId;
        if (!discordId) return;

        setGuardando(true);

        // 2. Pasamos el discordId en lugar del email
        const result = await guardarBiografiaAction(
            discordId,
            biografia
        );

        setGuardando(false);

        if (result.error) {
            alert(result.error.message);
            return;
        }

        alert("¡Te ves bien!");
    }

    return {

        session,

        user: session?.user,

        banner,

        biografia,

        setBiografia,

        guardarBiografia,

        guardando,

        signOut,

    };

}