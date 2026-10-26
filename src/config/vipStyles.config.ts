// src/config/vipStyles.config.ts

export interface VipStyle {
    id: string;
    label: string;
    description: string;
    textClass: string;
    ringClass: string;
}

export const VIP_STYLES: Record<string, VipStyle> = {
    // 👇 ESTILO BASE EN BLANCO (predefinido) 👇
    pure: {
        id: "pure",
        label: "PURE LIGHT", // o "SIN ESTILO" si prefieres
        description: "Estilo base del sistema. Blanco puro y limpio.",
        // Usamos un gradiente sutil de blanco a gris muy claro para que el bg-clip-text de Tailwind funcione perfecto
        textClass: "from-white to-zinc-200", 
        ringClass: "from-zinc-300 via-white to-zinc-400"
    },
    // ------------------------------------
    matrix: {
        id: "matrix",
        label: "MATRIX KERNEL",
        description: "Esmeralda puro del sistema central.",
        textClass: "from-emerald-300 to-emerald-700",
        ringClass: "from-emerald-400 via-green-500 to-emerald-800"
    },
    cyber: {
        id: "cyber",
        label: "NEON TOKYO",
        description: "Vibras cyberpunk en fucsia y cian.",
        textClass: "from-fuchsia-400 to-cyan-400",
        ringClass: "from-fuchsia-500 via-purple-500 to-cyan-500"
    },
    gold: {
        id: "gold",
        label: "ROYAL GOLD",
        description: "Exclusividad en oro y ámbar.",
        textClass: "from-amber-200 to-yellow-600",
        ringClass: "from-amber-300 via-yellow-500 to-yellow-700"
    },
    blood: {
        id: "blood",
        label: "BLOOD MOON",
        description: "Carmesí oscuro y agresivo.",
        textClass: "from-red-400 to-red-800",
        ringClass: "from-red-500 via-rose-600 to-red-900"
    },
    void: {
        id: "void",
        label: "VOID MATTER",
        description: "Energía oscura y antimateria.",
        textClass: "from-zinc-100 to-zinc-500",
        ringClass: "from-indigo-900 via-purple-900 to-black"
    },
    abyss: {
        id: "abyss",
        label: "DEEP ABYSS",
        description: "Profundidades en cobalto y cian.",
        textClass: "from-cyan-300 to-blue-700",
        ringClass: "from-cyan-400 via-blue-600 to-indigo-900"
    },
    supernova: {
        id: "supernova",
        label: "SUPERNOVA",
        description: "Estallido estelar en naranja y magenta.",
        textClass: "from-orange-300 to-rose-600",
        ringClass: "from-yellow-400 via-orange-500 to-rose-700"
    },
    toxic: {
        id: "toxic",
        label: "BIOHAZARD",
        description: "Radiación en lima y amarillo ácido.",
        textClass: "from-lime-300 to-green-600",
        ringClass: "from-yellow-300 via-lime-500 to-green-800"
    }
};

// 👇 CAMBIAMOS EL DEFAULT AL ESTILO PURO/BLANCO 👇
export const DEFAULT_STYLE = VIP_STYLES.pure;