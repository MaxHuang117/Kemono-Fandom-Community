"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#1a1a1a] p-8 rounded-lg border-2 border-green-500 shadow-[0_0_15px_rgba(0,255,0,0.3)]">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Acceso KFC</h1>
        
        <div className="flex flex-col gap-4">
          <p className="text-gray-400 text-center mb-4">
            Inicia sesión con tu cuenta para continuar.
          </p>
          
          <button 
            onClick={() => signIn("discord", { callbackUrl: "/perfil" })} 
            className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold py-3 px-6 rounded-lg transition-all"
          >
            Iniciar sesión con Discord
          </button>
        </div>
      </div>
    </main>
  );
}