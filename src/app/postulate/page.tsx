"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { SITE_CONFIG, ALL_TAGS } from "@/config/site.config";
import { postularCreadorAction, obtenerEstadoPostulacionAction } from "./actions";

export default function PostulatePage() {
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
    const [statusInfo, setStatusInfo] = useState<{ status: string | null; category: string | null; tags: string[] } | null>(null);

    const [category, setCategory] = useState("");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    useEffect(() => {
        if (status === "loading") return;
        if (!session) {
            redirect("/login");
            return;
        }

        obtenerEstadoPostulacionAction().then((res) => {
            if (!res.error && res) {
                const info = res as { status: string | null; category: string | null; tags: string[] };
                setStatusInfo(info);
                if (info.category) setCategory(info.category);
                if (info.tags) setSelectedTags(info.tags);
            }
            setLoading(false);
        });
    }, [session, status]);

    if (status === "loading" || loading) {
        return (
            <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center font-sans">
                <div className="text-center">
                    <div className="h-8 w-8 border-2 border-neon border-t-transparent rounded-full motion-safe:animate-spin mx-auto mb-4" />
                    <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Cargando...</p>
                </div>
            </main>
        );
    }

    if (!session) return null;

    const isPending = statusInfo?.status === "pending";
    const isApproved = statusInfo?.status === "approved";

    const toggleTag = (tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!category) return;

        setSending(true);
        setMessage(null);

        const formData = new FormData();
        formData.append("category", category);
        formData.append("tags", JSON.stringify(selectedTags));

        const result = await postularCreadorAction(formData);
        if (result.error) {
            setMessage({ type: "error", text: result.error });
        } else {
            setMessage({ type: "ok", text: "¡Postulación enviada! Un administrador la revisará pronto." });
            setStatusInfo((prev) => prev ? { ...prev, status: "pending" } : prev);
        }
        setSending(false);
    };

    return (
        <main className="min-h-screen bg-[#050505] text-white py-24 px-6 font-sans">
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-neon/10 blur-[140px] pointer-events-none rounded-full" />

            <div className="max-w-2xl mx-auto relative z-10">
                <div className="border-l-4 border-neon pl-4 mb-8">
                    <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-wider">Postúlate como Creador</h1>
                    <p className="text-sm text-zinc-500 mt-2">Forma parte del directorio de creadores de Kemono Fandom.</p>
                </div>

                {isApproved && (
                    <div className="mb-6 px-4 py-3 bg-neon/10 border border-neon/40 rounded text-neon-bright text-sm font-mono" role="status">
                        ✅ Ya eres un creador aprobado. Puedes gestionar tu perfil en <a href="/perfil" className="underline hover:text-white">Mi Perfil</a>.
                    </div>
                )}

                {isPending && (
                    <div className="mb-6 px-4 py-3 bg-yellow-500/10 border border-yellow-500/40 rounded text-yellow-400 text-sm font-mono" role="status">
                        ⏳ Tu postulación está en revisión. Te notificaremos cuando sea aprobada.
                    </div>
                )}

                {message && (
                    <div className={`mb-6 px-4 py-3 border rounded text-sm font-mono ${message.type === "ok" ? "bg-neon/10 border-neon/40 text-neon-bright" : "bg-red-500/10 border-red-500/40 text-red-400"}`} role="status">
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 bg-[#0a0a0a] border border-white/10 p-6 sm:p-8 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.8)]">
                    <div>
                        <label htmlFor="category" className="block text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2">
                            Categoría principal
                        </label>
                        <select
                            id="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            disabled={isPending || isApproved}
                            required
                            className="w-full bg-[#050505] border border-white/10 focus:border-neon text-white px-4 py-3 outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <option value="" disabled>Selecciona una categoría</option>
                            {SITE_CONFIG.categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <span className="block text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2">
                            Tags (máx. recomendado 5)
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {ALL_TAGS.map((tag) => (
                                <button
                                    key={tag}
                                    type="button"
                                    disabled={isPending || isApproved}
                                    onClick={() => toggleTag(tag)}
                                    aria-pressed={selectedTags.includes(tag)}
                                    className={`px-3 py-1 text-xs font-mono rounded border transition-all ${
                                        selectedTags.includes(tag)
                                            ? "bg-neon/20 border-neon text-neon-bright"
                                            : "bg-[#050505] border-white/10 text-zinc-400 hover:border-zinc-600"
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={sending || isPending || isApproved || !category}
                        className="w-full py-3 bg-neon hover:bg-neon-bright disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-black font-black text-xs uppercase tracking-[0.2em] transition-colors"
                    >
                        {sending ? "Enviando..." : isPending ? "En revisión" : isApproved ? "Ya aprobado" : "Enviar postulación"}
                    </button>
                </form>
            </div>
        </main>
    );
}
