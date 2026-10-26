"use client";

// Este file completo se encarga de manejar la lógica del perfil del usuario,
// incluyendo la sincronización con Discord, la carga de datos desde Supabase,
// y la gestión de estados como biografía, banner, tier level, social links, etc.
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import {
    guardarBiografiaAction,
    obtenerPerfilCompletoAction,
    sincronizarPerfilDiscordAction,
} from "../actions";
import type { CustomSlide } from "@/types/slides"; 

export function usePerfil() {
    const { data: session } = useSession();

    const [isLoading, setIsLoading] = useState(true);
    const [biografia, setBiografia] = useState("");
    const [guardando, setGuardando] = useState(false);
    const [banner, setBanner] = useState<string | undefined>();
    const [tierLevel, setTierLevel] = useState<number>(0);
    const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});
    
    const [nameColorGradient, setNameColorGradient] = useState<string | null>(null);
    // AÑADIDO: Estado para el contador de likes
    const [likesCount, setLikesCount] = useState<number>(0);

    const [dbId, setDbId] = useState<string>("");
    const [customSlides, setCustomSlides] = useState<CustomSlide[]>([]);

    const cargarDatos = async () => {
        const perfil = await obtenerPerfilCompletoAction();
        if (perfil.error) {
            console.error(perfil.error);
            setIsLoading(false);
            return;
        }

        setBiografia(perfil.biografia ?? "");
        setTierLevel(perfil.tier_level ?? 0);
        setSocialLinks((perfil.social_links as Record<string, string>) || {});
        setBanner(perfil.banner_url ?? undefined);

        const perfilData = perfil as any;
        setDbId(perfilData.id || "");
        
        setNameColorGradient(perfilData.name_color_gradient ?? null);
        // AÑADIDO: Guardamos el contador de likes que viene de Supabase
        setLikesCount(perfilData.likes_count ?? 0);
        
        setCustomSlides((perfilData.custom_slides as CustomSlide[]) || []);
        
        setIsLoading(false); 
    };

    useEffect(() => {
        if (!session?.user) return;

        const inicializarPerfil = async () => {
            const discordId = session.user.discordId;
            if (!discordId) return;

            const discordUsername = session.user.name || "Usuario";
            const avatarUrl = session.user.image || "https://cdn.discordapp.com/embed/avatars/0.png";

            const result = await sincronizarPerfilDiscordAction({ discordUsername, avatarUrl });

            if (result.error) {
                console.error(result.error);
                setIsLoading(false);
                return;
            }

            await cargarDatos();
        };

        inicializarPerfil();
    }, [session]);

    async function guardarBiografia() {
        if (!session?.user?.discordId) return;
        setGuardando(true);
        const result = await guardarBiografiaAction(biografia);
        setGuardando(false);
        if (result.error) return alert(result.error);
        alert("¡Te ves bien!");
    }

    return {
        session,
        user: session?.user,
        dbId,
        banner,
        biografia,
        tierLevel,
        socialLinks,
        customSlides, 
        nameColorGradient, 
        likesCount, // AÑADIDO: Lo exportamos
        setBiografia,
        guardarBiografia,
        cargarDatos,
        guardando,
        isLoading, 
        signOut,
    };
}