import { Bot, Link2, Trophy } from "lucide-react"
import { FormularioAcceso } from "@/components/auth/formulario-acceso"
import { SelloStellar } from "@/components/auth/sello-stellar"

const diferenciales = [
  { icono: Trophy, texto: "Puntos, niveles y premios para tu comunidad" },
  { icono: Link2, texto: "Cada movimiento queda público en Stellar" },
  { icono: Bot, texto: "Asistente de IA que puntúa por ti" },
]

export function Hero() {
  return (
    <section className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-10 md:grid-cols-2 md:py-16">
      <div className="flex flex-col gap-6">
        <span className="w-fit rounded-full bg-accent px-3 py-1 text-xs font-medium text-primary">
          Para comunidades
        </span>
        <h1 className="text-4xl font-semibold leading-tight text-balance md:text-5xl">
          Mide y premia a tu comunidad, sin planillas.
        </h1>
        <p className="max-w-md text-lg text-muted-foreground text-pretty">
          Upteam ordena tu programa de embajadores: registra aportes, suma puntos y entrega recompensas de forma
          transparente.
        </p>
        <ul className="flex flex-col gap-3">
          {diferenciales.map(({ icono: Icono, texto }) => (
            <li key={texto} className="flex items-center gap-3">
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icono className="size-4" aria-hidden />
              </span>
              <span className="font-medium">{texto}</span>
            </li>
          ))}
        </ul>
      </div>

      <div id="acceso" className="flex scroll-mt-20 flex-col items-center gap-4">
        <FormularioAcceso />
        <SelloStellar />
      </div>
    </section>
  )
}
