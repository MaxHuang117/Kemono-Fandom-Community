"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MotionValue } from "framer-motion";
import { HeroSlide } from "./HeroSlides";

interface Props {
  slide: HeroSlide;

  imageX: MotionValue<number>;
  imageY: MotionValue<number>;
}

/*
|--------------------------------------------------------------------------
| Fondo del Hero
|--------------------------------------------------------------------------
| Cambia con una animación Fade + Zoom.
|--------------------------------------------------------------------------
*/

export default function HeroBackground({
  slide,
  imageX,
  imageY,
}: Props) {

  return (

    <AnimatePresence mode="wait">

      <motion.img
        key={slide.image}

        src={slide.image}
        alt={slide.title}

        initial={{
          opacity: 0,
          scale: 1.08,
        }}

        animate={{
          opacity: 1,
          scale: 1,
        }}

        exit={{
          opacity: 0,
          scale: 1.05,
        }}

        transition={{
          duration: 0.8,
        }}

        className="
          absolute
          h-[180%]
          w-[180%]
          object-cover
        "

        style={{
          x: imageX,
          y: imageY,

          left: "50%",
          top: "65%",

          translateX: "-50%",
          translateY: "-50%",
        }}

      />

    </AnimatePresence>

  );

}