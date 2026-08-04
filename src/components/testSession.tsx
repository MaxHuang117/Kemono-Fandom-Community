"use client";

import { useSession } from "next-auth/react";

/*
|--------------------------------------------------------------------------
| TestSession
|--------------------------------------------------------------------------
| Componente temporal para comprobar que NextAuth está entregando
| correctamente el ID de Discord a la sesión.
|--------------------------------------------------------------------------
*/

export default function TestSession() {

    const { data: session, status } = useSession();

    if (status === "loading") {

        return <p>Cargando sesión...</p>;

    }

    if (!session) {

        return <p>No hay una sesión activa.</p>;

    }

    return (

        <div className="space-y-2">

            <p>
                Usuario: {session.user.name}
            </p>

            <p>
                Discord ID: {session.user.discordId}
            </p>

            <p>
                Email: {session.user.email}
            </p>

        </div>

    );

}