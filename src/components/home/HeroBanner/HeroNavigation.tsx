interface Props {
  previousSlide: () => void;
  nextSlide: () => void;
}

/*
|--------------------------------------------------------------------------
| Navegación inferior
|--------------------------------------------------------------------------
| Flechas compactas junto a los indicadores.
|--------------------------------------------------------------------------
*/

export default function HeroNavigation({
  previousSlide,
  nextSlide,
}: Props) {

  return (

    <div
      className="
        flex
        items-center
        justify-center
        gap-4
      "
    >

      <button
        onClick={previousSlide}
        type="button"
        aria-label="Slide anterior"
        className="
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-full
          border
          border-white/20
          bg-black/40
          text-xl
          transition-all
          duration-300

          hover:border-neon
          hover:bg-neon/20
          hover:scale-110
        "
      >
        <span className="text-2xl font-bold" aria-hidden="true">‹</span>
      </button>

      <button
        onClick={nextSlide}
        type="button"
        aria-label="Slide siguiente"
        className="
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-full
          border
          border-white/20
          bg-black/40
          text-xl
          transition-all
          duration-300

          hover:border-neon
          hover:bg-neon/20
          hover:scale-110
        "
      >
        <span className="text-2xl font-bold" aria-hidden="true">›</span>
      </button>

    </div>

  );

}