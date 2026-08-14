    "use client";

    import { useCallback, useEffect, useState } from "react";
    import { useSession } from "next-auth/react";
    import type { LikeUI } from "../components/lib/mappers/likeMapper";

    import {

        obtenerLikes,
        darLike,
        quitarLike,

    } from "../components/comments/actions/likesAction";

    export function useCommentLikes(

        commentId: string,

    ) {

        /*
        |--------------------------------------------------------------------------
        | Variables para NextAuth (hace que funcione en el lado del servidor)
        |--------------------------------------------------------------------------
        */

        const { data: session } = useSession();

        const discordId =
            session?.user?.discordId;

        const [likes, setLikes] = useState(0);

        const [liked, setLiked] = useState(false);

        const [usuarios,setUsuarios] = useState<LikeUI[]>([]);

        const [loading, setLoading] =
            useState(false);

        /*
        |--------------------------------------------------------------------------
        | Cargar likes
        |--------------------------------------------------------------------------
        */

        const cargarLikes = useCallback(async () => {

            const result =
                await obtenerLikes(commentId);

            if (result.error) return;

            const lista = result.likes ?? [];

            setLikes(lista.length);

            setUsuarios(lista);

            setLiked(

                lista.some(

                    like =>

                        like.userId === discordId

                )

            );

        }, [commentId, discordId]);

        useEffect(() => {

            const load = async () => {
                await cargarLikes();
            };

            void load();

        }, [cargarLikes]);

        /*
        |--------------------------------------------------------------------------
        | Toggle (like/dislike)
        |--------------------------------------------------------------------------
        */

        async function toggleLike() {

            if (!discordId) return;

            if (loading) return;

            setLoading(true);

            try {

                const result = liked
                    ? await quitarLike(commentId)
                    : await darLike(commentId);

                if (result.error) {
                    console.error("Error al actualizar like:", result.error);
                    return;
                }
                await cargarLikes();

            } finally {
                setLoading(false);

            }
        }

        return {

            likes,

            liked,

            loading,

            usuarios,

            toggleLike,

        };

    }