// max-hub/src/app/admin/news/components/NewsForm.tsx
"use client";

import { useState } from "react";
import { News, NewsInsert } from "./lib/types/news";

interface NewsFormProps {
  news?: News;
  onSave: (news: NewsInsert | News) => Promise<void>;
  onCancel: () => void;
}

const NewsForm: React.FC<NewsFormProps> = ({ news, onSave, onCancel }) => {
  const [title, setTitle] = useState(news?.title || "");
  const [description, setDescription] = useState(news?.description || "");
  const [content, setContent] = useState(news?.content || "");
  const [category, setCategory] = useState(news?.category || "");
  const [imageUrl, setImageUrl] = useState(news?.image_url || "");
  const [published, setPublished] = useState(news?.published ?? true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      title,
      description: description || null,
      content: content || null,
      category: category || null,
      image_url: imageUrl || null,
      published,
      ...(news?.id ? { id: news.id } : {}),
    };

    try {
      await onSave(payload);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-emerald-500/30 bg-black/80 p-6 backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.15)]">
      <h3 className="text-xl font-bold tracking-wider text-emerald-400 mb-6 uppercase flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        {news ? "Editar Noticia" : "Nueva Noticia"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">Título</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg bg-zinc-900/90 border border-zinc-700 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
            placeholder="Título de la noticia..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">Categoría</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg bg-zinc-900/90 border border-zinc-700 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
              placeholder="Ej. Gaming, Hardware..."
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">URL de Imagen</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full rounded-lg bg-zinc-900/90 border border-zinc-700 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
              placeholder="https://..."
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">Descripción Breve</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg bg-zinc-900/90 border border-zinc-700 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
            placeholder="Resumen o bajada..."
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">Contenido Principal</label>
          <textarea
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded-lg bg-zinc-900/90 border border-zinc-700 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition resize-none"
            placeholder="Escribe todo el contenido aquí..."
          />
        </div>

        <div className="flex items-center gap-2 py-2">
          <input
            type="checkbox"
            id="published"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="rounded bg-zinc-900 border-zinc-700 text-emerald-500 focus:ring-emerald-500 h-4 w-4"
          />
          <label htmlFor="published" className="text-sm font-medium text-zinc-300">Publicar inmediatamente</label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 rounded-lg text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)] transition disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Guardar Noticias"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewsForm;