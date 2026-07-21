'use server'

import { createClient } from '@supabase/supabase-js';

// Esto usa tu clave secreta de administración, solo funciona en el servidor
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Asegúrate de tener esto en tu .env.local
);

export async function guardarBiografiaAction(email: string, biografia: string) {
  const { error } = await supabaseAdmin
    .from('profiles')
    .upsert({ email, biografia }, { onConflict: 'email' });

  return { error };
}