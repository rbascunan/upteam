import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Sparkles } from "lucide-react"
import { Hero } from "@/components/landing/hero"
import { SeccionComunidades, SeccionFunciones, SeccionProblema } from "@/components/landing/secciones"
import { PiePagina } from "@/components/layout/pie-pagina"
import { obtenerSesion } from "@/lib/session"

export const metadata: Metadata = {
  title: "Upteam · Mide y premia a tu comunidad",
  description:
    "Puntos, niveles y premios para tu comunidad, con cada movimiento registrado en Stellar y un asistente de IA que puntúa por ti.",
}

export default async function LoginPage() {
  const sesion = await obtenerSesion()
  if (sesion?.user) redirect("/")

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
          <span className="flex items-center gap-2 font-semibold">
            <span className="inline-flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="size-4" aria-hidden />
            </span>
            Upteam
          </span>
          <a
            href="#acceso"
            className="inline-flex h-9 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Ingresar
          </a>
        </div>
      </header>
      <main className="flex flex-1 flex-col">
        <Hero />
        <SeccionProblema />
        <SeccionFunciones />
        <SeccionComunidades />
      </main>
      <PiePagina className="px-4 pb-6" />
    </div>
  )
}
