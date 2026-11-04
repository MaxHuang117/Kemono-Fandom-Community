import type { Metadata } from "next";
import NextAuthProvider from "../components/SessionProvider/SessionProvider";
import MotionProvider from "../components/providers/MotionProvider";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/home/Footer/Footer";
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
    <html lang="es" data-scroll-behavior="smooth">
      <body className="bg-black text-white antialiased min-h-screen flex flex-col">
        {/* 2. Provider Wrapper centralizado */}
        <NextAuthProvider>
          <MotionProvider>
            <Navbar />

            {/* 3. Main wrapper semántico */}
            <main className="flex-grow w-full pt-24">{children}</main>

            {/* 4. Footer global */}
            <Footer />
          </MotionProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}