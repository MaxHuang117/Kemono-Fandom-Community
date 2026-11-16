"use server";

import { createAdminClient } from "@/lib/supabase/admin";

const supabaseAdmin = createAdminClient();

export interface HeroSlideData {
    id: string;
    title: string;
    subtitle: string;
    image_url: string;
    cta_label: string;
    cta_url: string;
    position: number;
    active: boolean;
}

export async function obtenerHeroSlidesAction(): Promise<{ success: true; data: HeroSlideData[] } | { success: false; error: string }> {
    try {
        const { data, error } = await supabaseAdmin
            .from("hero_slides")
            .select("id, title, subtitle, image_url, cta_label, cta_url, position, active")
            .eq("active", true)
            .order("position", { ascending: true });

        if (error) throw error;

        return { success: true, data: (data || []) as HeroSlideData[] };
    } catch (error: any) {
        console.error("SYS_ERR [HeroSlides]:", error.message || error);
        return { success: false, error: "Error al cargar el hero." };
    }
}
