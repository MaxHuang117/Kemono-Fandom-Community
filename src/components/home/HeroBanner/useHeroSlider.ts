"use client";

import { useEffect, useState } from "react";
import { HeroSlide } from "./HeroSlides";

/*
|--------------------------------------------------------------------------
| Hook del Slider
|--------------------------------------------------------------------------
| Fase 2: recibe el array de slides por prop (puede venir de DB o fallback).
|--------------------------------------------------------------------------
*/

const DURATION = 7000;

export function useHeroSlider(slides: HeroSlide[]) {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(() => 0);

  useEffect(() => {
    if (slides.length === 0) return;

    const start = Date.now();
    const animation = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.min((elapsed / DURATION) * 100, 100));
    }, 16);

    const slider = setTimeout(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, DURATION);

    return () => {
      clearInterval(animation);
      clearTimeout(slider);
    };
  }, [current, slides.length]);

  function nextSlide() {
    if (slides.length === 0) return;
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }

  function previousSlide() {
    if (slides.length === 0) return;
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }

  return {
    slide: slides[current],
    current,
    progress,
    nextSlide,
    previousSlide,
  };
}
