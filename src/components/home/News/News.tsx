"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

import SectionTitle from "./components/SectionTitle";
import NewsGrid from "./components/NewsGrid";
import NewsMobile from "./components/NewsMobile";

import { useNews } from "./hooks/useNews";
import { useNewsSlider } from "./hooks/useNewsSlider";
import { useComments } from "./hooks/useComments";
import NewsComments from "./components/comments/modal/NewsComments";

// Definimos la interfaz aquí para desacoplarnos del archivo estático
export interface News {
  id: number;
  title: string;
  description: string;
  image: string;
  date: string;
}

export default function NovedadesSection() {
    const [newsData, setNewsData] = useState<News[]>([]);
    const [mobile, setMobile] = useState(false);

    const { opened, toggle } = useNews();
    const { openedNews, open, close } = useComments();
    const { current, next, previous } = useNewsSlider(newsData.length);

    useEffect(() => {
        // Consultar Supabase al montar el componente
        const fetchNews = async () => {
            const supabase = createClient();
            const { data } = await supabase
                .from("news")
                .select("*")
                .eq("published", true)
                .order("created_at", { ascending: false });

            if (data) {
                // Formatear los datos para que encajen con tus props actuales
                const formattedNews = data.map((item: any) => ({
                    id: item.id,
                    title: item.title,
                    description: item.description || "",
                    image: item.image_url || "/News/default.png", // Imagen por defecto si no hay url
                    date: new Date(item.created_at).toLocaleDateString('es-ES', { 
                        day: 'numeric', month: 'short', year: 'numeric' 
                    })
                }));
                setNewsData(formattedNews);
            }
        };

        fetchNews();

        function resize() {
            setMobile(window.innerWidth < 900);
        }

        resize();
        window.addEventListener("resize", resize);

        return () => window.removeEventListener("resize", resize);
    }, []);

    return (
        <section id="novedades" className="relative bg-black py-32">
            <SectionTitle
                title="Novedades"
                subtitle="Entérate de lo más relevante de la comunidad."
            />

                {mobile ? (
                    newsData.length > 0 ? (
                        <NewsMobile
                            news={newsData}
                            current={current}
                            opened={opened}
                            toggle={toggle}
                            previous={previous}
                            next={next}
                            onOpenComments={open}
                            commentsCount={0}
                        />
                    ) : (
                        <div className="mx-auto mt-16 max-w-md px-6">
                            <div className="h-[400px] animate-pulse rounded-3xl bg-[#111]" />
                        </div>
                    )
                ) : (
                <NewsGrid
                    news={newsData}
                    opened={opened}
                    toggle={toggle}
                    onOpenComments={open}
                />
            )}

            <NewsComments
                news={openedNews}
                onClose={close}
            />
        </section>
    );
}