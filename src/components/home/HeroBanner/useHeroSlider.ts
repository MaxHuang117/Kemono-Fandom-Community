"use client";

import { useEffect, useState } from "react";
import { heroSlides } from "./HeroSlides";

/*
|--------------------------------------------------------------------------
| Hook del Slider
|--------------------------------------------------------------------------
| Controla:
|
| ✔ Banner actual
| ✔ Cambio automático
| ✔ Barra de progreso
|--------------------------------------------------------------------------
*/

const DURATION = 7000;

export function useHeroSlider() {

  const [current, setCurrent] = useState(0);

  const [progress, setProgress] = useState(0);

  /*---------------------------------------------------
    Barra de progreso
  ---------------------------------------------------*/

  useEffect(() => {

    setProgress(0);

    const start = Date.now();

    const animation = setInterval(() => {

      const elapsed = Date.now() - start;

      const percent = Math.min(
        (elapsed / DURATION) * 100,
        100
      );

      setProgress(percent);

    }, 16);

    const slider = setTimeout(() => {

      setCurrent(prev =>
        prev === heroSlides.length - 1
          ? 0
          : prev + 1
      );

    }, DURATION);

    return () => {

      clearTimeout(slider);

      clearInterval(animation);

    };

  }, [current]);



  function nextSlide() {

    setCurrent(prev =>
      prev === heroSlides.length - 1
        ? 0
        : prev + 1
    );

  }



  function previousSlide() {

    setCurrent(prev =>
      prev === 0
        ? heroSlides.length - 1
        : prev - 1
    );

  }

  return {

    slide: heroSlides[current],

    current,

    progress,

    nextSlide,

    previousSlide,

  };

}