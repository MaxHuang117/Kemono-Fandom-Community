"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { publicarComentarioAction } from "../actions/commentsAction";
import {
    validateComment,
    COMMENT_MAX_LENGTH,
} from "../../lib/validators/commentValidator";
import Image from "next/image";
interface Props {
    newsId: number;
    onCommentPosted: () => void;
}

export default function CommentInput({ newsId, onCommentPosted }: Props) {
    const { data: session } = useSession();
    const [text, setText] = useState("");
    const [enviando, setEnviando] = useState(false);

    async function publicarComentario() {
        if (enviando) return;

        const validation = validateComment(text);

        if (!validation.valid) {

            alert(validation.error);

            return;

        }

        setEnviando(true);
        const result = await publicarComentarioAction(newsId, text);
        setEnviando(false);

        if (result.error) {
            alert("Error al comentar: " + result.error);
            return;
        }

        setText("");
        onCommentPosted();
    }

    // ─── VISTA CUANDO NO HAY SESIÓN INICIADA ─────────────────────────────────
    if (!session) {
        return (
            <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-1 text-center backdrop-blur-sm">
                {/* Decoración de fondo difuminada */}
                <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-[#5865F2]/10 blur-3xl pointer-events-none" />
                <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-green-500/10 blur-3xl pointer-events-none" />

                <div className="relative z-10 max-w-sm mx-auto space-y-4">
                    <div className="text-2xl">💬</div>
                    <div>
                        <h4 className="text-lg font-bold text-white">¿Quieres unirte a la conversación?</h4>
                        <p className="text-sm text-gray-400 mt-1">
                            Inicia sesión de forma segura para compartir lo que opinas sobre esta novedad.
                        </p>
                    </div>
                    
                    <button
                        onClick={() => signIn("discord")}
                        className="w-full inline-flex items-center justify-center gap-3 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white px-5 py-3 font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#5865F2]/20"
                    >
                        {/* Icono simple de Discord SVG */}
                        <svg className="h-5 w-5 fill-current" viewBox="0 0 127.14 96.36">
                          <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.79,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.68,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.81,11.1,105.25,105.25,0,0,0,32.22-16.15c2.62-27.28-4.48-51.2-20.49-72.14ZM42.45,65.69C36.18,65.69,31,60,31,53s5.18-12.71,11.45-12.71S53.9,46,53.9,53,48.73,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.23,60,73.23,53s5.18-12.71,11.46-12.71S96.16,46,96.16,53,91,65.69,84.69,65.69Z"/>
                        </svg>
                        Conectar con Discord
                    </button>
                </div>
            </div>
        );
    }

    // ─── VISTA CUANDO SÍ HAY SESIÓN INICIADA ──────────────────────────────────
    return (
        <div className="space-y-4">
            <div className="flex gap-4">
                <Image
                    src={session?.user?.image || "https://discordapp.com"}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full border border-white/10 object-cover"
                    alt="Avatar"
                />
                <div className="flex-1 space-y-2">
                    <textarea
                        maxLength={COMMENT_MAX_LENGTH}
                        rows={2}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        disabled={enviando}
                        placeholder="Comparte lo que opinas acerca de esta novedad"
                        className="w-full resize-none bg-transparent outline-none text-lg text-white placeholder-gray-500 disabled:opacity-50"
                    />
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-white/40">
                            {text.length}/{COMMENT_MAX_LENGTH}
                        </span>
                    </div>
                </div>
            </div>

            <div className="mt-4 flex justify-end">
                <button
                    onClick={publicarComentario}
                    disabled={enviando}
                    className="rounded-xl bg-[#404040] hover:bg-[#505050] transition-colors px-5 py-2 font-semibold text-white disabled:opacity-50"
                >
                    {enviando ? "Publicando..." : "Publicar"}
                </button>
            </div>
        </div>
    );
}
