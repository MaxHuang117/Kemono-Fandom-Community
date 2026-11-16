"use client";

import { motion } from "framer-motion";
import { HeroSlide } from "./HeroSlides";

interface Props {
  slides: HeroSlide[];
  current: number;
  progress: number;
}

/*
|--------------------------------------------------------------------------
| Indicadores estilo Steam / GeForce
|--------------------------------------------------------------------------
| Fase 2: color unificado a neón (D3); recibe los slides por prop.
|--------------------------------------------------------------------------
*/

export default function HeroIndicators({ slides, current, progress }: Props) {
  return (
    <div className="flex items-center gap-3">
      {slides.map((_, index) => {
        const active = current === index;

        return (
          <motion.div
            key={index}
            animate={{
              width: active ? 64 : 10,
              borderRadius: 999,
            }}
            transition={{
              duration: 0.35,
              ease: "easeInOut",
            }}
            className="relative h-[10px] overflow-hidden bg-white/15"
          >
            {active && (
              <motion.div
                className="absolute left-0 top-0 h-full"
                style={{ background: "#61ff61" }}
                animate={{
                  width: `${progress}%`,
                }}
                transition={{
                  ease: "linear",
                  duration: 0.05,
                }}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
