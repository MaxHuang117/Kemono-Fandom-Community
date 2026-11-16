"use client";

import { useEffect, useState } from "react";
import { useHeroEffects } from "./HeroEffects";
import { useHeroSlider } from "./useHeroSlider";

import HeroBackground from "./HeroBackground";
import HeroOverlay from "./HeroOverlay";
import HeroContent from "./HeroContent";
import HeroBottomControls from "./HeroBottomControls";
import { HeroSlide, FALLBACK_HERO_SLIDES, mapHeroSlide } from "./HeroSlides";
import { obtenerHeroSlidesAction } from "@/actions/hero.action";
import HeroCreatorsRoster from "./HeroCreatorsRoster";

/*
|--------------------------------------------------------------------------
| Hero Banner
|--------------------------------------------------------------------------
| Fase 2:
|  - Lee slides desde hero_slides (DB) con fallback estático.
|  - CTA principal unificado a neón.
|  - CTAs fijos: Donar · Postúlate · Explorar creadores.
|  - Franja "Creadores destacados" al pie del banner (roster).
|--------------------------------------------------------------------------
*/

export default function HeroBanner() {
  const [dbSlides, setDbSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSlides = async () => {
      const response = await obtenerHeroSlidesAction();
      if (response.success) {
        const mapped = response.data.map(mapHeroSlide);
        setDbSlides(mapped);
      }
      setLoading(false);
    };

    fetchSlides();
  }, []);

  const slides = dbSlides.length > 0 ? dbSlides : FALLBACK_HERO_SLIDES;

  const {
    current,
    progress,
    slide,
    nextSlide,
    previousSlide,
  } = useHeroSlider(slides);

  const {
    imageX,
    imageY,
    handleMouseMove,
  } = useHeroEffects();

  return (
    <section
      id="inicio"
      className="relative h-[80vh] min-h-[600px] overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Fondo del banner */}
      <HeroBackground
        slide={slide}
        imageX={imageX}
        imageY={imageY}
      />

      {/* Oscurecer + gradientes */}
      <HeroOverlay />

      {/* Texto y botones */}
      <HeroContent
        slide={slide}
      />

      <HeroBottomControls
        slides={slides}
        current={current}
        progress={progress}
        previousSlide={previousSlide}
        nextSlide={nextSlide}
      />

      {/* Franja "Creadores destacados" al pie del banner */}
      {!loading && <HeroCreatorsRoster />}
    </section>
  );
}
