import HeroNavigation from "./HeroNavigation";
import HeroIndicators from "./HeroIndicators";

interface Props {

  current: number;

  progress: number;

  total: number;

  previousSlide: () => void;

  nextSlide: () => void;

}

/*
|--------------------------------------------------------------------------
| Controles inferiores
|--------------------------------------------------------------------------
| Flechas + barras del slider.
|--------------------------------------------------------------------------
*/

export default function HeroBottomControls({

  current,

  progress,

  previousSlide,

  nextSlide,

}: Props) {

  return (

    <div
      className="
        absolute
        bottom-10
        left-1/2
        z-40

        flex
        -translate-x-1/2
        items-center
        gap-8
      "
    >

      <HeroNavigation
        previousSlide={previousSlide}
        nextSlide={nextSlide}
      />
      <HeroIndicators
        current={current}
        progress={progress}
      />
    </div>

  );

}