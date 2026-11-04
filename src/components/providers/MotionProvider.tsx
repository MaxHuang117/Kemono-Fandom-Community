"use client";

import { MotionConfig } from "framer-motion";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

/*
|--------------------------------------------------------------------------
| MotionProvider
|--------------------------------------------------------------------------
| Configura framer-motion para respetar la preferencia del sistema
| `prefers-reduced-motion` en todos los componentes hijos.
|--------------------------------------------------------------------------
*/
export default function MotionProvider({ children }: Props) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
