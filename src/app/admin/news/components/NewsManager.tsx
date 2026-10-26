// max-hub/src/app/admin/news/components/NewsManager.tsx
"use client";

import { useState, useEffect } from "react";
import { News, NewsInsert } from "./lib/types/news";
import { getNews, createNews, updateNews, deleteNews } from "./lib/services/news.service";
import NewsForm from "./NewsForm";

const NewsManager: React.FC = () => {
  const [newsList, setNewsList] = useState<News[]>([]);
  const [selectedNews, setSelectedNews] = useState<News | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAllNews = async () => {
    try {
      setLoading(true);
      const data = await getNews();
      setNewsList(data);
    } catch (err) {
      console.error("Error al cargar noticias:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllNews();
  }, []);

  const handleDelete = async (newsId: number) => {
    if (!confirm("¿Seguro que deseas eliminar esta noticia?")) return;
    try {
      await deleteNews(newsId);
      setNewsList((prev) => prev.filter((n) => n.id !== newsId));
    } catch (err) {
      alert("Error eliminando la noticia");
    }
  };

  const handleEdit = (news: News) => {
    setSelectedNews(news);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setSelectedNews(undefined);
    setIsFormOpen(true);
  };

  const handleSave = async (newsData: NewsInsert | News) => {
    try {
      if ("id" in newsData && newsData.id) {
        const updated = await updateNews(newsData.id, newsData);
        setNewsList((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
      } else {
        const created = await createNews(newsData as NewsInsert);
        setNewsList((prev) => [created, ...prev]);
      }
      setIsFormOpen(false);
    } catch (err) {
      alert("Error al guardar noticia");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white uppercase">Gestor de Noticias</h2>
          <p className="text-xs text-zinc-400">Crea, modifica y remueve noticias publicadas en Max Hub</p>
        </div>
        {!isFormOpen && (
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.3)] transition flex items-center gap-2"
          >
            <span>+</span> Nueva Noticia
          </button>
        )}
      </div>

      {isFormOpen ? (
        <NewsForm news={selectedNews} onSave={handleSave} onCancel={() => setIsFormOpen(false)} />
      ) : loading ? (
        <div className="text-center py-12 text-zinc-500 font-mono">Cargando noticias desde Supabase...</div>
      ) : (
        <div className="grid gap-4">
          {newsList.map((n) => (
            <div
              key={n.id}
              className="group flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-zinc-950/70 border border-zinc-800/80 hover:border-emerald-500/50 rounded-xl transition duration-200 gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-zinc-800 text-emerald-400 border border-zinc-700">
                    {n.category || "General"}
                  </span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${n.published ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-amber-950 text-amber-400 border border-amber-800"}`}>
                    {n.published ? "Publicado" : "Borrador"}
                  </span>
                </div>
                <h3 className="font-bold text-white text-lg group-hover:text-emerald-400 transition">{n.title}</h3>
                <p className="text-xs text-zinc-400 line-clamp-1">{n.description || n.content}</p>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <button
                  onClick={() => handleEdit(n)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white transition border border-zinc-700"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(n.id)}
                  className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-xs font-bold text-red-400 transition border border-red-800/50"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewsManager;