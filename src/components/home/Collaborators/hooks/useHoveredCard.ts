"use client";

import { useState } from "react";

/*
|--------------------------------------------------------------------------
| Carta con el mouse encima
|--------------------------------------------------------------------------
*/

export function useHoveredCard() {

  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return {

    hoveredId,

    setHoveredId,

  };

}