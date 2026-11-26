import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { FormularioAcceso } from "@/components/auth/formulario-acceso"
import { SelloStellar } from "@/components/auth/sello-stellar"
import { PiePagina } from "@/components/layout/pie-pagina"
import { obtenerSesion } from "@/lib/session"

export const metadata: Metadata = {
  title: "Ingresar · Upteam",
  description: "Ingresa o crea tu cuenta para administrar el programa de embajadores de tu comunidad.",
}

export default async function LoginPage() {
  const sesion = await obtenerSesion()
  if (sesion?.user) redirect("/")

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-10">
        <FormularioAcceso />
        <SelloStellar />
      </main>
      <PiePagina className="px-4 pb-6" />
    </div>
  )
}
