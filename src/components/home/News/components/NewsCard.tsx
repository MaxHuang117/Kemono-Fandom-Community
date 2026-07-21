"use client";

import { motion, AnimatePresence } from "framer-motion";
import { News } from "../data/NewsData";

interface Props {
    news: News;
    opened: boolean;
    onToggle: () => void;
}

/*
|--------------------------------------------------------------------------
| Tarjeta de Novedad (Expandible con animación)
|--------------------------------------------------------------------------
*/
export default function NewsCard({ news, opened, onToggle }: Props) {
    return (
        <motion.div
            whileHover={{ y: -10, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 220 }}
            className="overflow-hidden rounded-3xl bg-[#111] border border-white/10 cursor-pointer"
            onClick={onToggle}
        >
            {/* Contenedor del Banner y la Fecha */}
            <div className="relative h-[240px] overflow-hidden">
                <img src={news.image} alt={news.title} className="h-full w-full object-cover" />
                
                {/* Etiqueta de Fecha */}
                <div className="absolute top-4 right-4 rounded-full bg-black/70 px-3 py-1 text-sm">
                    {news.date}
                </div>

                {/* Sombra / Gradiente inferior */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            </div>

            {/* Contenido de la Tarjeta */}
            <div className="p-6">

            <div className="flex justify-between items-center">

                <h3 className="text-2xl font-bold">
                {news.title}
                </h3>

                {/* Flecha individual */}
                <motion.span
                key={news.id}
                animate={{ rotate: opened ? 180 : 0 }}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 22,
                }}
                className="text-green-400"
                >
                ▼
                </motion.span>

            </div>

            {/* Descripción desplegable */}
            <AnimatePresence mode="wait" initial={false}>

                {opened && (

                <motion.div
                    key={`content-${news.id}`}
                    initial={{
                    opacity: 0,
                    height: 0,
                    }}
                    animate={{
                    opacity: 1,
                    height: "auto",
                    }}
                    exit={{
                    opacity: 0,
                    height: 0,
                    }}
                    transition={{
                    duration: 0.25,
                    }}
                    className="overflow-hidden"
                >

                    <p className="mt-5 text-gray-300 leading-7">
                    {news.description}
                    </p>

                </motion.div>

                )}

            </AnimatePresence>

            </div>

        </motion.div>
    );
}