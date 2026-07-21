import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await getServerSession();

  // 1. Si no hay sesión, al login
  if (!session) {
    redirect("/login");
  }

  // 2. Si la sesión existe pero el correo NO es el tuyo, al home (/)
  if (session.user?.email !== "REDACTED_EMAIL ") {
    redirect("/inicio"); 
  }

  // 3. Si llega aquí, es porque ERES tú
  return (
    <div>
      <h1>Bienvenido al Panel de Administración</h1>
      {/* Contenido protegido aquí */}
    </div>
  );
}