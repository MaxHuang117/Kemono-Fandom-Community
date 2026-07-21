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

        setCurrent((prev) =>

            prev === total - 1
                ? 0
                : prev + 1

        );

    }

    function previous() {

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