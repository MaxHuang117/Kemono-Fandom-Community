"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { getAdminHeroSlidesAction, saveHeroSlideAction, deleteHeroSlideAction } from "./actions/heroAction";

interface HeroSlide {
    id: string;
    title: string;
    subtitle: string;
    image_url: string;
    cta_label: string;
    cta_url: string;
    position: number;
    active: boolean;
}

const emptySlide: Omit<HeroSlide, "id"> = {
    title: "",
    subtitle: "",
    image_url: "",
    cta_label: "",
    cta_url: "",
    position: 0,
    active: true,
};

export default function HeroAdminClient() {
    const [slides, setSlides] = useState<HeroSlide[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<HeroSlide | null>(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const loadSlides = useCallback(async () => {
        try {
            const data = await getAdminHeroSlidesAction();
            setSlides(data as HeroSlide[]);
        } catch (error) {
            console.error("Error cargando slides:", error);
            setMessage({ type: "error", text: "Error cargando slides." });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSlides();
    }, [loadSlides]);

    const handleEdit = (slide: HeroSlide) => {
        setEditing(slide);
        setPreviewImage(slide.image_url);
        setMessage(null);
    };

    const handleNew = () => {
        setEditing({ id: "", ...emptySlide });
        setPreviewImage(null);
        setMessage(null);
    };

    const handleCancel = () => {
        setEditing(null);
        setPreviewImage(null);
        setMessage(null);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editing) return;

        setSaving(true);
        setMessage(null);

        const formData = new FormData(e.currentTarget);
        const result = await saveHeroSlideAction(formData);

        if (result.error) {
            setMessage({ type: "error", text: result.error });
        } else {
            setMessage({ type: "ok", text: "Slide guardado correctamente." });
            setEditing(null);
            setPreviewImage(null);
            await loadSlides();
        }
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Eliminar este slide?")) return;

        const result = await deleteHeroSlideAction(id);
        if (result.error) {
            setMessage({ type: "error", text: result.error });
        } else {
            setMessage({ type: "ok", text: "Slide eliminado." });
            await loadSlides();
        }
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="h-8 w-8 border-2 border-neon border-t-transparent rounded-full motion-safe:animate-spin mx-auto mb-4" />
                <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Cargando...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-neon/20 pb-4 gap-4">
                <div>
                    <h1 className="text-3xl font-black uppercase text-white tracking-widest">Hero<span className="text-neon">Slides</span></h1>
                    <p className="text-xs font-mono text-zinc-500 mt-1">&gt; GESTIÓN DE BANNERS DEL HERO</p>
                </div>
                <button
                    onClick={handleNew}
                    className="px-4 py-2 bg-neon text-black font-bold text-xs uppercase tracking-widest hover:bg-neon-bright transition-colors"
                >
                    + Nuevo slide
                </button>
            </div>

            {message && (
                <div className={`px-4 py-3 border rounded text-sm font-mono ${message.type === "ok" ? "bg-neon/10 border-neon/40 text-neon-bright" : "bg-red-500/10 border-red-500/40 text-red-400"}`} role="status">
                    {message.text}
                </div>
            )}

            {editing && (
                <form onSubmit={handleSubmit} className="bg-[#0a0a0a] border border-white/10 p-6 rounded-xl space-y-4">
                    <input type="hidden" name="id" value={editing.id} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-mono uppercase tracking-widest text-zinc-500 mb-1">Título</label>
                            <input name="title" defaultValue={editing.title} required maxLength={120} className="w-full bg-[#050505] border border-white/10 focus:border-neon px-4 py-2 text-white outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-mono uppercase tracking-widest text-zinc-500 mb-1">Posición</label>
                            <input name="position" type="number" min={0} defaultValue={editing.position} required className="w-full bg-[#050505] border border-white/10 focus:border-neon px-4 py-2 text-white outline-none" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-mono uppercase tracking-widest text-zinc-500 mb-1">Subtítulo</label>
                        <input name="subtitle" defaultValue={editing.subtitle} maxLength={240} className="w-full bg-[#050505] border border-white/10 focus:border-neon px-4 py-2 text-white outline-none" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-mono uppercase tracking-widest text-zinc-500 mb-1">CTA Label</label>
                            <input name="cta_label" defaultValue={editing.cta_label} maxLength={40} className="w-full bg-[#050505] border border-white/10 focus:border-neon px-4 py-2 text-white outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-mono uppercase tracking-widest text-zinc-500 mb-1">CTA URL</label>
                            <input name="cta_url" type="url" defaultValue={editing.cta_url} className="w-full bg-[#050505] border border-white/10 focus:border-neon px-4 py-2 text-white outline-none" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-mono uppercase tracking-widest text-zinc-500 mb-1">Imagen</label>
                        <div className="flex flex-col sm:flex-row gap-4 items-start">
                            <input
                                type="file"
                                name="imageFile"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) setPreviewImage(URL.createObjectURL(file));
                                }}
                                className="text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-mono file:bg-neon file:text-black hover:file:bg-neon-bright"
                            />
                            <span className="text-xs text-zinc-500 font-mono self-center">o</span>
                            <input
                                name="image_url"
                                type="url"
                                defaultValue={editing.image_url}
                                placeholder="https://..."
                                onChange={(e) => setPreviewImage(e.target.value)}
                                className="flex-1 bg-[#050505] border border-white/10 focus:border-neon px-4 py-2 text-white outline-none text-sm"
                            />
                        </div>
                        {previewImage && (
                            <div className="relative mt-4 h-40 w-full rounded overflow-hidden border border-white/10">
                                <Image src={previewImage} alt="Preview" fill className="object-cover" />
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <input id="active" name="active" type="checkbox" value="true" defaultChecked={editing.active} className="accent-neon" />
                        <label htmlFor="active" className="text-sm text-zinc-400">Activo</label>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={saving} className="px-6 py-2 bg-neon text-black font-bold text-xs uppercase tracking-widest hover:bg-neon-bright transition-colors disabled:bg-zinc-800 disabled:text-zinc-500">
                            {saving ? "Guardando..." : "Guardar slide"}
                        </button>
                        <button type="button" onClick={handleCancel} className="px-6 py-2 border border-zinc-700 text-zinc-400 font-bold text-xs uppercase tracking-widest hover:border-zinc-500 hover:text-white transition-colors">
                            Cancelar
                        </button>
                    </div>
                </form>
            )}

            <div className="grid gap-3">
                {slides.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-zinc-800 rounded">
                        <p className="text-zinc-500 font-mono text-sm">No hay slides configurados.</p>
                    </div>
                ) : (
                    slides.map((slide) => (
                        <div key={slide.id} className="flex flex-col sm:flex-row gap-4 p-4 bg-[#0a0a0a] border-l-2 border-l-zinc-700 hover:border-l-neon border-t border-t-white/5 border-r border-r-white/5 border-b border-b-white/5 transition-all">
                            <div className="relative h-24 w-full sm:w-40 shrink-0 rounded overflow-hidden bg-zinc-950">
                                {slide.image_url ? (
                                    <Image src={slide.image_url} alt={slide.title} fill className="object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-zinc-600 text-xs font-mono">Sin imagen</div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-white truncate">{slide.title}</h3>
                                    {!slide.active && <span className="text-[10px] font-mono text-zinc-500 border border-zinc-700 px-1.5 py-0.5 rounded">INACTIVO</span>}
                                </div>
                                <p className="text-xs text-zinc-500 truncate">{slide.subtitle}</p>
                                <p className="text-[10px] font-mono text-zinc-600 mt-1">Pos: {slide.position} · CTA: {slide.cta_label || "—"}</p>
                            </div>
                            <div className="flex sm:flex-col gap-2 justify-end">
                                <button onClick={() => handleEdit(slide)} className="text-xs font-mono text-neon hover:text-neon-bright uppercase tracking-widest">Editar</button>
                                <button onClick={() => handleDelete(slide.id)} className="text-xs font-mono text-red-400 hover:text-red-300 uppercase tracking-widest">Eliminar</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
