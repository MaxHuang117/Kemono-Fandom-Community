"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useIsMobile } from "@/hooks/useIsMobile";

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

/*
|--------------------------------------------------------------------------
| Skeleton de carga
|--------------------------------------------------------------------------
| Imita la forma de NewsCard (imagen + título) para evitar saltos visuales
| (CLS) cuando terminan de llegar los datos.
|--------------------------------------------------------------------------
*/
function NewsSkeletonCard() {
  return (
    <div className="w-full md:w-[46%] xl:w-[31%]" aria-hidden="true">
      <div className="overflow-hidden bg-[#0a0a0a] border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
        <div className="h-[240px] bg-zinc-900/60 animate-pulse" />
        <div className="p-6 space-y-3">
          <div className="w-8 h-0.5 bg-zinc-800" />
          <div className="h-5 w-3/4 bg-zinc-900 animate-pulse" />
          <div className="h-5 w-1/2 bg-zinc-900 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function NovedadesSection() {
    const [newsData, setNewsData] = useState<News[]>([]);
    const [loading, setLoading] = useState(true);
    const mobile = useIsMobile(900);

    const { opened, toggle } = useNews();
    const { openedNews, open, close } = useComments();
    const { current, next, previous } = useNewsSlider(newsData.length);

    useEffect(() => {
        // Consultar Supabase al montar el componente
        const fetchNews = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("news")
                .select("*")
                .eq("published", true)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error cargando noticias:", error);
            }

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

            setLoading(false);
        };

        fetchNews();
    }, []);

    // 🔇 Estado vacío compartido (desktop y móvil)
    const emptyState = (
        <div className="mx-auto mt-16 max-w-md px-6 text-center">
            <p className="text-xs font-mono uppercase tracking-widest text-zinc-500">
                Sin noticias
            </p>
            <p className="mt-2 text-sm text-zinc-500">
                No hay noticias publicadas por ahora.
            </p>
        </div>
    );

    return (
        <section id="novedades" className="relative bg-black py-32">
            <SectionTitle
                title="Novedades"
                subtitle="Entérate de lo más relevante de la comunidad."
            />

            {mobile ? (
                loading ? (
                    <div className="mx-auto mt-16 max-w-md space-y-8 px-6">
                        <NewsSkeletonCard />
                        <NewsSkeletonCard />
                    </div>
                ) : newsData.length > 0 ? (
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
                    emptyState
                )
            ) : loading ? (
                <div className="mx-auto mt-16 flex flex-wrap justify-center items-start gap-8 max-w-[1400px] px-8">
                    <NewsSkeletonCard />
                    <NewsSkeletonCard />
                    <NewsSkeletonCard />
                </div>
            ) : newsData.length > 0 ? (
                <NewsGrid
                    news={newsData}
                    opened={opened}
                    toggle={toggle}
                    onOpenComments={open}
                />
            ) : (
                emptyState
            )}

            <NewsComments
                news={openedNews}
                onClose={close}
            />
        </section>
    );
}
