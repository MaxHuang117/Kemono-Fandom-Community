"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { News } from "../../../data/NewsData";

import CommentCard from "../cards/CommentCard"
import CommentInput from "../modal/CommentInput";

import type { UserProfile } from "../../lib/types/profile";
import UserProfileModal from "../../../../../modals/UserProfileModal";
import { CommentUI } from "../../lib/mappers/commentMapper";

interface ModalProps {

    /*
    |--------------------------------------------------------------------------
    | Datos
    |--------------------------------------------------------------------------
    */

    news: News;

    comments: CommentUI[];

    currentUserId: string | null;

    // 🔁 Indica si los comentarios están cargando (renderiza el skeleton).
    loadingComments?: boolean;

    selectedUser: UserProfile | null;

    /*
    |--------------------------------------------------------------------------
    | Eventos
    |--------------------------------------------------------------------------
    */

    onClose: () => void;

    onLoadComments: () => Promise<void>;

    onDeleteComment: (commentId: string) => void;

    onCommentUpdated: () => Promise<void>;

    onSelectUser: (
        user: UserProfile | null
    ) => void;

}

/*
|--------------------------------------------------------------------------
| Skeleton de comentario
|--------------------------------------------------------------------------
| Imita la forma de CommentCard (avatar + líneas de texto) para evitar
| saltos visuales mientras se cargan los comentarios.
|--------------------------------------------------------------------------
*/
function CommentSkeleton() {
    return (
        <div className="flex gap-4 px-5 py-5 border-b border-white/5 sm:px-8" aria-hidden="true">
            {/* Avatar */}
            <div className="h-10 w-10 shrink-0 rounded-full bg-zinc-800 animate-pulse" />
            {/* Líneas de texto */}
            <div className="flex-1 space-y-2">
                <div className="h-3 w-32 bg-zinc-800 animate-pulse" />
                <div className="h-3 w-full bg-zinc-900 animate-pulse" />
                <div className="h-3 w-3/4 bg-zinc-900 animate-pulse" />
            </div>
        </div>
    );
}

export default function NewsCommentsModal({
    news,
    comments,
    loadingComments = false,
    currentUserId,
    selectedUser,
    onClose,
    onLoadComments,
    onDeleteComment,
    onCommentUpdated,
    onSelectUser,
}: ModalProps) {

    // Comentarios desplegables (en móvil evita que el header tape la lista).
    const [commentsOpen, setCommentsOpen] = useState(true);

    // Descripción larga: se trunca y se puede expandir.
    const [descriptionExpanded, setDescriptionExpanded] = useState(false);
    const showDescriptionToggle = news.description.length > 160;

    return (
        <>
            {/* Fondo oscuro con Blur */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm sm:p-4"
            >
                {/* Contenedor del Modal: full-screen en móvil, tarjeta centrada en desktop */}
                <motion.div
                    onClick={(e) => e.stopPropagation()}
                    initial={{ opacity: 0, y: 24, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 24, scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 220, damping: 26 }}
                    className="relative flex h-full w-full flex-col overflow-hidden bg-[#0c0c0c] sm:h-[88vh] sm:max-w-4xl sm:rounded-3xl sm:border sm:border-white/10"
                >
                    {/* Header: Imagen e Info de la Noticia */}
                    <div className="shrink-0 border-b border-white/10">
                        <div className="relative h-36 w-full sm:h-48">
                            <Image
                                src={news.image}
                                alt={news.title}
                                fill
                                className="object-cover"
                                sizes="100vw"
                            />
                            {/* Degradado para legibilidad del botón de cierre */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-transparent to-black/30 pointer-events-none" />

                            <button
                                onClick={onClose}
                                aria-label="Cerrar"
                                className="absolute left-4 top-4 h-10 w-10 rounded-full bg-black/50 backdrop-blur transition hover:bg-black/70 flex items-center justify-center text-white z-10"
                            >
                                ←
                            </button>
                        </div>

                        <div className="px-5 py-5 sm:px-8 sm:py-6">
                            <p className="text-xs text-gray-400">{news.date}</p>
                            <h2 className="mt-1 text-2xl font-bold leading-tight sm:text-3xl">{news.title}</h2>
                            <p
                                className={`mt-3 text-sm leading-relaxed text-gray-300 sm:text-[15px] ${descriptionExpanded ? "" : "line-clamp-3"}`}
                            >
                                {news.description}
                            </p>
                            {showDescriptionToggle && (
                                <button
                                    onClick={() => setDescriptionExpanded((v) => !v)}
                                    aria-expanded={descriptionExpanded}
                                    className="mt-2 text-xs font-semibold text-neon-bright hover:text-neon transition-colors"
                                >
                                    {descriptionExpanded ? "Ver menos" : "Ver más"}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Toggle de Comentarios (desplegable) */}
                    <button
                        onClick={() => setCommentsOpen((v) => !v)}
                        aria-expanded={commentsOpen}
                        className="shrink-0 flex items-center justify-between px-5 py-4 sm:px-8 border-b border-white/10 text-left hover:bg-white/[0.02] transition-colors"
                    >
                        <span className="font-semibold text-white">
                            💬 {loadingComments ? "…" : comments.length} comentarios
                        </span>
                        <span className="text-xs text-white/50">
                            {commentsOpen ? "Ocultar" : "Mostrar"}
                        </span>
                    </button>

                    {commentsOpen && (
                        <>
                            {/* Caja de Input Fijo */}
                            <div className="shrink-0 px-5 py-5 sm:px-8 sm:py-6 border-b border-white/10">
                                <CommentInput newsId={news.id} onCommentPosted={onLoadComments} />
                            </div>

                            {/* Lista Scrolleable de Comentarios */}
                            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
                                {loadingComments ? (
                                    // 🎞️ Skeleton mientras cargan los comentarios
                                    <>
                                        <CommentSkeleton />
                                        <CommentSkeleton />
                                        <CommentSkeleton />
                                    </>
                                ) : comments.length === 0 ? (
                                    // 🙂 Estado vacío
                                    <div className="px-8 py-16 text-center" role="status">
                                        <p className="text-xs font-mono uppercase tracking-widest text-zinc-500">Sin comentarios</p>
                                        <p className="mt-2 text-sm text-zinc-500">Sé el primero en comentar.</p>
                                    </div>
                                ) : comments.map((comment) => (

                                    <CommentCard
                                        key={comment.id}
                                        currentUserId={currentUserId}
                                        comment={comment}
                                        onOpenProfile={onSelectUser}
                                        onDelete={() => onDeleteComment(comment.id)}
                                        onUpdated={onCommentUpdated}
                                    />

                                ))}
                            </div>
                        </>
                    )}
                </motion.div>
            </motion.div>

            {/* Modal de Perfil de Usuario */}
            {selectedUser && (
                <UserProfileModal
                    user={selectedUser}
                    onClose={() => onSelectUser(null)}
                />
            )}
        </>
    );
}
