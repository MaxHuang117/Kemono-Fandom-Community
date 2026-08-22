import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/session";

export default async function AdminPage() {
  const perfil = await getSessionProfile();

  if (!perfil) {
    redirect("/login");
  }

  if (!perfil.isAdmin) {
    redirect("/inicio");
  }

  return (
    <div>
      <h1>Bienvenido al Panel de Administración</h1>
      {/* Contenido protegido aquí */}
    </div>
  );
}
