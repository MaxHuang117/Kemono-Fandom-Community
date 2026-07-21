"use client";

import { useSession, signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
// Importamos la acción que debemos crear (ver paso abajo)
import { guardarBiografiaAction } from './actions'; 

export default function PerfilPage() {
  const { data: session } = useSession();
  const [biografia, setBiografia] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (session?.user?.email) {
      const cargarBiografia = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('biografia')
          .eq('email', session.user!.email)
          .maybeSingle();
        
        if (data?.biografia) setBiografia(data.biografia);
      };
      cargarBiografia();
    }
  }, [session]);

  const guardarBiografia = async () => {
    if (!session?.user?.email) return;
    
    setGuardando(true);

    // Llamamos a la acción del servidor
    const result = await guardarBiografiaAction(session.user.email, biografia);

    setGuardando(false);

    if (result.error) {
      alert("Error al guardar: " + result.error.message);
    } else {
      alert("¡Te ves bien!");
    }
  };

  if (!session) {
    return (
      <div className="p-10 text-white text-center mt-20">
        <h1 className="text-3xl font-bold">Bienvenido a KFC</h1>
        <button 
          onClick={() => signIn('discord')} 
          className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold py-3 px-6 rounded-lg mt-6"
        >
          Vincular con Discord
        </button>
      </div>
    );
  }

  const user = session.user as any;
  const nombreFinal = user?.name || user?.username || "Usuario";
  const imagenFinal = user?.image || "https://cdn.discordapp.com/embed/avatars/0.png";

  return (
    <div className="p-10 text-white">
      <h1 className="text-2xl font-bold mb-5">Perfil Vinculado</h1>
      
      <div className="bg-gray-900 p-6 rounded-lg flex items-center gap-4 w-fit border border-gray-700 mb-6">
        <img src={imagenFinal} className="w-16 h-16 rounded-full" alt="Perfil" />
        <div>
          <h3 className="font-bold text-lg">{nombreFinal}</h3>
          <p className="text-sm text-gray-400">Vinculado con Discord</p>
        </div>
      </div>

      <div className="w-full max-w-md">
        <label className="block text-sm text-gray-400 mb-2">Biografía</label>
        <textarea 
          value={biografia}
          onChange={(e) => setBiografia(e.target.value)}
          // puedes aumentar el tamaño del textarea según tus necesidades, pero hay un límite de 250
          // Para que el limite de redimensionar el textarea hasta un cierto punto, usamos la propiedad style
          className="w-full min-h-[100px] max-h-[200px] bg-gray-900 border border-gray-700 p-3 rounded-lg text-white h-24 mb-3 focus:outline-none focus:border-green-500 style-resize"
          placeholder="Cuéntanos sobre ti..."
          maxLength={200}
        />
        <button 
          onClick={guardarBiografia}
          disabled={guardando}
          className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg"
        >
          {guardando ? "Guardando..." : "Guardar Biografía"}
        </button>
      </div>
    </div>
  );
}