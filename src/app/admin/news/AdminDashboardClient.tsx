// max-hub/src/app/admin/news/AdminDashboardClient.tsx
"use client";

import { useState } from "react";
import NewsManager from "./components/NewsManager";
import CommentsAdminClient from "@/app/admin/comments/CommentsAdminClient";

interface Props {
  userEmail: string;
}

export default function AdminDashboardClient({ userEmail }: Props) {
  const [activeTab, setActiveTab] = useState<"news" | "comments">("news");

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10 selection:bg-emerald-500 selection:text-black">
      {/* Background Glow Overlay */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-emerald-500/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="mx-auto max-w-6xl relative z-10 space-y-8">
        {/* Header Panel */}
        <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-800/80 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">GeForce Control Center</span>
            </div>
            <h1 className="text-3xl font-black tracking-wider uppercase bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent mt-1">
              Panel de Administración
            </h1>
          </div>

          <div className="flex items-center gap-3 bg-zinc-900/80 px-4 py-2 rounded-xl border border-zinc-800 text-xs font-mono">
            <span className="text-zinc-500">ADMIN:</span>
            <span className="text-emerald-400 font-bold">{userEmail}</span>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-800 gap-2">
          <button
            onClick={() => setActiveTab("news")}
            className={`px-6 py-3 font-bold text-sm uppercase tracking-wider transition border-b-2 ${
              activeTab === "news"
                ? "border-emerald-500 text-emerald-400 bg-emerald-950/20"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            Gestión Noticias
          </button>
          <button
            onClick={() => setActiveTab("comments")}
            className={`px-6 py-3 font-bold text-sm uppercase tracking-wider transition border-b-2 ${
              activeTab === "comments"
                ? "border-emerald-500 text-emerald-400 bg-emerald-950/20"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            Moderación Comentarios
          </button>
        </div>

        {/* Tab Content */}
        <section className="bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800/60 backdrop-blur-xl">
          {activeTab === "news" && <NewsManager />}
          {activeTab === "comments" && <CommentsAdminClient />}
        </section>
      </div>
    </main>
  );
}