import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getProfileByEmail } from "@/lib/services/profiles.service";
import CommentsAdminClient from "./CommentsAdminClient";

export default async function AdminCommentsPage() {
    const session = await getServerSession();

    if (!session?.user?.email) {
        redirect("/login");
    }

    const { data: perfil, error } = await getProfileByEmail(session.user.email);

    if (error || !perfil || !perfil.is_admin) {
        redirect("/inicio");
    }

    return (
        <main className="min-h-screen bg-[#050505] text-white px-6 py-10 selection:bg-emerald-500 selection:text-black font-sans">
            {/* Resplandor Cyberpunk */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-emerald-500/10 blur-[140px] pointer-events-none rounded-full" />
            
            <div className="mx-auto max-w-7xl relative z-10 space-y-6">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-mono text-zinc-500 mb-8 border-b border-white/5 pb-4">
                    <Link href="/admin" className="hover:text-emerald-400 transition-colors">ROOT</Link>
                    <span>/</span>
                    <span className="text-emerald-400 font-bold">MOD_PROTOCOL</span>
                </div>

                <CommentsAdminClient />
            </div>
        </main>
    );
}