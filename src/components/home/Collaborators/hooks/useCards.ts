"use client";

import { useState } from "react";

/*
|--------------------------------------------------------------------------
| useCards
|--------------------------------------------------------------------------
| Controla si la baraja está abierta o cerrada.
|--------------------------------------------------------------------------
*/

export function useCards() {

  const [expanded, setExpanded] = useState(false);

  function toggleCards() {

    setExpanded((prev) => !prev);

  }

  return {

    expanded,

    toggleCards,

  };

}