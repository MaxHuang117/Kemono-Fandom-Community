"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Collaborator } from "../data/Collaborators";

interface Props {
  collaborator: Collaborator | null;
  scrollDisabled?: boolean;
  onClose: () => void;
}

/*
|--------------------------------------------------------------------------
| Modal del colaborador
|--------------------------------------------------------------------------
| Se inspira en el perfil de Discord.
|--------------------------------------------------------------------------
*/

export default function CollaboratorModal({
  collaborator,
  onClose,
}: Props) {

  // Efecto para bloquear y desbloquear el scroll del body
  useEffect(() => {
    if (collaborator) {
      // Guarda el estilo anterior y bloquea el scroll
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";

      // Limpieza al desmontar o cerrar el modal
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [collaborator]);

  return (
    <AnimatePresence>
      {collaborator && (
        <motion.div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div // Elemento animado
            initial={{
              scale: 0.8,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            exit={{
              scale: 0.8,
              opacity: 0,
            }}
            transition={{
              duration: 0.3,
            }}
            onClick={(e) => e.stopPropagation()}
            className="
              relative
              w-[850px]
              max-w-[90vw]
              max-h-[90vh]
              overflow-y-auto
              rounded-3xl
              border
              border-white/10
              bg-[#111]
              shadow-2xl
            "
          >
            {/* Banner */}
            <div
              className="h-52 bg-cover bg-center"
              style={{
                backgroundImage: `url(${collaborator.banner})`,
              }}
            />

            {/* Avatar */}
            <img
              src={collaborator.avatar}
              alt={collaborator.name}
              className="
                absolute
                left-10
                top-36
                h-32
                w-32
                rounded-full
                border-6
                border-[#111]
                object-cover
              "
            />

            {/* Contenido */}
            <div className="px-10 pb-10 pt-20">
              <h2 className="text-4xl font-bold">{collaborator.name}</h2>

              <p className="mt-6 text-gray-300 leading-8">
                {collaborator.bio}
              </p>

              <div className="mt-8 flex gap-4">
                {(() => {
                const hasTwitch = Boolean(collaborator.twitch); //Desactiva la visibilidad del botón si no tiene Twitch
                  return (
                    <a
                      href={hasTwitch ? collaborator.twitch : undefined}
                      aria-disabled={!hasTwitch}
                      target={hasTwitch ? "_blank" : undefined}
                      rel={hasTwitch ? "noopener noreferrer" : undefined}
                      className={`rounded-xl bg-[#9146FF] px-6 py-3 font-bold transition-all ${
                        hasTwitch
                          ? "hover:opacity-90"
                          : "opacity-0 cursor-not-allowed pointer-events-none"
                      }`}
                    >
                      Twitch
                    </a>
                  );
                })()}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}