"use client";

import { useState, useEffect } from "react";
import { getAdminCommentsAction, deleteCommentAction } from "./actions/commentsActions";

interface CommentItem {
    id: string;
    message: string | null;
    news_id: number | null;
    created_at: string | null;
    user_id: string | null;
}

export default function CommentsAdminClient() {
    const [comments, setComments] = useState<CommentItem[]>([]);
    const [isProcessing, setIsProcessing] = useState<string | null>(null);

    const loadComments = async () => {
        try {
            const data = await getAdminCommentsAction();
            if (data) setComments(data as CommentItem[]);
        } catch (error) {
            console.error("Error cargando comentarios:", error);
        }
    };

    useEffect(() => { loadComments(); }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("SYSTEM ALERT: ¿Purgar este comentario permanentemente?")) return;
        
        setIsProcessing(id);
        try {
            const response = await deleteCommentAction(id);
            if (response.success) {
                loadComments();
            }
        } catch (error: any) {
            alert(error.message || "Error al purgar");
        }
        setIsProcessing(null);
    };

    return (
        <div className="space-y-8 font-sans">
            {/* Cabecera */}
            <div className="flex justify-between items-end border-b-2 border-emerald-500/20 pb-4">
                <div>
                    <h1 className="text-3xl font-black uppercase text-white tracking-widest">Database<span className="text-emerald-500">_Comms</span></h1>
                    <p className="text-xs font-mono text-zinc-500 mt-1">&gt; MODERATION PROTOCOL ACTIVE (READ & PURGE ONLY)</p>
                </div>
            </div>

            {/* Grid de Comentarios */}
            <div className="grid gap-4">
                {comments.length === 0 ? (
                    <div className="text-center py-12 text-zinc-600 font-mono text-sm tracking-widest uppercase border border-white/5 bg-[#0a0a0a]">
                        NO_COMMENTS_FOUND
                    </div>
                ) : (
                    comments.map((item) => (
                        <div key={item.id} className="group flex flex-col md:flex-row justify-between items-start md:items-center p-5 bg-[#0a0a0a] border-l-4 border-l-zinc-700 hover:border-l-red-500 border-t border-t-white/5 border-r border-r-white/5 border-b border-b-white/5 hover:bg-[#111] transition-all duration-300 gap-4 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                            <div className="min-w-0 flex-1">
                                <div className="flex gap-2 mb-2 flex-wrap">
                                    <span className="text-[9px] font-mono px-2 py-0.5 bg-white/5 text-zinc-400 uppercase tracking-widest border border-white/10">
                                        ID: {item.id.substring(0, 8)}
                                    </span>
                                    {item.news_id && (
                                        <span className="text-[9px] font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 uppercase tracking-widest">
                                            REF_NEWS: {item.news_id}
                                        </span>
                                    )}
                                    {item.created_at && (
                                        <span className="text-[9px] font-mono px-2 py-0.5 bg-zinc-900 text-zinc-500 uppercase tracking-widest">
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm font-semibold text-zinc-200 line-clamp-3 leading-relaxed">
                                    {item.message || "[EMPTY_STRING]"}
                                </p>
                            </div>
                            
                            {/* Botón de Purgar */}
                            <div className="flex gap-3 w-full md:w-auto shrink-0 font-mono text-xs uppercase tracking-widest">
                                <button 
                                    onClick={() => handleDelete(item.id)} 
                                    disabled={isProcessing === item.id}
                                    className="group/btn relative px-6 py-2 bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-black font-black transform -skew-x-12 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="inline-block transform skew-x-12">
                                        {isProcessing === item.id ? "EXECUTING..." : "[ PURGE ]"}
                                    </span>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}