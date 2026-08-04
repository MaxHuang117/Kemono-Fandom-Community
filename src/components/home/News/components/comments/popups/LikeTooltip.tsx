"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { DEFAULT_AVATAR } from "../../lib/constants/avatar";
import type { LikeUI } from "../../lib/mappers/likeMapper";

interface Props {
    open: boolean;
    usuarios: LikeUI[];

    x: number;
    y: number;

    onMouseEnter:()=>void;
    onMouseLeave:()=>void;

    onOpenProfile:(userId:string)=>void;

}

export default function LikeTooltip({

    open,
    usuarios,
    x,
    y,

    onMouseEnter,
    onMouseLeave,
    
    onOpenProfile,

}: Props) {

    return (

        <AnimatePresence>

            {open && (

                <motion.div

                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}

                    initial={{
                        opacity: 0,
                        y: 8,
                        scale: .95,
                    }}

                    animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                    }}

                    exit={{
                        opacity: 0,
                        y: 8,
                        scale: .95,
                    }}

                    transition={{
                        duration: .18,
                    }}

                    style={{

                        position:"fixed",

                        left:x,

                        top:y,

                        transform:"translate(-50%, calc(-100% - 24px))",

                    }}

                    className="
                    w-72
                    rounded-2xl
                    border
                    border-white/10
                    bg-[#181818]
                    shadow-2xl
                    overflow-hidden
                    z-50
                    "

                >

                    <div className="px-4 py-3 border-b border-white/5 text-sm font-semibold">

                        ❤️ {usuarios.length} personas

                    </div>

                    <div className="max-h-64 overflow-y-auto">

                        {usuarios.length === 0 && (

                            <div className="px-4 py-6 text-white/40 text-sm">

                                Nadie todavía.

                            </div>

                        )}

                        {usuarios.map((u) => (

                        <button

                            key={u.userId}

                            type="button"

                            className="
                                w-full
                                flex
                                items-center
                                gap-3

                                px-4
                                py-3

                                text-left

                                hover:bg-white/5

                                transition
                            "

                            onClick={() => {

                                onOpenProfile?.(u.userId);

                            }}

                        >

                                <Image

                                    src={

                                        u.profile.avatar ||

                                        DEFAULT_AVATAR
                                    }

                                    alt="avatar"

                                    width={36}

                                    height={36}

                                    className="rounded-full"

                                />

                                <div>

                                    <div className="text-sm font-semibold">

                                        {

                                            u.profile.username ||

                                            u.profile.discord ||

                                            "Usuario"

                                        }

                                    </div>

                                    <div className="text-xs text-white/40">

                                        @{u.profile.discord ?? "usuario"}

                                    </div>

                                </div>

                        </button>

                        ))}

                    </div>

                </motion.div>

            )}

        </AnimatePresence>

    );

}