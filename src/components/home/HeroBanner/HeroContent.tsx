import { HeroSlide } from "./HeroSlides";
import { motion, AnimatePresence } from "framer-motion";
import { SITE_CONFIG } from "@/config/site.config";
import Link from "next/link";

interface Props {
  slide: HeroSlide;
}

/*
|--------------------------------------------------------------------------
| Información del banner
|--------------------------------------------------------------------------
| Cambia automáticamente según el slide activo.
| Fase 2: CTA principal unificado a neón + CTAs secundarios fijos
| (Donar · Postúlate · Explorar creadores).
|--------------------------------------------------------------------------
*/

export default function HeroContent({ slide }: Props) {
  const scrollToCreators = () => {
    if (typeof window === "undefined") return;
    const section = document.getElementById("creadores");
    if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={slide.title}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.45 }}
        className="relative z-20 flex h-full items-center"
      >
        <div className="max-w-3xl px-6 sm:px-10 lg:px-16">
          <span className="mb-4 inline-block rounded-full border border-neon/40 bg-neon/10 px-4 py-1 text-sm text-neon-bright">
            Web Oficial
          </span>

          <h1 className="mb-6 text-4xl sm:text-5xl md:text-6xl font-black">
            {slide.title}
          </h1>

          <p className="mb-10 max-w-xl text-base sm:text-lg leading-8 text-gray-300">
            {slide.subtitle}
          </p>

          {/* CTAs: acción principal del slide + CTAs fijos del hub */}
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={slide.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex rounded-xl px-8 py-3 font-bold text-black bg-neon hover:bg-neon-bright transition-all duration-300 hover:scale-105 shadow-[0_0_20px_rgba(97,255,97,0.3)]"
            >
              {slide.buttonText}
            </a>

            <a
              href={SITE_CONFIG.donationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-neon/60 bg-black/30 px-6 py-3 font-bold text-neon-bright backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-neon hover:text-black"
            >
              <svg className="w-5 h-5 motion-safe:animate-pulse" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              Donar
            </a>

            <Link
              href="/postulate"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-black/30 px-6 py-3 font-bold text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-neon/60 hover:text-neon-bright"
            >
              Postúlate
            </Link>

            <button
              type="button"
              onClick={scrollToCreators}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-black/30 px-6 py-3 font-bold text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-neon/60 hover:text-neon-bright"
            >
              Explorar creadores
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
