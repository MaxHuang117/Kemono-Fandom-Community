"use client";

import SectionTitle from "./components/SectionTitle";

import CollaboratorStack from "./components/CollaboratorStack";

import StackButton from "./components/StackButton";

import { collaborators } from "./data/Collaborators";

import { useCards } from "./hooks/useCards";

import { useSelectedCard } from "./hooks/useSelectedCard";

import { useHoveredCard } from "./hooks/useHoveredCard";

import CollaboratorModal from "./components/CollaboratorModal";

import { useCardLayout } from "./hooks/useCardLayout";

export default function Collaborators() {

  const {
    hoveredId,
    setHoveredId,
  } = useHoveredCard();

  const {
    selected,
    openCard,
    closeCard,
  } = useSelectedCard();

const {
    getHeight,
    getButtonMargin,
    mobile,
    
} = useCardLayout(collaborators.length);

const { expanded, toggleCards } = useCards();

  return (

      <section
          id="colaboradores"
          className="
              relative
              isolate
              overflow-hidden
              bg-black
              py-32
          "
          style={{
              minHeight: mobile
                  ? getHeight(expanded) + 220
                  : 820,
          }}
      >

      <SectionTitle

        title="Colaboradores"

        subtitle="Conoce a las personas detrás de la comunidad."

      />

    <CollaboratorStack
        collaborators={collaborators}
        expanded={expanded}
        onCardClick={openCard}
        hoveredId={hoveredId}
        setHoveredId={setHoveredId}
    />

    <div
        className="flex justify-center transition-all duration-500"
        style={{
            marginTop: getButtonMargin(expanded),
        }}
    >
        <StackButton
            expanded={expanded}
            toggleCards={toggleCards}
        />
    </div>

    <CollaboratorModal
        collaborator={selected}
        onClose={closeCard}
    />

    </section>

  );

}