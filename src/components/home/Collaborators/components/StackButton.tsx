interface Props {

  expanded: boolean;

  toggleCards: () => void;

}

/*
|--------------------------------------------------------------------------
| Botón de expandir cartas
|--------------------------------------------------------------------------
*/

export default function StackButton({

  expanded,

  toggleCards,

}: Props) {

  return (

    <button

      onClick={toggleCards}

      className="
        mt-5
        rounded-xl
        border
        border-neon/30
        bg-neon/10
        px-8
        py-3
        text-neon-bright
        transition-all
        duration-300
        hover:bg-neon/20
      "

    >

      {

        expanded

          ? "< Colapsar >"

          : "< Descolapsar >"

      }

    </button>

  );

}