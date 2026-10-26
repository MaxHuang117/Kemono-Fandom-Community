"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { saveNewsAction, deleteNewsAction, getAdminNewsAction } from "./actions/newsAction";

// ... (Mismos interfaces y estados iniciales)
interface NewsItem {
    id: number;
    title: string;
    description: string | null;
    content: string | null;
    category: string | null;
    published: boolean;
    image_url: string | null;
}

export default function NewsModalClient() {
    const supabase = createClient();
    const [news, setNews] = useState<NewsItem[]>([]);
    const [activeModal, setActiveModal] = useState<NewsItem | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [loadingAction, setLoadingAction] = useState(false);

    // ... (Estados del formulario y FileRef se mantienen)
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("");
    const [published, setPublished] = useState(true);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

const loadNews = async () => {
    try {
        const data = await getAdminNewsAction();
        if (data) setNews(data as NewsItem[]);
    } catch (error) {
        console.error("Error cargando noticias de admin:", error);
    }
};

    useEffect(() => { loadNews(); }, []);

    // ... (Controladores openCreateModal, openEditModal, closeModal, handleFileChange idénticos)
const openCreateModal = () => {
        setIsCreating(true);
        setActiveModal({ id: 0, title: "", description: null, content: null, category: null, published: true, image_url: null });
        setTitle(""); 
        setDescription(""); 
        setContent(""); 
        setCategory(""); 
        setPublished(false); // Por defecto una nueva nace publicada (o cámbialo a false si prefieres que nazca como borrador)
        setImageUrl(null); 
        setImageFile(null);
    };

    const openEditModal = (item: NewsItem) => {
        setIsCreating(false);
        setActiveModal(item);
        setTitle(item.title || "");
        setDescription(item.description || "");
        setContent(item.content || "");
        setCategory(item.category || "");
        setPublished(Boolean(item.published)); // 👈 CORRECCIÓN CLAVE: Forzar booleano real para el checkbox
        setImageUrl(item.image_url);
        setImageFile(null);
    };

    const closeModal = () => {
        setActiveModal(null);
        setImageFile(null);
        setLoadingAction(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleUpdateServer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeModal) return;
        setLoadingAction(true);

        const formData = new FormData();
        formData.append("id", activeModal.id.toString());
        formData.append("title", title);
        formData.append("description", description);
        formData.append("content", content);
        formData.append("category", category);
        formData.append("published", published.toString());
        if (imageUrl) formData.append("image_url", imageUrl);
        if (imageFile) formData.append("imageFile", imageFile);

        try {
            await saveNewsAction(formData);
            closeModal();
            loadNews();
        } catch (error: any) {
            alert(error.message || "Error al guardar");
            setLoadingAction(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("ALERTA: ¿Eliminar esta noticia?")) return;
        try {
            await deleteNewsAction(id);
            loadNews();
        } catch (error) {
            alert("Error eliminando");
        }
    };

    /* ==========================================
       PANEL: INTERFAZ DE USUARIO (GEFORCE UI)
    ========================================== */
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                <h1 className="text-2xl font-black uppercase text-white tracking-wider">Módulo de Noticias</h1>
                <button 
                    onClick={openCreateModal}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.3)] transition"
                >
                    + Crear Noticia
                </button>
            </div>

            <div className="grid gap-4">
                {news.map((item) => (
                    <div key={item.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-zinc-950/80 border border-zinc-800 rounded-xl hover:border-emerald-500/50 transition gap-4">
                        <div className="flex items-center gap-4 w-full">
                            {item.image_url ? (
                                <img src={item.image_url} alt="Portada" className="w-16 h-16 object-cover rounded-lg border border-zinc-800 shrink-0" />
                            ) : (
                                <div className="w-16 h-16 bg-zinc-900 rounded-lg border border-zinc-800 flex items-center justify-center text-zinc-700 text-xs shrink-0">Sin Img</div>
                            )}
                            <div className="min-w-0 flex-1">
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-emerald-400 border border-zinc-700 mr-2 inline-block mb-1">
                                    {item.category || "GENERAL"}
                                </span>
                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${item.published ? "bg-emerald-950 text-emerald-400 border-emerald-800" : "bg-amber-950 text-amber-400 border-amber-800"} border inline-block mb-1`}>
                                    {item.published ? "Publicado" : "Borrador"}
                                </span>
                                <h3 className="font-bold text-white text-sm md:text-base truncate">{item.title}</h3>
                            </div>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0 shrink-0">
                            <button
                                onClick={() => openEditModal(item)}
                                className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black font-bold text-[10px] uppercase border border-emerald-500/30 transition shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                            >
                                Editar
                            </button>
                            <button
                                onClick={() => handleDelete(item.id)}
                                className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-black font-bold text-[10px] uppercase border border-red-500/30 transition shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {activeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="w-full max-w-2xl bg-zinc-950 border border-emerald-500/40 rounded-2xl p-6 shadow-[0_0_30px_rgba(16,185,129,0.2)] space-y-4 my-8 relative">
                        <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                            <h2 className="text-lg font-bold text-emerald-400 uppercase tracking-wider">
                                {isCreating ? "Desplegar Nueva Noticia" : `Editar Noticia #${activeModal.id}`}
                            </h2>
                            <button onClick={closeModal} className="text-zinc-500 hover:text-white font-mono text-xl">✕</button>
                        </div>
                        
                        <form onSubmit={handleUpdateServer} className="space-y-4">
                            <div className="p-4 bg-zinc-900/50 border border-dashed border-zinc-700 rounded-xl">
                                <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-2">Portada de Noticia (Storage)</label>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs text-white rounded-lg border border-zinc-700 transition shrink-0"
                                    >
                                        Examinar Local...
                                    </button>
                                    <span className="text-xs text-zinc-500 truncate w-full">
                                        {imageFile ? imageFile.name : (imageUrl ? "Imagen actual cargada" : "Ningún archivo seleccionado")}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-1">Título</label>
                                <input value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-white focus:border-emerald-500 outline-none transition" />
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-1">Categoría</label>
                                    <input value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-white focus:border-emerald-500 outline-none transition" />
                                </div>
                                <div className="flex items-center gap-2 pt-1 sm:pt-6">
                                    <input type="checkbox" id="pub" checked={published} onChange={(e) => setPublished(e.target.checked)} className="accent-emerald-500 h-4 w-4" />
                                    <label htmlFor="pub" className="text-xs font-bold text-zinc-300 select-none cursor-pointer">Estado: Publicado</label>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-1">Descripción (Bajada)</label>
                                <input value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-white focus:border-emerald-500 outline-none transition" />
                            </div>
                            
                            <div>
                                <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-1">Contenido Principal</label>
                                <textarea rows={5} value={content} onChange={(e) => setContent(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-white focus:border-emerald-500 outline-none resize-none transition" />
                            </div>
                            
                            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                                <button type="button" onClick={closeModal} className="px-5 py-2 text-xs font-bold text-zinc-400 hover:text-white transition">Cancelar</button>
                                <button disabled={loadingAction} type="submit" className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.4)] disabled:opacity-50 transition">
                                    {loadingAction ? "Sincronizando..." : "Guardar en BD"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}