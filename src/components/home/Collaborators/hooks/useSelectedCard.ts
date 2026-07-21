"use client";

import { useState } from "react";
import { Collaborator } from "../data/Collaborators";

/*
|--------------------------------------------------------------------------
| useSelectedCard
|--------------------------------------------------------------------------
| Controla qué colaborador tiene abierto el perfil.
|--------------------------------------------------------------------------
*/

export function useSelectedCard() {

  const [selected, setSelected] =
    useState<Collaborator | null>(null);

  function openCard(
    collaborator: Collaborator
  ) {
    setSelected(collaborator);
  }

  function closeCard() {
    setSelected(null);
  }

  return {

    selected,

    openCard,

    closeCard,

  };

}