"use client";

import { useState } from "react";
import { News } from "../data/NewsData";

/*
|--------------------------------------------------------------------------
| useComments
|--------------------------------------------------------------------------
| Controla el modal de comentarios de cada noticia.
|--------------------------------------------------------------------------
*/

export function useComments() {

    // Noticia actualmente abierta
    const [openedNews, setOpenedNews] = useState<News | null>(null);

    /*
    |--------------------------------------------------------------------------
    | Abrir comentarios
    |--------------------------------------------------------------------------
    */
    function open(news: News) {

        setOpenedNews(news);

    }

    /*
    |--------------------------------------------------------------------------
    | Cerrar comentarios
    |--------------------------------------------------------------------------
    */
    function close() {

        setOpenedNews(null);

    }

    return {

        openedNews,

        open,

        close,

    };

}