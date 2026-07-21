interface Props {

    previous: () => void;

    next: () => void;

}

/*
|--------------------------------------------------------------------------
| Navegación móvil
|--------------------------------------------------------------------------
*/

export default function NewsNavigation({

    previous,

    next,

}: Props) {

    return (

        <div
            className="
                mt-8
                flex
                justify-center
                gap-6
            "
        >

            <button

                onClick={previous}

                className="
                    rounded-full
                    border
                    border-white/10
                    bg-[#181818]
                    px-5
                    py-3
                    transition
                    hover:border-green-500
                "

            >

                ◀

            </button>

            <button

                onClick={next}

                className="
                    rounded-full
                    border
                    border-white/10
                    bg-[#181818]
                    px-5
                    py-3
                    transition
                    hover:border-green-500
                "

            >

                ▶

            </button>

        </div>

    );

}