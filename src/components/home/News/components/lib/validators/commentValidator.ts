/*
|--------------------------------------------------------------------------
| Tipos
|--------------------------------------------------------------------------
*/

export interface ValidationResult {

    valid: boolean;

    error?: string;

}

/*
|--------------------------------------------------------------------------
| Constantes
|--------------------------------------------------------------------------
*/

export const COMMENT_MAX_LENGTH = 350;

/*
|--------------------------------------------------------------------------
| Validador
|--------------------------------------------------------------------------
*/

export function validateComment(

    message: string,

): ValidationResult {

    const text = message.trim();

    if (text.length === 0) {

        return {

            valid: false,

            error: "El comentario no puede estar vacío.",

        };

    }

    if (text.length > COMMENT_MAX_LENGTH) {

        return {

            valid: false,

            error: `El comentario no puede superar los ${COMMENT_MAX_LENGTH} caracteres.`,

        };

    }

    return {

        valid: true,

    };

}