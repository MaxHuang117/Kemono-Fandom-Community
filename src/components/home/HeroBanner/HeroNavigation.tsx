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
        className="
          flex
          h-10
          w-10
          items-relative    
          justify-center
          rounded-full
          border
          border-white/20
          bg-black/40
          text-xl
          transition-all
          duration-300

          hover:border-green-500
          hover:bg-green-500/20
          hover:scale-110
        "
      >
        <span className="text-2xl font-bold">‹</span>
      </button>

      <button
        onClick={nextSlide}
        className="
          flex
          h-10
          w-10
          items-relative
          justify-center
          rounded-full
          border
          border-white/20
          bg-black/40
          text-xl
          transition-all
          duration-300

          hover:border-green-500
          hover:bg-green-500/20
          hover:scale-110
        "
      >
        <span className="text-2xl font-bold">›</span>
      </button>

    </div>

  );

}