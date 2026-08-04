"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { News } from "../../../data/NewsData";

import CommentCard from "../cards/CommentCard"
import CommentInput from "../modal/CommentInput";

import type { UserProfile } from "../../lib/types/profile";
import UserProfileModal from "../popups/UserProfileModal";
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

    selectedUser: UserProfile | null;

    /*
    |--------------------------------------------------------------------------
    | Eventos
    |--------------------------------------------------------------------------
    */

    onClose: () => void;

    onLoadComments: () => void;

    onDeleteComment: (commentId: string) => void;

    onCommentUpdated: () => void;

    onSelectUser: (
        user: UserProfile | null
    ) => void;

}

export default function NewsCommentsModal({
    news,
    comments,
    currentUserId,
    selectedUser,
    onClose,
    onLoadComments,
    onDeleteComment,
    onCommentUpdated,
    onSelectUser,
}: ModalProps) {
    
    return (
        <>
            {/* Fondo oscuro con Blur */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            >
                {/* Contenedor del Modal */}
                <motion.div
                    onClick={(e) => e.stopPropagation()}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="fixed left-1/2 top-1/2 w-full max-w-4xl h-[88vh] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-white/10 bg-[#111] overflow-hidden flex flex-col"
                >
                    {/* Header: Imagen e Info de la Noticia */}
                    <div className="shrink-0 border-b border-white/10 relative">
                        <button
                            onClick={onClose}
                            className="absolute left-6 top-6 h-10 w-10 rounded-full bg-black/50 backdrop-blur transition hover:bg-black/70 flex items-center justify-center text-white z-10"
                        >
                            ←
                        </button>

                        <div className="relative h-40 w-full">

                            <Image
                                src={news.image}
                                alt={news.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 896px"
                            />

                        </div>

                        <div className="p-8 py-6">
                            <p className="text-sm text-gray-400">{news.date}</p>
                            <h2 className="mt-2 text-3xl font-bold">{news.title}</h2>
                            <p className="mt-4 text-gray-300 leading-7">{news.description}</p>
                        </div>
                    </div>

                    {/* Contador de Comentarios */}
                    <div className="px-8 py-4 border-b border-white/10 font-semibold text-white">
                        💬 {comments.length} comentarios
                    </div>

                    {/* Caja de Input Fijo */}
                    <div className="shrink-0 px-8 py-6 border-b border-white/10">
                        <CommentInput newsId={news.id} onCommentPosted={onLoadComments} />
                    </div>

                    {/* Lista Scrolleable de Comentarios */}
                    <div className="flex-1 overflow-y-auto">
                        {comments.map((comment) => (

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
