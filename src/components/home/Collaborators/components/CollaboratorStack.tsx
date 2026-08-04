"use client";

import { motion } from "framer-motion";

import CollaboratorCard from "./CollaboratorCard";

import { Collaborator } from "../data/Collaborators";

import { useCardLayout } from "../hooks/useCardLayout";

interface Props {

    collaborators: Collaborator[];

    expanded: boolean;

    hoveredId:number|null;

  setHoveredId:(id:number|null)=>void;

  onCardClick: (collaborator: Collaborator) => void;

}

/*
|--------------------------------------------------------------------------
| Baraja de colaboradores
|--------------------------------------------------------------------------
*/

export default function CollaboratorStack({

  collaborators,

  expanded,

  hoveredId,

  setHoveredId,

  onCardClick,

}: Props) {

    const {

        mobile,
        
        getX,

        getRotation,

        getHeight,

    } = useCardLayout(collaborators.length);

  return (

    <div
    className="
        relative
        mx-auto
        w-full
        max-w-[1200px]
        flex
        justify-center
    "
    style={{
        height: getHeight(expanded),
    }}
    >

      {

collaborators.map((collaborator,index)=>(

<motion.div

    key={collaborator.id}

    onHoverStart={() => setHoveredId(collaborator.id)}

    onHoverEnd={() => setHoveredId(null)}

    animate={{
        x: mobile
            ? 0
            : getX(index, expanded),

        y: mobile
            ? (expanded ? index * 340 : index * 55)
            : 0,

        rotate: mobile
            ? 0
            : getRotation(index, expanded),
    }}

    transition={{

        type: "spring",

        stiffness: 140,

        damping: 18,

    }}

    style={{

        zIndex:

            hoveredId === collaborator.id

                ? 999

                : collaborators.length - index,

    }}

    className={"absolute"}

>

<CollaboratorCard

    collaborator={collaborator}

    expanded={expanded}

    index={index}

    onClick={onCardClick}

/>

</motion.div>

))

      }

    </div>

  );

}