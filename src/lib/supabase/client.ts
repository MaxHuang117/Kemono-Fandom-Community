"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

type SupabaseBrowserClient = ReturnType<typeof createBrowserClient<Database>>;

let singleton: SupabaseBrowserClient | undefined;

/**
 * Única instancia del cliente Supabase en el navegador.
 * Memoriza `createBrowserClient` para evitar crear múltiples instancias
 * de `GoTrueClient` (advertencia del navegador y overhead innecesario)
 * cuando varios componentes piden cliente a la vez.
 */
export function createClient(): SupabaseBrowserClient {
    singleton ??= createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    return singleton;
}
