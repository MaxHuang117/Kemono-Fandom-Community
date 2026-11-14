"use client";

import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { SITE_CONFIG } from "@/config/site.config";

const navLinks = [
  { id: "inicio", label: "Inicio" },
  { id: "colaboradores", label: "Colaboradores" },
  { id: "novedades", label: "Novedades" },
];

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const pathname = usePathname();
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileBtnRef = useRef<HTMLButtonElement>(null);

  const isHome = pathname === "/";

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (!section) return;
    section.scrollIntoView({ behavior: "smooth", block: "start" });
    setMenuOpen(false);
  };

  // Cerrar menús al hacer clic fuera o presionar Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(target) &&
        mobileBtnRef.current &&
        !mobileBtnRef.current.contains(target)
      ) {
        setMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setUserOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setUserOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // Bloquear scroll cuando el menú móvil está abierto
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-neon/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-20">
            {/* Logo + marca */}
            <Link
              href="/"
              className="flex items-center gap-3 min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-neon rounded"
            >
              <Image
                src="/Logo.png"
                alt=""
                width={44}
                height={44}
                className="h-10 w-10 rounded-md object-contain"
                priority
              />
              <span className="text-lg sm:text-xl font-bold text-neon truncate">
                Kemono Fandom
              </span>
            </Link>

            {/* Navegación desktop */}
            <nav
              className="hidden md:flex items-center gap-6"
              aria-label="Navegación principal"
            >
              {isHome ? (
                <>
                  {navLinks.map((link, idx) => (
                    <span key={link.id} className="flex items-center gap-6">
                      <button
                        onClick={() => scrollToSection(link.id)}
                        className="text-sm font-medium text-zinc-300 hover:text-neon transition-colors focus:outline-none focus-visible:text-neon"
                      >
                        {link.label}
                      </button>
                      {idx < navLinks.length - 1 && (
                        <span className="text-zinc-700" aria-hidden="true">|</span>
                      )}
                    </span>
                  ))}
                </>
              ) : (
                <Link
                  href="/"
                  className="text-sm font-medium text-zinc-300 hover:text-neon transition-colors focus:outline-none focus-visible:text-neon"
                >
                  ← Volver al Inicio
                </Link>
              )}

              {/* CTA de donación — StreamElements. Enlace externo siempre
                  visible; el corazón pulsante y el glow lo destacan para
                  atraer donantes sin competir con el CTA principal. */}
              <a
                href={SITE_CONFIG.donationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded bg-gradient-to-r from-neon to-neon-deep px-4 py-2 text-sm font-bold text-black shadow-[0_0_12px_rgba(97,255,97,0.35)] transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-bright"
              >
                <svg
                  className="w-4 h-4 motion-safe:animate-pulse"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
                Donar
              </a>

              {session ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserOpen(!userOpen)}
                    aria-expanded={userOpen}
                    aria-haspopup="menu"
                    className="flex items-center gap-2 text-sm font-bold text-neon border border-neon/50 px-4 py-2 rounded hover:bg-neon hover:text-black transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-neon"
                  >
                    <span className="max-w-[140px] truncate">
                      {session.user?.name || "Mi cuenta"}
                    </span>
                    <span aria-hidden="true">▾</span>
                  </button>

                  {userOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] border border-zinc-700 rounded-lg shadow-xl p-2 z-50"
                    >
                      <Link
                        href="/perfil"
                        role="menuitem"
                        className="block p-2 text-sm text-white hover:bg-neon hover:text-black rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-neon"
                        onClick={() => setUserOpen(false)}
                      >
                        Mi perfil
                      </Link>
                      <button
                        role="menuitem"
                        onClick={() => {
                          signOut();
                          setUserOpen(false);
                        }}
                        className="block w-full text-left p-2 text-sm text-red-400 hover:bg-red-500 hover:text-white rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="bg-neon text-black text-sm font-bold px-4 py-2 rounded hover:bg-neon-bright transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-bright"
                >
                  Iniciar sesión
                </Link>
              )}
            </nav>

            {/* Botón menú móvil */}
            <button
              ref={mobileBtnRef}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              className="md:hidden p-2 text-neon border border-neon/30 rounded hover:bg-neon/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-neon"
            >
              <span className="sr-only">{menuOpen ? "Cerrar" : "Menú"}</span>
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                {menuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Menú móvil — fuera del <header> para que `position: fixed` se
          posicione respecto al viewport y no al header (backdrop-filter). */}
      {menuOpen && (
        <div
          id="mobile-menu"
          ref={mobileMenuRef}
          className="md:hidden fixed inset-x-0 top-20 bottom-0 bg-black/95 backdrop-blur-lg border-t border-neon/20 overflow-y-auto z-40"
        >
          <nav className="flex flex-col p-6 gap-4" aria-label="Navegación móvil">
            {isHome ? (
              navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="text-left text-lg font-medium text-zinc-300 hover:text-neon transition-colors py-2 border-b border-zinc-800 focus:outline-none focus-visible:text-neon"
                >
                  {link.label}
                </button>
              ))
            ) : (
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="text-lg font-medium text-zinc-300 hover:text-neon transition-colors py-2 border-b border-zinc-800 focus:outline-none focus-visible:text-neon"
              >
                ← Volver al Inicio
              </Link>
            )}

            {/* CTA de donación (móvil): se cierra el menú al navegar. */}
            <a
              href={SITE_CONFIG.donationUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              className="inline-flex w-full items-center justify-center gap-2 rounded bg-gradient-to-r from-neon to-neon-deep py-3 font-bold text-black shadow-[0_0_12px_rgba(97,255,97,0.35)] transition-transform hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-bright"
            >
              <svg
                className="w-5 h-5 motion-safe:animate-pulse"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              Donar
            </a>

            <div className="mt-4">
              {session ? (
                <>
                  <Link
                    href="/perfil"
                    onClick={() => setMenuOpen(false)}
                    className="block w-full text-left text-lg font-medium text-neon py-3 border-b border-zinc-800 focus:outline-none focus-visible:text-neon-bright"
                  >
                    Mi perfil
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setMenuOpen(false);
                    }}
                    className="block w-full text-left text-lg font-medium text-red-400 py-3 focus:outline-none focus-visible:text-red-300"
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full text-center bg-neon text-black font-bold py-3 rounded hover:bg-neon-bright transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-bright"
                >
                  Iniciar sesión
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
