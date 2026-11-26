import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { FormularioAcceso } from "@/components/auth/formulario-acceso"
import { obtenerSesion } from "@/lib/session"

export const metadata: Metadata = {
  title: "Ingresar · Upteam",
  description: "Ingresa o crea tu cuenta para administrar el programa de embajadores de tu comunidad.",
}

export default async function LoginPage() {
  const sesion = await obtenerSesion()
  if (sesion?.user) redirect("/")

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <FormularioAcceso />
    </main>
  )
}
