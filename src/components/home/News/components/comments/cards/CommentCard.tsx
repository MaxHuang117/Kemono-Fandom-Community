"use client";

import { useState } from "react";

import {
    COMMENT_MAX_LENGTH,
    validateComment,
} from "../../lib/validators/commentValidator";

import {
    editarComentarioAction,
} from "../actions/commentsAction";
import Image from "next/image";
import type { UserProfile } from "../../lib/types/profile";
import { useCommentLikes } from "../../../hooks/useCommentLikes";
import HeartButton from "./HeartButton";
import LikeUsersPopup from "../popups/LikeUsersPopup";
import { CommentUI } from "../../lib/mappers/commentMapper";
import { formatDate } from "../../lib/utils/formatDate";
import CommentMenu from "./CommentMenu";




interface Props {
    comment: CommentUI;

    currentUserId:string | null;

    onOpenProfile:(user: UserProfile) => void;

    onDelete:() => void;

    onUpdated: () => void;
}

/*
|--------------------------------------------------------------------------
| Comentario individual
|--------------------------------------------------------------------------
*/
export default function CommentCard({
    comment,
    currentUserId,
    onOpenProfile,
    onDelete,
    onUpdated,

}: Props) {
    // Hooks para manejar los likes de un comentario
    const {
        likes,
        liked,
        usuarios,
        toggleLike,
        loading,
        
    } = useCommentLikes(comment.id);

    const [editing, setEditing] = useState(false);

    const [editedMessage, setEditedMessage] = useState(comment.message);

    const [saving, setSaving] = useState(false);

    const isOwner = currentUserId === comment.userId;

    return (
        <div className="flex gap-4 px-8 py-5 border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
            {/* Avatar del usuario (Clickable) */}
            <div className="shrink-0">
                <button 
                    onClick={() => onOpenProfile(comment.profile)}
                    className="relative block h-10 w-10 overflow-hidden rounded-full transition-transform active:scale-95 hover:opacity-80"
                >
                    <Image
                        src={comment.profile.avatar || "https://discordapp.com"}
                        alt={`Avatar de ${comment.profile.username}`}
                        fill
                        sizes="40px"
                        className="object-cover"
                    />
                </button>
            </div>

            <div className="flex-1">

                {/* Cabecera */}
                <div className="flex items-start justify-between">

                    <div className="flex items-center gap-2 text-sm">

                        <button
                            onClick={() => onOpenProfile(comment.profile)}
                            className="font-bold text-white hover:text-green-400 transition-colors"
                        >
                            {comment.profile.username}
                        </button>

                        <span className="text-white/30 text-xs">|</span>

                        <span
                            className="text-white/40 text-xs"
                            title={comment.createdAt}
                        >
                            {formatDate(comment.createdAt)}
                        </span>

                    </div>

                    {isOwner && (
                        <CommentMenu
                            onEdit={() => setEditing(true)}
                            onDelete={onDelete}
                        />
                    )}

                </div>

                    {/* Cuerpo del Mensaje */}
                    {editing ? (

                        <div className="space-y-3">

                            <textarea

                                maxLength={COMMENT_MAX_LENGTH}

                                value={editedMessage}

                                onChange={(e) => setEditedMessage(e.target.value)}

                                rows={3}

                                className="

                                    w-full
                                    resize-none
                                    rounded-xl
                                    border
                                    border-white/10
                                    bg-[#1b1b1b]
                                    p-3
                                    text-gray-200
                                    outline-none
                                    focus:border-green-500
                                    whitespace-pre-wrap
                                    break-words
                                    overflow-hidden

                                "

                            />

                                <div className="flex justify-between items-center">

                                    <span className="text-xs text-white/40">

                                        {editedMessage.length}/{COMMENT_MAX_LENGTH}

                                    </span>

                                </div>

                            <div className="flex justify-end gap-2">

                                <button

                                    disabled={saving}

                                    onClick={() => {

                                        setEditedMessage(comment.message);

                                        setEditing(false);

                                    }}

                                    className="

                                        rounded-lg

                                        px-4

                                        py-2

                                        bg-white/5

                                        hover:bg-white/10

                                        disabled:opacity-50
                                        disabled:cursor-not-allowed

                                    "

                                >

                                    Cancelar

                                </button>

                                <button

                                    disabled={saving}

                                    onClick={async () => {

                                        if (editedMessage.trim() === comment.message.trim()) {
                                            setEditing(false);
                                            return;
                                        }

                                        const validation = validateComment(editedMessage);

                                        if (!validation.valid) {

                                            alert(validation.error);

                                            return;

                                        }

                                        setSaving(true);

                                        const result = await editarComentarioAction(

                                            comment.id,
                                            editedMessage,

                                        );

                                        if (result.error) {

                                            setSaving(false);

                                            alert(result.error);

                                            return;

                                        }

                                        setSaving(false);

                                        setEditing(false);

                                        onUpdated();

                                    }}

                                    className="
                                    rounded-lg
                                    px-4
                                    py-2
                                    bg-green-600
                                    hover:bg-green-500
                                    disabled:opacity-50
                                    disabled:cursor-not-allowed
                                    "

                                >

                                    {saving ? "Guardando..." : "Guardar"}

                                </button>

                            </div>

                        </div>

                    ) : (

                        <p className="text-[15px] leading-relaxed text-gray-300 whitespace-pre-wrap break-all pr-4">

                            {comment.message}

                        </p>

                    )}

                    {/* Acciones del Comentario */}
                    <div className="pt-2 flex items-center gap-6 text-white/40 text-xs">

                    <LikeUsersPopup

                        usuarios={usuarios}
                        onOpenProfile={onOpenProfile}

                    >

                    <HeartButton

                        likes={likes}
                        liked={liked}
                        loading={loading}
                        onClick={toggleLike}

                    />

                    </LikeUsersPopup>

                </div>

            </div>
                
        </div>
    );
}
