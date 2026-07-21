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
        border-green-500/30
        bg-green-500/10
        px-8
        py-3
        text-green-400
        transition-all
        duration-300
        hover:bg-green-500/20
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