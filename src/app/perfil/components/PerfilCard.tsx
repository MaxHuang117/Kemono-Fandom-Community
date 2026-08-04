"use client";

import Image from "next/image";

interface Props {

    banner?: string;

    imagen: string;

    nombre: string;

    discordId: string;

    onSignOut: () => void;

}

export default function PerfilCard({

    banner,

    imagen,

    nombre,

    discordId,

    onSignOut,

}: Props) {

    return (

        <>

            <div className="border-l-2 border-green-500 pl-4">

                <h1 className="text-2xl font-black uppercase tracking-wider text-white">

                    Consola de Usuario

                </h1>

                <p className="text-xs text-gray-500 mt-0.5 font-mono">

                    ID: {discordId || "unknown_node"}

                </p>

            </div>

            <div
                className="
                    overflow-hidden
                    rounded-2xl
                    border
                    border-white/5
                    bg-[#0d0d0d]
                    shadow-2xl
                    shadow-black
                "
            >

                {/* Banner */}

                <div className="h-36 w-full relative overflow-hidden border-b border-white/5">

                    {

                        banner

                        ? (

                            <Image

                                src={banner}

                                alt="Banner"

                                fill

                                sizes="100vw"

                                className="h-full w-full object-cover"

                            />

                        )

                        : (

                            <div className="h-full bg-gradient-to-r from-green-600 to-green-900" />

                        )

                    }

                </div>

                {/* Avatar */}

                <div className="px-8 pb-6 relative flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">

                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5 -mt-14 sm:-mt-12">

                        <div
                            className="
                                relative
                                h-24
                                w-24
                                rounded-full
                                overflow-hidden
                                border-[3px]
                                border-[#0d0d0d]
                                bg-[#0d0d0d]
                            "
                        >

                            <Image

                                src={imagen}

                                fill

                                alt="Perfil"

                                sizes="96px"

                                className="object-cover"

                            />

                        </div>

                        <div className="sm:mt-12">

                            <h3 className="font-black text-xl">

                                {nombre}

                            </h3>

                            <div
                                className="
                                    inline-flex
                                    items-center
                                    gap-3
                                    rounded-md
                                    bg-green-500/10
                                    border
                                    border-green-500/20
                                    px-2
                                    py-1
                                    text-[10px]
                                    uppercase
                                    tracking-widest
                                    text-green-400
                                "
                            >

                                <span className="h-2 w-2 rounded-full bg-green-500 animate-ping"/>

                                ONLINE

                            </div>

                        </div>

                    </div>

                    <button

                        onClick={onSignOut}

                        className="
                            text-[11px]
                            uppercase
                            tracking-wider
                            text-gray-500
                            hover:text-red-400
                            border
                            border-white/5
                            rounded-lg
                            px-3
                            py-2
                            transition
                        "

                    >

                        Desconectar Nodo

                    </button>

                </div>

            </div>

        </>

    );

}