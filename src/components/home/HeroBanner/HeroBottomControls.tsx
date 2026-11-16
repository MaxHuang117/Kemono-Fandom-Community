import HeroNavigation from "./HeroNavigation";
import HeroIndicators from "./HeroIndicators";
import { HeroSlide } from "./HeroSlides";

interface Props {
  slides: HeroSlide[];
  current: number;
  progress: number;
  previousSlide: () => void;
  nextSlide: () => void;
}

/*
|--------------------------------------------------------------------------
| Controles inferiores
|--------------------------------------------------------------------------
| Flechas + barras del slider. Recibe slides por prop para Fase 2.
|--------------------------------------------------------------------------
*/

export default function HeroBottomControls({
  slides,
  current,
  progress,
  previousSlide,
  nextSlide,
}: Props) {
  return (
    <div className="absolute bottom-6 sm:bottom-10 left-1/2 z-40 flex -translate-x-1/2 items-center gap-4 sm:gap-8">
      <HeroNavigation
        previousSlide={previousSlide}
        nextSlide={nextSlide}
      />
      <HeroIndicators
        slides={slides}
        current={current}
        progress={progress}
      />
    </div>
  );
}
