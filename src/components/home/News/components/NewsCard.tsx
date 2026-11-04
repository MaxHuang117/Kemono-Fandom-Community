"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { esImagenAnimada } from "@/lib/image";

interface News {
    id: number;
    title: string;
    description: string;
    image: string;
    date: string;
}

interface Props {
    news: News;
    onOpenComments: () => void;
}

export default function NewsCard({ news, onOpenComments }: Props) {
    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 220 }}
            className="group relative overflow-hidden bg-[#0a0a0a] border border-white/10 hover:border-neon/80 cursor-pointer transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
            onClick={onOpenComments}
        >
            {/* Esquina tecnológica decorativa estilo HUD */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-neon/40 group-hover:border-neon z-20 transition-colors" />

            <div className="relative h-[240px] overflow-hidden bg-zinc-950">
                <Image 
                    src={news.image} 
                    alt={news.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 460px"
                    unoptimized={esImagenAnimada(news.image)}
                    className="w-full h-full object-cover group-hover:opacity-100" 
                />
                
                {/* Badge de Fecha tipo Terminal / Monospace */}
                <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md border border-white/10 px-3 py-1 text-xs z-10 text-neon-bright font-mono tracking-widest uppercase shadow-[0_0_10px_rgba(0,0,0,0.8)]">
                    // {news.date}
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/20 to-transparent pointer-events-none" />
            </div>

            <div className="p-6 relative">
                {/* Línea de pulso estético */}
                <div className="w-8 h-0.5 bg-neon/40 group-hover:w-full transition-all duration-500 mb-3" />
                
                <h3 className="text-xl font-black text-white uppercase tracking-wider group-hover:text-neon-bright transition-colors line-clamp-2">
                    {news.title}
                </h3>
            </div>
        </motion.div>
    );
}