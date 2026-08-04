"use client";

import { useEffect, useRef, useState } from "react";

interface Props{

    onEdit?:()=>void;

    onDelete?:()=>void;

}

export default function CommentMenu({

    onEdit,

    onDelete,

}:Props){

    const [open,setOpen]=useState(false);

    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {

    function handleClickOutside(event: MouseEvent) {

        if (
            menuRef.current &&
            !menuRef.current.contains(event.target as Node)
        ) {

            setOpen(false);

        }

    }

    document.addEventListener(
        "mousedown",
        handleClickOutside
    );

    return () =>
        document.removeEventListener(
            "mousedown",
            handleClickOutside
        );

}, []);

    return(

        <div 
        
            ref={menuRef}

            className="relative"
        
        >

            <button

                onClick={() => setOpen(prev => !prev)}

                className="

                h-8

                w-8

                rounded-full

                hover:bg-white/10

                transition

                "

            >

                ⋯

            </button>

            {

                open && (

                    <div

                        className="

                        absolute

                        right-0

                        mt-2

                        w-44

                        rounded-xl

                        border

                        border-white/10

                        bg-[#181818]

                        shadow-xl

                        overflow-hidden

                        "

                    >

                        <button

                            onClick={() => {

                                setOpen(false);

                                onEdit?.();

                            }}

                            className="

                            w-full

                            px-4

                            py-3

                            text-left

                            hover:bg-white/5

                            "

                        >

                            ✏️ Editar

                        </button>

                        <button
                            onClick={() => {

                                setOpen(false);

                                onDelete?.();

                            }}

                            className="

                            w-full

                            px-4

                            py-3

                            text-left

                            text-red-400

                            hover:bg-red-500/10

                            "

                        >

                            🗑 Eliminar

                        </button>

                    </div>

                )

            }

        </div>

    );

}