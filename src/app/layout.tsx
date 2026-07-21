import type { Metadata } from "next";
import NextAuthProvider from "../components/SessionProvider/SessionProvider";
import Navbar from "../components/Navbar/Navbar";
import "./globals.css";

// 1. Metadata básica recomendada
export const metadata: Metadata = {
  title: "Kemono Fandom Community",
  description: "Comunidad oficial de Kemono Fandom",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
    lang="es"
    data-scroll-behavior="smooth"
>
      <body className="bg-black text-white antialiased min-h-screen flex flex-col">
        {/* 2. Provider Wrapper centralizado */}
        <NextAuthProvider>
          <Navbar />
          
          {/* 3. Main wrapper semántico */}
          <main className="flex-grow w-full pt-24">
            {children}
          </main>
          
          {/* Aquí irán futuros componentes globales como Toasters o Modales */}
        </NextAuthProvider>
      </body>
    </html>
  );
}