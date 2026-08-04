"use client";

import { useState } from "react";

export interface PopupPosition {

    x: number;

    y: number;

}

export function useFloatingPopup() {

    const [open, setOpen] = useState(false);

    const [position, setPosition] = useState<PopupPosition>({
        x: 0,
        y: 0,
    });

    function abrir(
        element: HTMLElement
    ) {

        const rect = element.getBoundingClientRect();

        setPosition({

            x: rect.left + rect.width / 2,

            y: rect.top,

        });

        setOpen(true);

    }

    function cerrar() {

        setOpen(false);

    }

    return {

        open,

        position,

        abrir,

        cerrar,

    };

}