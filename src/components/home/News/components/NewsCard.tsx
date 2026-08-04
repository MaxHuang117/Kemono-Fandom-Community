"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { News } from "../data/NewsData";

interface Props {
    news: News;
    onOpenComments: () => void;
}

/*
|--------------------------------------------------------------------------
| Tarjeta de Novedad (Solo Abre Comentarios)
|--------------------------------------------------------------------------
*/
export default function NewsCard({ news, onOpenComments }: Props) {
    return (
        <motion.div
            whileHover={{ y: -10, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 220 }}
            className="overflow-hidden rounded-3xl bg-[#111] border border-white/10 cursor-pointer"
            onClick={onOpenComments}
        >
            {/* Contenedor del Banner y la Fecha */}
            <div className="relative h-[240px] overflow-hidden">
                <Image 
                    src={news.image} 
                    alt={news.title}
                    priority
                    fill 
                    className="object-cover" 
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                
                {/* Etiqueta de Fecha */}
                <div className="absolute top-4 right-4 rounded-full bg-black/70 px-3 py-1 text-sm z-10">
                    {news.date}
                </div>

                {/* Sombra / Gradiente inferior */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            </div>

            {/* Contenido de la Tarjeta */}
            <div className="p-6">
                <h3 className="text-2xl font-bold">
                    {news.title}
                </h3>
            </div>
        </motion.div>
    );
}
