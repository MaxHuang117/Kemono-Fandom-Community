"use client";

import { motion } from "framer-motion";

import type { UserProfile } from "../../lib/types/profile";
import Image from "next/image";
/*
|--------------------------------------------------------------------------
| Props
|--------------------------------------------------------------------------
*/

interface Props {

    user: UserProfile | null;

    onClose: () => void;

}

/*
|--------------------------------------------------------------------------
| Modal de Perfil
|--------------------------------------------------------------------------
*/

export default function UserProfileModal({

    user,

    onClose,

}: Props) {

    return (

        <>


            {

                user && (

                    <>

                        {/* Fondo */}

                        <motion.div

                            className="
                                fixed
                                inset-0
                                z-[100]
                                bg-black/70
                                backdrop-blur-sm
                            "

                            initial={{ opacity:0 }}

                            animate={{ opacity:1 }}

                            exit={{ opacity:0 }}

                            onClick={onClose}

                        />

                        {/* Modal */}

                        <motion.div

                            initial={{
                                opacity:0,
                                scale:.9,
                            }}

                            animate={{
                                opacity:1,
                                scale:1,
                            }}

                            exit={{
                                opacity:0,
                                scale:.9,
                            }}

                            className="
                                fixed
                                left-1/2
                                top-1/2
                                z-[101]
                                w-[95%]
                                max-w-xl
                                -translate-x-1/2
                                -translate-y-1/2
                                overflow-hidden
                                rounded-3xl
                                bg-[#181818]
                                border
                                border-white/10
                            "

                        >

                            {/* Banner */}

                            <div className="relative h-52 overflow-hidden">

                                {

                                    user.banner

                                    ? (

                                        <Image
                                            src={user.banner}
                                            alt={user.username}
                                            fill
                                            sizes="(max-width: 640px) 100vw, 600px"
                                            className="object-cover"

                                        />

                                    )

                                    : (

                                        <div className="h-full bg-gradient-to-r from-green-600 to-green-900"/>

                                    )

                                }

                            </div>

                            {/* Avatar */}

                            <div className="relative z-10 -mt-12 px-8">

                                <Image

                                    src={user.avatar}
                                    alt={user.username}
                                    width={128}
                                    height={128}
                                    className="
                                        h-32
                                        w-32
                                        rounded-full
                                        border-4
                                        border-[#181818]
                                        shadow-2xl
                                        object-cover
                                    "

                                />

                            </div>

                            {/* Información */}

                            <div className="px-8 pb-8">

                                <h2 className="mt-4 text-3xl font-bold">

                                    {user.username}

                                </h2>

                                <p className="text-green-400">

                                    @{user.discord}

                                </p>

                                <div
                                className="
                                mt-8
                                rounded-2xl
                                bg-[#111]
                                border
                                border-white/10
                                p-6
                                leading-7
                                text-gray-300
                                "
                                >

                                {user.biografia || "Este usuario todavía no escribió una biografía."}

                                </div>

                            </div>

                        </motion.div>

                    </>

                )

            }

        </>

    );

}