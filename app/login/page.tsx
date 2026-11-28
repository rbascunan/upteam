import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Sparkles } from "lucide-react"
import { Hero } from "@/components/landing/hero"
import { SeccionComunidades, SeccionFunciones, SeccionProblema } from "@/components/landing/secciones"
import { SeccionStellar } from "@/components/landing/seccion-stellar"
import { TecnologiaStellar } from "@/components/landing/tecnologia-stellar"
import { PiePagina } from "@/components/layout/pie-pagina"

const menu = [
  { href: "#problema", texto: "Problema" },
  { href: "#funciones", texto: "Funciones" },
  { href: "#stellar", texto: "Stellar" },
  { href: "#comunidades", texto: "Comunidades" },
]
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
          <nav aria-label="Secciones" className="hidden md:block">
            <ul className="flex items-center gap-6 text-sm text-muted-foreground">
              {menu.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="transition-colors hover:text-foreground">
                    {item.texto}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
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
        <SeccionStellar />
        <SeccionComunidades />
      </main>
      <footer className="flex flex-col gap-4 pb-6">
        <TecnologiaStellar />
        <PiePagina className="px-4" />
      </footer>
    </div>
  )
}
