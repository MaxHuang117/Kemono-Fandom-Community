// max-hub/src/app/admin/news/page.tsx
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getProfileByEmail } from "@/lib/services/profiles.service";
import NewsModalClient from "./NewsModalClient";

export default async function AdminNewsPage() {
    const session = await getServerSession();

    if (!session?.user?.email) {
        redirect("/login");
    }

    const { data: perfil, error } = await getProfileByEmail(session.user.email);

    if (error || !perfil || !perfil.is_admin) {
        redirect("/inicio");
    }

    return (
        <main className="min-h-screen bg-black text-white px-6 py-10">
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-emerald-500/10 blur-[140px] pointer-events-none rounded-full" />
            <div className="mx-auto max-w-6xl relative z-10 space-y-6">
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                    <Link href="/admin" className="hover:text-emerald-400 transition">ADMIN</Link>
                    <span>/</span>
                    <span className="text-emerald-400 font-bold">NOTICIAS</span>
                </div>
                
                <NewsModalClient />
            </div>
        </main>
    );
}