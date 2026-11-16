import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getProfileByDiscordId } from "@/lib/services/profiles.service";
import Link from "next/link";
import HeroAdminClient from "./HeroAdminClient";

export default async function AdminHeroPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.discordId) {
        redirect("/login");
    }

    const { data: perfil, error } = await getProfileByDiscordId(session.user.discordId);

    if (error || !perfil || !perfil.is_admin) {
        redirect("/inicio");
    }

    return (
        <main className="min-h-screen bg-black text-white px-6 py-10 font-sans">
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-neon/10 blur-[140px] pointer-events-none rounded-full" />
            <div className="mx-auto max-w-6xl relative z-10 space-y-6">
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                    <Link href="/admin" className="hover:text-neon-bright transition">ADMIN</Link>
                    <span>/</span>
                    <span className="text-neon-bright font-bold">HERO</span>
                </div>
                <HeroAdminClient />
            </div>
        </main>
    );
}
