"use client";

import {
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

/*
|--------------------------------------------------------------------------
| Hook del Parallax
|--------------------------------------------------------------------------
| Devuelve el movimiento suave del fondo
|--------------------------------------------------------------------------
*/

export function useHeroEffects() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const spring = {
    damping: 35,
    stiffness: 130,
  };

  const springX = useSpring(mouseX, spring);
  const springY = useSpring(mouseY, spring);

  const imageX = useTransform(springX, [-500, 500], [-12, 25]);
  const imageY = useTransform(springY, [-500, 500], [-30, 120]);

  function handleMouseMove(
    e: React.MouseEvent<HTMLElement>
  ) {
    mouseX.set(e.clientX - window.innerWidth / 2);
    mouseY.set(e.clientY - window.innerHeight / 2);
  }

  return {
    imageX,
    imageY,
    handleMouseMove,
  };
}