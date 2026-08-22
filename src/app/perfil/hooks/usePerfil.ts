"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";

import {
    guardarBiografiaAction,
    obtenerBiografiaAction,
    sincronizarPerfilDiscordAction,
} from "../actions";

export function usePerfil() {

    const { data: session } = useSession();

    const [biografia, setBiografia] = useState("");

    const [guardando, setGuardando] = useState(false);

    const [banner] = useState<string>();


    useEffect(() => {

        if (!session?.user) return;

        const sincronizarPerfil = async () => {

            const discordId = session.user.discordId;

                if (!discordId) return;

            const result =
                await sincronizarPerfilDiscordAction();

            const perfil = await obtenerBiografiaAction();

                if (perfil.error) {
                    console.error(perfil.error);
                    return;
                }

                setBiografia(perfil.biografia ?? "");

                if (result.error) {

                    console.error(result.error);

                return;

            }

        };

        sincronizarPerfil();

    }, [session]);


    async function guardarBiografia() {

        if (!session?.user?.discordId) return;

        setGuardando(true);

        const result = await guardarBiografiaAction(biografia);

        setGuardando(false);

        if (result.error) {
            alert(result.error);
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