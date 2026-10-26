"use client";

import { useState } from "react";

/*
|--------------------------------------------------------------------------
| Slider Mobile
|--------------------------------------------------------------------------
| Cambia la noticia mostrada en móvil.
|--------------------------------------------------------------------------
*/

export function useNewsSlider(total: number) {

    const [current, setCurrent] = useState(0);

    function next() {

        if (total === 0) return;

        setCurrent((prev) =>
            prev === total - 1
                ? 0
                : prev + 1
        );
    }

    function previous() {

        if (total === 0) return;

        setCurrent((prev) =>
            prev === 0
                ? total - 1
                : prev - 1
        );
    }

    return {
        current,
        next,
        previous,
    };
}