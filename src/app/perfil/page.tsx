"use client";

import { signOut } from "next-auth/react";

import { usePerfil } from "./hooks/usePerfil";

import LoginCard from "./components/LoginCard";
import PerfilCard from "./components/PerfilCard";
import BiografiaEditor from "./components/BiografiaEditor";

export default function PerfilPage() {

    const {

        session,

        user,

        banner,

        biografia,

        guardando,

        guardarBiografia,

        setBiografia,

    } = usePerfil();

    /*
    |--------------------------------------------------------------------------
    | Login
    |--------------------------------------------------------------------------
    */

    if (!session) {

        return (
          <LoginCard />
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Datos
    |--------------------------------------------------------------------------
    */

    const nombreFinal =
        user?.name ||
        "Usuario";

    const imagenFinal =
        user?.image ||
        "https://cdn.discordapp.com/embed/avatars/0.png";

    const discordIdFinal =
        user?.discordId ||
        "";

    /*
    |--------------------------------------------------------------------------
    | Vista
    |--------------------------------------------------------------------------
    */

    return (

        <div
            className="
                max-w-4xl
                mx-auto
                px-6
                py-12
                space-y-8
                text-white
            "
        >

            <PerfilCard

                banner={banner}

                imagen={imagenFinal}

                nombre={nombreFinal}

                discordId={discordIdFinal}

                onSignOut={() => signOut()}

            />

            <BiografiaEditor

                biografia={biografia}

                guardando={guardando}

                onChange={setBiografia}

                onGuardar={guardarBiografia}

            />

        </div>

    );

}