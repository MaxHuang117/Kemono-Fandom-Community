"use client";

import {

    ReactNode,
    useRef,
    useState,

} from "react";

import { createPortal } from "react-dom";
import LikeTooltip from "./LikeTooltip";
import { obtenerPerfilAction } from "../actions/commentsAction";
import { mapProfile } from "../../lib/mappers/profileMapper";
import type { LikeUI } from "../../lib/mappers/likeMapper";
import type { UserProfile } from "../../lib/types/profile";

interface Props{

    children: ReactNode;

    usuarios: LikeUI[];

    onOpenProfile?:(user: UserProfile)=>void;

}

export default function LikeUsersPopup({

    children,

    usuarios,

    onOpenProfile,

}:Props){

    const ref = useRef<HTMLDivElement>(null);

    const [open,setOpen]=useState(false);

    const [position,setPosition]=useState({

    x:0,

    y:0,

    });

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

        const openTooltip = () => {

        if (timeoutRef.current) {

            clearTimeout(timeoutRef.current);

        }

        handleOpen();

    }

    const closeTooltip = () => {

        timeoutRef.current = setTimeout(() => {

            setOpen(false);

        }, 120);

    }

    const handleOpen = () => {

        const rect = ref.current?.getBoundingClientRect();

        if(rect){

            setPosition({

                x: rect.left + rect.width/2,

                y: rect.top - 17,

            });

        }

        setOpen(true);

    }

    const handleUserClick = async (userId: string) => {

        const { data, error } = await obtenerPerfilAction(userId);

        if (error || !data) return;

        onOpenProfile?.(
            mapProfile(data)
        );

        setOpen(false);

    };

    return (

        <>

            <div

                ref={ref}

                onMouseEnter={openTooltip}

                onMouseLeave={closeTooltip}

            >

                {children}

            </div>

            {

                open && createPortal(

                    <LikeTooltip

                        open={true}
                        usuarios={usuarios}
                        x={position.x}
                        y={position.y}

                        onMouseEnter={openTooltip}
                        onMouseLeave={closeTooltip}

                        onOpenProfile={handleUserClick}

                    />,

                    document.body

                )

            }

        </>

    );

}