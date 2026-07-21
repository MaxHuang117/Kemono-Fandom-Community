"use client";

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);

    if (!section) return;

    section.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
  <header
    className="
      fixed
      top-0
      left-0
      right-0
      z-50
      flex
      flex-wrap
      items-center
      justify-between
      px-6
      md:px-10
      py-6
      bg-black/90
      backdrop-blur-md
      border-b
      border-green-500
    "
  >
      <div className="flex items-center gap-4">
        {/* En lugar de usar el img, mejor usamos next/image para optimizar el rendimiento */}
        <Image 
          src="/Logo.png" 
          alt="Logo de Kemono Fandom Community" 
          width={50} 
          height={50} 
          className="h-13 w-13" 
        />
        <span className="text-xl font-bold text-[#61ff61]">Kemono Fandom Community</span>
      </div>
      
      {/* Navegación principal: Inicio, Colaboradores y Novedades */}
      <nav className="flex flex-wrap items-center gap-4 text-sm" aria-label="Navegación principal">
        {pathname === "/" ? (
          <>
            <button 
              onClick={() => scrollToSection('inicio')} 
              className="hover:text-green-500 transition-colors font-bold"
              aria-label="Ir a la sección de inicio"
            >
              Inicio
            </button>
            <span className="text-gray-600 hidden sm:block">|</span>
            
            <button 
              onClick={() => scrollToSection('colaboradores')} 
              className="hover:text-green-500 transition-colors"
              aria-label="Ir a la sección de colaboradores"
            >
              Colaboradores
            </button>
            <span className="text-gray-600 hidden sm:block">|</span>
            
            <button 
              onClick={() => scrollToSection('novedades')} 
              className="hover:text-green-500 transition-colors"
              aria-label="Ir a la sección de novedades"
            >
              Novedades
            </button>
          </>
        ) : (
          <Link 
            href="/" 
            className="hover:text-green-500 transition-colors font-bold flex items-center gap-2"
            aria-label="Volver al inicio"
          >
            ← Volver al Inicio
          </Link>
        )}

        {session ? (
          <div className="relative">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              aria-expanded={isOpen}
              aria-label="Abrir menú de usuario"
              className="text-green-500 font-bold border border-green-500 px-4 py-2 rounded hover:bg-green-500 hover:text-black transition-all"
            >
              {session.user?.email} ▾
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] border border-gray-600 rounded-lg shadow-xl p-2 z-50">
                <Link 
                  href="/perfil" 
                  className="block p-2 text-white hover:bg-green-500 hover:text-black rounded transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Configuración
                </Link>
                <button 
                  onClick={() => { signOut(); setIsOpen(false); }} 
                  className="block w-full text-left p-2 text-red-400 hover:bg-red-500 hover:text-white rounded transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link 
            href="/login" 
            className="bg-green-500 text-black px-4 py-2 rounded font-bold hover:bg-green-400 transition-all"
            aria-label="Iniciar sesión"
          >
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}