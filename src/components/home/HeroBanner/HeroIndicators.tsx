"use client";

import { motion } from "framer-motion";
import { heroSlides } from "./HeroSlides";

interface Props {

  current: number;

  progress: number;

}

const colors = [

  "#61ff61",

  "#ef4444",

  "#9146FF",

];

/*
|--------------------------------------------------------------------------
| Indicadores estilo Steam / GeForce
|--------------------------------------------------------------------------
*/

export default function HeroIndicators({

  current,

  progress,

}: Props) {

  return (

    <div className="flex items-center gap-3">

      {heroSlides.map((_, index) => {

        const active = current === index;

        return (

          <motion.div

            key={index}

            animate={{

              width: active ? 64 : 10,

              borderRadius: active ? 999 : 999,

            }}

            transition={{

              duration: .35,

              ease: "easeInOut",

            }}

            className="
              relative
              h-[10px]
              overflow-hidden
              bg-white/15
            "

          >

            {active && (

              <motion.div

                className="absolute left-0 top-0 h-full"

                style={{

                  background: colors[index],

                }}

                animate={{

                  width: `${progress}%`

                }}

                transition={{

                  ease:"linear",

                  duration:.05

                }}

              />

            )}

          </motion.div>

        );

      })}

    </div>

  );

}