"use client";

import { useEffect, useState } from "react";

/*
|--------------------------------------------------------------------------
| useIsMobile
|--------------------------------------------------------------------------
| Detecta si el viewport está por debajo del breakpoint indicado usando
| `matchMedia` (más eficiente que escuchar el evento `resize`).
|--------------------------------------------------------------------------
*/
export function useIsMobile(breakpoint = 900) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);

    const update = () => setIsMobile(mql.matches);

    update();
    mql.addEventListener("change", update);

    return () => mql.removeEventListener("change", update);
  }, [breakpoint]);

  return isMobile;
}
