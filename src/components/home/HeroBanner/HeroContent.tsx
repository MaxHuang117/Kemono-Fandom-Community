import { HeroSlide } from "./HeroSlides";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  slide: HeroSlide;
}

/*
|--------------------------------------------------------------------------
| Información del banner
|--------------------------------------------------------------------------
| Cambia automáticamente según el slide activo.
|--------------------------------------------------------------------------
*/

export default function HeroContent({
  slide,
}: Props) {

  return (

    <AnimatePresence mode="wait">

<motion.div

key={slide.title}

initial={{
    opacity:0,
    y:40
}}

animate={{
    opacity:1,
    y:0
}}

exit={{
    opacity:0,
    y:-30
}}

transition={{
    duration:.45
}}

className="relative z-20 flex h-full items-center"

>

    <div className="max-w-3xl px-16">

        <span
        className="
        mb-4
        inline-block
        rounded-full
        border
        border-green-500/40
        bg-green-500/10
        px-4
        py-1
        text-sm
        text-green-400
        "
        >
        Web Oficial
        </span>

        <h1 className="mb-6 text-6xl font-black">

            {slide.title}

        </h1>

        <p
        className="
        mb-10
        max-w-xl
        text-lg
        leading-8
        text-gray-300
        "
        >

            {slide.subtitle}

        </p>

        <a
        href={slide.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`
        inline-flex
        rounded-xl
        px-8
        py-3
        font-bold
        text-white
        transition-all
        duration-300
        hover:scale-105

        ${slide.buttonColor}
        ${slide.buttonHover}
        `}
        >

            {slide.buttonText}

        </a>

    </div>

</motion.div>

</AnimatePresence>

  );

}