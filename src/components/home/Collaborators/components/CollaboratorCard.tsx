"use client";

import { motion } from "framer-motion";
import { Collaborator } from "../data/Collaborators";

interface Props {
  collaborator: Collaborator;
  index: number;
  expanded: boolean;
  onClick: (collaborator: Collaborator) => void;
}

/*
|--------------------------------------------------------------------------
| Carta individual
|--------------------------------------------------------------------------
*/

export default function CollaboratorCard({
  collaborator,
  onClick,
}: Props) {
  return (
    <motion.div
        whileHover={{
          y: -20,
          scale: 1.03,
        }}
        whileTap={{
          scale: 0.96,
        }}
        transition={{
          type: "spring",
          stiffness: 320,
          damping: 20,
        }}
        onClick={() => onClick(collaborator)}

        className="relative h-[420px] w-[250px] cursor-pointer"
      >

      {/* Borde */}
      <div
        className="absolute inset-0 transition-all duration-300"
        style={{
      background: `linear-gradient(
          135deg,
          ${collaborator.color},
          transparent 90%
      )`,
        }}
      />

      {/* Carta */}
      <div
        className="absolute inset-[2px] overflow-hidden"
        style={{
          clipPath:
            "polygon(0 0,100% 0,100% 92%,88% 100%,0 100%)",
        }}
      >

      <img
        src={collaborator.avatar}
        alt={collaborator.name}
        className="h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"/>

      <div className="absolute bottom-6 left-6">
        <h3 className="text-2xl font-bold">
          {collaborator.name}
        </h3>
      </div>

  </div>

</motion.div>
  );
}