import type { Metadata } from "next";
import { Bebas_Neue, Oswald } from "next/font/google";
import NextAuthProvider from "../components/SessionProvider/SessionProvider";
import MotionProvider from "../components/providers/MotionProvider";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/home/Footer/Footer";
import "./globals.css";

/*
|--------------------------------------------------------------------------
| Fuentes (next/font/google)
|--------------------------------------------------------------------------
| Cargamos Bebas Neue y Oswald con `next/font` en lugar de `@import url()`.
| Esto evita el import remoto en CSS (que en dev/Turbopack rompía la
| generación de los tokens de color de Tailwind v4) y expone las fuentes
| como variables CSS (--font-bebas, --font-oswald) usadas en globals.css.
|--------------------------------------------------------------------------
*/
const bebasNeue = Bebas_Neue({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-bebas",
    display: "swap",
});

const oswald = Oswald({
    weight: ["400", "700"],
    subsets: ["latin"],
    variable: "--font-oswald",
    display: "swap",
});

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
            className={`${bebasNeue.variable} ${oswald.variable}`}
        >
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
