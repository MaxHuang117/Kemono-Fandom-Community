"use client";

import { signIn } from "next-auth/react";

interface Props {

    callbackUrl?: string;

}

export default function LoginCard({

    callbackUrl = "/perfil",

}: Props) {

    return (

        <div
            className="
                relative
                min-h-[75vh]
                flex
                items-center
                justify-center
                p-6
                overflow-hidden
                select-none
                font-sans
            "
        >

            <div
                className="
                    absolute
                    top-1/3
                    left-1/4
                    h-80
                    w-80
                    rounded-full
                    bg-green-500/5
                    blur-[120px]
                    pointer-events-none
                "
            />

            <div
                className="
                    absolute
                    bottom-1/3
                    right-1/4
                    h-80
                    w-80
                    rounded-full
                    bg-[#5865F2]/5
                    blur-[120px]
                    pointer-events-none
                "
            />

            <div
                className="
                    relative
                    z-10
                    w-full
                    max-w-md
                    rounded-2xl
                    border
                    border-white/10
                    bg-[#0c0c0c]/90
                    p-10
                    text-center
                    backdrop-blur-2xl
                    shadow-2xl
                    shadow-black
                "
            >

                <div
                    className="
                        text-xs
                        font-mono
                        text-green-500
                        tracking-[0.2em]
                        uppercase
                        mb-2
                    "
                >
                    Kemono Fandom Community
                </div>

                <h1
                    className="
                        text-3xl
                        font-black
                        tracking-tight
                        text-white
                        uppercase
                        bg-gradient-to-r
                        from-white
                        via-gray-400
                        to-white
                        bg-clip-text
                        text-transparent
                    "
                >
                    KFC PORTAL
                </h1>

                <p
                    className="
                        text-xs
                        text-gray-400
                        mt-4
                        leading-relaxed
                        max-w-xs
                        mx-auto
                    "
                >
                    Vincula el nodo de Discord para personalizar tu perfil,
                    comentar y reclamar privilegios.
                </p>

                <button

                    onClick={() =>
                        signIn("discord", {
                            callbackUrl,
                        })
                    }

                    className="
                        w-full
                        mt-8
                        inline-flex
                        items-center
                        justify-center
                        gap-3
                        rounded-xl
                        bg-[#5865F2]
                        hover:bg-[#4752C4]
                        text-white
                        font-bold
                        py-3.5
                        px-6
                        transition-all
                        hover:scale-[1.02]
                        active:scale-[0.98]
                    "

                >

                    Conectar vía Discord

                {/* Icono simple de Discord SVG */}
                <svg className="h-5 w-5 fill-current" viewBox="0 0 127.14 96.36">
                  <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.79,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.68,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.81,11.1,105.25,105.25,0,0,0,32.22-16.15c2.62-27.28-4.48-51.2-20.49-72.14ZM42.45,65.69C36.18,65.69,31,60,31,53s5.18-12.71,11.45-12.71S53.9,46,53.9,53,48.73,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.23,60,73.23,53s5.18-12.71,11.46-12.71S96.16,46,96.16,53,91,65.69,84.69,65.69Z"/>
                </svg>
                </button>

            </div>

        </div>

    );

}