export function formatDate(date: string) {

    try {

        return new Date(date).toLocaleDateString("es-ES", {

            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",

        });

    } catch {

        return date;

    }

}