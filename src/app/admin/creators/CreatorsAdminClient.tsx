"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import {
    getCreatorApplicationsAction,
    approveCreatorAction,
    rejectCreatorAction,
    featureCreatorAction,
    unfeatureCreatorAction,
    removeCreatorAction,
} from "./actions/creatorsAction";

interface CreatorApplication {
    id: string;
    discord_username: string | null;
    nombre_publico: string | null;
    avatar_url: string | null;
    streamer_status: string | null;
    streamer_category: string | null;
    tags: string[] | null;
    tier_level: number | null;
}

type StatusFilter = "all" | "pending" | "approved" | "rejected";

export default function CreatorsAdminClient() {
    const [applications, setApplications] = useState<CreatorApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<StatusFilter>("all");
    const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

    const loadApplications = useCallback(async () => {
        try {
            const data = await getCreatorApplicationsAction();
            setApplications(data as CreatorApplication[]);
        } catch (error) {
            console.error("Error cargando postulaciones:", error);
            setMessage({ type: "error", text: "Error cargando postulaciones." });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadApplications();
    }, [loadApplications]);

    const handleAction = async (action: (id: string) => Promise<{ success?: boolean; error?: string }>, id: string, successMsg: string) => {
        setMessage(null);
        const result = await action(id);
        if (result.error) {
            setMessage({ type: "error", text: result.error });
        } else {
            setMessage({ type: "ok", text: successMsg });
            await loadApplications();
        }
    };

    const filtered = applications.filter((app) => filter === "all" || app.streamer_status === filter);

    const getStatusColor = (status: string | null) => {
        switch (status) {
            case "approved": return "bg-neon/10 border-neon/30 text-neon-bright";
            case "pending": return "bg-yellow-500/10 border-yellow-500/40 text-yellow-400";
            case "rejected": return "bg-red-500/10 border-red-500/40 text-red-400";
            default: return "bg-zinc-900 border-zinc-700 text-zinc-500";
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
                    <h1 className="text-3xl font-black uppercase text-white tracking-widest">Creator<span className="text-neon">_Hub</span></h1>
                    <p className="text-xs font-mono text-zinc-500 mt-1">&gt; POSTULACIONES Y DESTACADOS</p>
                </div>
                <div className="flex gap-2">
                    {(["all", "pending", "approved", "rejected"] as StatusFilter[]).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest border transition-colors ${
                                filter === f
                                    ? "bg-neon text-black border-neon"
                                    : "bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500"
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {message && (
                <div className={`px-4 py-3 border rounded text-sm font-mono ${message.type === "ok" ? "bg-neon/10 border-neon/40 text-neon-bright" : "bg-red-500/10 border-red-500/40 text-red-400"}`} role="status">
                    {message.text}
                </div>
            )}

            <div className="grid gap-3">
                {filtered.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-zinc-800 rounded">
                        <p className="text-zinc-500 font-mono text-sm">No hay postulaciones en este estado.</p>
                    </div>
                ) : (
                    filtered.map((app) => (
                        <div key={app.id} className="flex flex-col md:flex-row gap-4 p-4 bg-[#0a0a0a] border-l-2 border-l-zinc-700 hover:border-l-neon border-t border-t-white/5 border-r border-r-white/5 border-b border-b-white/5 transition-all">
                            <div className="relative h-14 w-14 shrink-0 rounded-full overflow-hidden border border-white/10 bg-[#050505]">
                                <Image
                                    src={app.avatar_url || "/default-avatar.png"}
                                    alt={app.discord_username || "Creador"}
                                    fill
                                    sizes="56px"
                                    className="object-cover"
                                />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <h3 className="font-bold text-white">{app.nombre_publico || app.discord_username || "Sin nombre"}</h3>
                                    <span className={`text-[9px] font-mono px-2 py-0.5 border uppercase tracking-widest ${getStatusColor(app.streamer_status)}`}>
                                        {app.streamer_status}
                                    </span>
                                    {app.tier_level === 2 && (
                                        <span className="text-[9px] font-mono px-2 py-0.5 border uppercase tracking-widest bg-blue-500/10 border-blue-500/40 text-blue-400">
                                            DESTACADO
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-zinc-500 font-mono">@{app.discord_username}</p>
                                <p className="text-xs text-zinc-400 mt-1">Categoría: <span className="text-neon-bright">{app.streamer_category || "—"}</span></p>
                                {app.tags && app.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {app.tags.map((tag) => (
                                            <span key={tag} className="text-[10px] font-mono px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-wrap md:flex-col gap-2 items-start md:items-end">
                                {app.streamer_status !== "approved" && (
                                    <button
                                        onClick={() => handleAction(approveCreatorAction, app.id, "Creador aprobado.")}
                                        className="text-xs font-mono text-neon hover:text-neon-bright uppercase tracking-widest"
                                    >
                                        Aprobar
                                    </button>
                                )}
                                {app.streamer_status !== "rejected" && (
                                    <button
                                        onClick={() => handleAction(rejectCreatorAction, app.id, "Postulación rechazada.")}
                                        className="text-xs font-mono text-red-400 hover:text-red-300 uppercase tracking-widest"
                                    >
                                        Rechazar
                                    </button>
                                )}
                                {app.streamer_status === "approved" && app.tier_level !== 2 && (
                                    <button
                                        onClick={() => handleAction(featureCreatorAction, app.id, "Creador destacado.")}
                                        className="text-xs font-mono text-blue-400 hover:text-blue-300 uppercase tracking-widest"
                                    >
                                        Destacar
                                    </button>
                                )}
                                {app.tier_level === 2 && (
                                    <button
                                        onClick={() => handleAction(unfeatureCreatorAction, app.id, "Destacado removido.")}
                                        className="text-xs font-mono text-zinc-400 hover:text-white uppercase tracking-widest"
                                    >
                                        Quitar destacado
                                    </button>
                                )}
                                {(app.tier_level ?? 0) >= 1 && (
                                    <button
                                        onClick={() => handleAction(removeCreatorAction, app.id, "Creador quitado.")}
                                        className="text-xs font-mono text-orange-400 hover:text-orange-300 uppercase tracking-widest"
                                    >
                                        Quitar aprobado
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
