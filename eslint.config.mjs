import js from "@eslint/js";
import globals from "globals";

export default [
  // Aplica las reglas recomendadas de ESLint en todo el proyecto
  js.configs.recommended,
  
  {
    // Define en qué entorno se ejecuta tu código (Navegador y Node)
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    // Aquí puedes añadir o apagar reglas si lo deseas más adelante
    rules: {
      "no-unused-vars": "warn", // Solo da una advertencia si dejas variables sin usar
    },
  },
  
  // Ignora carpetas de compilación automáticas para que no busques errores en ellas
  {
    ignores: [".next/**", "node_modules/**", "dist/**", "build/**"],
  }
];