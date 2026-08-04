"use server";

import { supabase } from "@/lib/supabase";

export async function obtenerComentarios(newsId:number){

    const { data,error } = await supabase

        .from("comments")

        .select(`
            *,
            profile:profiles(
                nombre_publico,
                avatar_url,
                discord_username
            )
        `)

        .eq("news_id",newsId)

        .order("created_at",{ascending:true});

    return {

        data,
        error,

    };

}

// publicar comentario

export async function publicarComentario({

    newsId,

    userId,

    message,

}:{

    newsId:number;

    userId:string;

    message:string;

}){

    const { error } = await supabase

        .from("comments")

        .insert({

            news_id:newsId,

            user_id:userId,

            message,

        });

    return { error };

}