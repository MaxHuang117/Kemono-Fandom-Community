"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      // error puede ser null; usamos optional chaining para seguridad
      const mensaje = error?.message || "Ocurrió un error inesperado al registrarse.";
      alert(mensaje); // Notificación de error[cite: 1]
      return;
    }

    // Confirmación de éxito[cite: 1]
    alert("¡Cuenta creada! Ya puedes iniciar sesión.");
    router.push("/login"); // Redirección al login[cite: 1]
  };

  return (
    // Contenedor principal que centra el formulario[cite: 1]
    <main className="min-h-screen bg-black flex items-center justify-center p-6">
      {/* Contenedor del formulario con el mismo estilo brillante (glow) que el Login */}
      <div className="w-full max-w-md bg-[#1a1a1a] p-8 rounded-lg border-2 border-green-500 shadow-[0_0_15px_rgba(0,255,0,0.3)]">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Crear Cuenta</h1>
        
        {/* Formulario de Registro */}
        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <input 
            type="email" 
            placeholder="Correo electrónico" 
            onChange={(e) => setEmail(e.target.value)} // Captura el email[cite: 1]
            className="bg-black border border-gray-600 p-3 rounded text-white focus:border-green-500 outline-none w-full"
            required
          />
          <input 
            type="password" 
            placeholder="Contraseña" 
            onChange={(e) => setPassword(e.target.value)} // Captura el password[cite: 1]
            className="bg-black border border-gray-600 p-3 rounded text-white focus:border-green-500 outline-none w-full"
            required
          />
          <button type="submit" className="bg-green-500 text-black font-bold py-3 rounded hover:bg-green-400 w-full">
            Registrarse
          </button>
        </form>

        {/* Enlace de navegación lineal para volver al login[cite: 1] */}
        <div className="mt-4 text-center text-sm text-gray-400">
          ¿Ya tienes cuenta? 
          <Link href="/login" className="text-green-500 hover:underline ml-1">Inicia sesión</Link>
        </div>
      </div>
    </main>
  );
}