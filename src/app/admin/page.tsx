import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { getProfileByEmail } from "@/lib/services/profiles.service";
import AdminModuleCard from "./components/AdminModuleCard"; // Importamos la tarjeta

export default async function AdminPage() {
    const session = await getServerSession();

    // 1. Validar sesión
    if (!session?.user?.email) {
        redirect("/login");
    }

    // 2. Obtener perfil
    const { data: perfil, error } = await getProfileByEmail(session.user.email);

    // 3. Validar perfil y permisos
    if (error || !perfil || !perfil.is_admin) {
        redirect("/inicio");
    }

    return (
        <main className="min-h-screen bg-[#050505] text-white px-6 py-10 selection:bg-emerald-500 selection:text-black font-sans">
            {/* Resplandor de fondo Cyberpunk */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-emerald-500/10 blur-[140px] pointer-events-none rounded-full" />

            <div className="mx-auto max-w-7xl relative z-10 space-y-10">
                <header className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-emerald-500/20 pb-6 gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="h-2 w-2 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)] animate-pulse" />
                            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-400 font-bold">
                                Web Control Center
                            </span>
                        </div>
                        <h1 className="text-4xl font-black tracking-widest uppercase text-white">
                            KFC<span className="text-emerald-500">Admin</span>
                        </h1>
                        <p className="mt-1 text-xs font-mono text-zinc-500 tracking-widest">
                            &gt; SYSTEM CORE MANAGEMENT PROTOCOL
                        </p>
                    </div>

                    <div className="flex items-center gap-3 bg-black/50 px-4 py-2 border border-white/10 text-[10px] font-mono uppercase tracking-widest shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                        <span className="text-zinc-500">AUTH_USER:</span>
                        <span className="text-emerald-400 font-bold">{session.user.email}</span>
                    </div>
                </header>

                <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Renderizamos las tarjetas limpiamente mediante el componente */}
                    <AdminModuleCard 
                        moduleNumber="MOD_01"
                        title="Noticias"
                        description="Deploy_News: Crear, editar, publicar y eliminar contenido del feed global."
                        href="/admin/news"
                        buttonText="[ Init_News ]"
                    />

                    <AdminModuleCard 
                        moduleNumber="MOD_02"
                        title="Comentarios"
                        description="Mod_Protocol: Moderar, purgar y auditar la caja de comentarios de la comunidad."
                        href="/admin/comments"
                        buttonText="[ Init_Comms ]"
                    />

                    {/* ¡El nuevo módulo de Tiers! */}
                    <AdminModuleCard 
                        moduleNumber="MOD_03"
                        title="Tiers & Subs"
                        description="User_Access: Asignación de niveles VIP, patrocinadores y control de expiraciones."
                        href="/admin/subs"
                        buttonText="[ Init_Tiers ]"
                    />
                </section>
            </div>
        </main>
    );
}