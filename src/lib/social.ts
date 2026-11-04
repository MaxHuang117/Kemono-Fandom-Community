/**
 * Helper robusto para construir URLs de redes sociales.
 * Normaliza entradas del usuario y previene URLs maliciosas.
 */

interface SocialPlatformConfig {
    baseUrl: string;
    validator?: (value: string) => boolean;
}

const SOCIAL_CONFIG: Record<string, SocialPlatformConfig> = {
    twitch: {
        baseUrl: "https://twitch.tv/",
        validator: (value) => /^[a-zA-Z0-9_]{1,25}$/.test(value),
    },
    youtube: {
        baseUrl: "https://youtube.com/@",
        validator: (value) => /^@?[a-zA-Z0-9_-]{1,30}$/.test(value),
    },
    x: {
        baseUrl: "https://x.com/",
        validator: (value) => /^[a-zA-Z0-9_]{1,15}$/.test(value),
    },
    github: {
        baseUrl: "https://github.com/",
        validator: (value) => /^[a-zA-Z0-9_-]{1,39}$/.test(value),
    },
};

/**
 * Normaliza un username de red social quitando prefixes comunes.
 * Ejemplos:
 * - "https://twitch.tv/user" -> "user"
 * - "@username" -> "username"
 * - "user" -> "user"
 */
function normalizeUsername(platform: string, rawValue: string): string | null {
    if (!rawValue || rawValue.trim().length === 0) {
        return null;
    }

    let value = rawValue.trim();

    // Rechazar localhost (seguridad)
    if (value.includes("localhost") || value.includes("127.0.0.1")) {
        console.warn(`Social link rejected: contains localhost (${platform})`);
        return null;
    }

    // Remover protocolos
    value = value.replace(/^https?:\/\//, "");

    // Remover dominios conocidos
    const domainPatterns = {
        twitch: /^(www\.)?twitch\.tv\//,
        youtube: /^(www\.)?youtube\.com\/@?/,
        x: /^(www\.)?(twitter\.com|x\.com)\//,
        github: /^(www\.)?github\.com\//,
    };

    const pattern = domainPatterns[platform as keyof typeof domainPatterns];
    if (pattern) {
        value = value.replace(pattern, "");
    }

    // Remover @ inicial (para YouTube y otros)
    value = value.replace(/^@/, "");

    // Remover trailing slash
    value = value.replace(/\/$/, "");

    // Validar con el patrón específico de la plataforma
    const config = SOCIAL_CONFIG[platform];
    if (config?.validator && !config.validator(value)) {
        console.warn(`Invalid ${platform} username: ${value}`);
        return null;
    }

    return value;
}

/**
 * Construye una URL social canónica y robusta.
 * Retorna null si el valor es inválido.
 */
export function construirUrlSocial(platform: string, rawValue: string): string | null {
    const username = normalizeUsername(platform, rawValue);
    if (!username) return null;

    const config = SOCIAL_CONFIG[platform];
    if (!config) return null;

    return `${config.baseUrl}${username}`;
}
