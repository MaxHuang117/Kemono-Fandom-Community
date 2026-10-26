import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { getProfileByEmail } from "@/lib/services/profiles.service";
import SubsAdminClient from "./SubsAdminClient";

export default async function SubsAdminPage() {
    const session = await getServerSession();

    // 1. Validar que el usuario tenga sesión activa
    if (!session?.user?.email) {
        redirect("/login");
    }

    // 2. Obtener su perfil desde Supabase
    const { data: perfil, error } = await getProfileByEmail(session.user.email);

    // 3. Validar que exista y que sea Administrador
    if (error || !perfil || !perfil.is_admin) {
        redirect("/inicio"); // Lo pateamos al inicio si intenta entrar sin permisos
    }

    // 4. Si pasó los controles de seguridad, renderizamos el panel
    return (
        <main className="min-h-screen bg-[#050505] text-white p-6 selection:bg-emerald-500 selection:text-black">
            {/* Contenedor principal con límite de ancho para mantener el diseño pulcro */}
            <div className="mx-auto max-w-7xl relative z-10">
                <SubsAdminClient />
            </div>
        </main>
    );
}