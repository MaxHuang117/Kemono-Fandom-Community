"use client";

import { useHeroEffects } from "./HeroEffects";
import { useHeroSlider } from "./useHeroSlider";

import HeroBackground from "./HeroBackground";
import HeroOverlay from "./HeroOverlay";
import HeroContent from "./HeroContent";
import HeroBottomControls from "./HeroBottomControls";
import { heroSlides } from "./HeroSlides";

/*
|--------------------------------------------------------------------------
| Hero Banner
|--------------------------------------------------------------------------
| Componente principal del Hero.
|
| Aquí únicamente unimos todas las piezas:
|
| • Slider automático
| • Parallax
| • Contenido
| • Flechas
| • Indicadores
|--------------------------------------------------------------------------
*/

export default function HeroBanner() {

  /* ===========================
     Hook del Slider
  =========================== */

const {

current,

progress,

slide,

nextSlide,

previousSlide,

} = useHeroSlider();


  /* ===========================
     Hook del Parallax
  =========================== */

  const {
    imageX,
    imageY,
    handleMouseMove,
  } = useHeroEffects();


  return (

    <section
      id="inicio"
      className="relative h-[75vh] overflow-hidden"
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

      {/* Texto y botón */}
      <HeroContent
        slide={slide}
      />

      <HeroBottomControls

      current={current}

      progress={progress}

      total={heroSlides.length}

      previousSlide={previousSlide}

      nextSlide={nextSlide}

      />

    </section>

  );

}