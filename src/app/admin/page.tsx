import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getProfileByDiscordId } from "@/lib/services/profiles.service";
import AdminModuleCard from "./components/AdminModuleCard"; // Importamos la tarjeta

export default async function AdminPage() {
    const session = await getServerSession(authOptions);

    // 1. Validar sesión
    if (!session?.user?.discordId) {
        redirect("/login");
    }

    // 2. Obtener perfil
    const { data: perfil, error } = await getProfileByDiscordId(session.user.discordId);

    // 3. Validar perfil y permisos
    if (error || !perfil || !perfil.is_admin) {
        redirect("/inicio");
    }

    return (
        <main className="min-h-screen bg-[#050505] text-white px-6 py-10 selection:bg-neon selection:text-black font-sans">
            {/* Resplandor de fondo Cyberpunk */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-neon/10 blur-[140px] pointer-events-none rounded-full" />

            <div className="mx-auto max-w-7xl relative z-10 space-y-10">
                <header className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-neon/20 pb-6 gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="h-2 w-2 bg-neon shadow-[0_0_10px_rgba(97,255,97,1)] motion-safe:animate-pulse" />
                            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neon-bright font-bold">
                                Web Control Center
                            </span>
                        </div>
                        <h1 className="text-4xl font-black tracking-widest uppercase text-white">
                            KFC<span className="text-neon">Admin</span>
                        </h1>
                        <p className="mt-1 text-xs font-mono text-zinc-500 tracking-widest">
                            &gt; SYSTEM CORE MANAGEMENT PROTOCOL
                        </p>
                    </div>

                    <div className="flex items-center gap-3 bg-black/50 px-4 py-2 border border-white/10 text-[10px] font-mono uppercase tracking-widest shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                        <span className="text-zinc-500">Usuario:</span>
                        <span className="text-neon-bright font-bold">{session.user.email}</span>
                    </div>
                </header>

                <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Renderizamos las tarjetas limpiamente mediante el componente */}
                    <AdminModuleCard 
                        moduleNumber="Módulo 01"
                        title="Noticias"
                        description="Crear, editar, publicar y eliminar contenido del feed global."
                        href="/admin/news"
                        buttonText="Noticias"
                    />

                    <AdminModuleCard 
                        moduleNumber="Módulo 02"
                        title="Comentarios"
                        description="Moderar, purgar y auditar la caja de comentarios de la comunidad."
                        href="/admin/comments"
                        buttonText="Comentarios"
                    />

                    {/* ¡El nuevo módulo de Tiers! */}
                    <AdminModuleCard 
                        moduleNumber="Módulo 03"
                        title="Tiers & Subs"
                        description="Asignación de niveles VIP, patrocinadores y control de expiraciones."
                        href="/admin/subs"
                        buttonText="Suscripciones"
                    />
                </section>
            </div>
        </main>
    );
}