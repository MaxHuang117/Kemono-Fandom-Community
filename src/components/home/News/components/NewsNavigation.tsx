interface Props {
    direction: "previous" | "next";
    onClick: () => void;
}

/*
|--------------------------------------------------------------------------
| Navegación móvil
|--------------------------------------------------------------------------
*/

export default function NewsNavigation({
    direction,
    onClick,
}: Props) {

    return (
        <button
            onClick={onClick}
            aria-label={
                direction === "previous"
                    ? "Noticia anterior"
                    : "Siguiente noticia"
            }
            className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-full
                border
                border-white/10
                bg-[#181818]
                text-sm
                text-white
                transition
                hover:border-green-500
                active:scale-95
            "
        >
            {direction === "previous" ? "◀" : "▶"}
        </button>
    );
}