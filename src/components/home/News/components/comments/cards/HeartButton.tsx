"use client";

import { motion } from "framer-motion";

interface Props {

    likes: number;

    liked: boolean;

    loading: boolean;

    onClick: () => void;

}

export default function HeartButton({

    likes,

    liked,

    loading,

    onClick,

}: Props) {

    return (

        <motion.button

            type="button"

            onClick={onClick}

            disabled={loading}

            whileHover={{
                scale: 1.05,
                y: -1,
            }}

            whileTap={{
                scale: 0.88,
            }}

            transition={{
                type: "spring",
                stiffness: 450,
                damping: 20,
            }}

            className={`
                flex
                items-center
                gap-1.5

                px-2.5
                py-1

                rounded-lg

                border

                transition-all

                disabled:opacity-50
                disabled:cursor-not-allowed

                ${
                    liked

                        ? "bg-red-500/10 border-red-500/40 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.20)]"

                        : "bg-white/[0.02] border-white/5 hover:bg-red-500/10 hover:text-red-400"

                }

            `}
        >

            <motion.span

                animate={

                    liked

                        ? {

                            scale: [1,1.55,0.95,1],

                            rotate: [0,-12,12,-6,0],

                        }

                        : {}

                }

                transition={{

                    duration:0.35

                }}

                className={`
                    transition-all

                    ${

                        liked

                            ? "text-red-500 drop-shadow-[0_0_8px_rgb(239,68,68)]"

                            : "text-white/60"

                    }

                `}
            >

                ❤️

            </motion.span>

            <motion.span

                key={likes}

                initial={{

                    scale:0.6,

                    opacity:0.5,

                }}

                animate={{

                    scale:1,

                    opacity:1,

                }}

                transition={{

                    duration:0.18,

                }}

                className="font-semibold"

            >

                {likes}

            </motion.span>

        </motion.button>

    );

}