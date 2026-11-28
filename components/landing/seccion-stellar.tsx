import { ArrowUpRight } from "lucide-react"
import { Bandera } from "@/components/shared/bandera"
import type { CodigoPais } from "@/lib/types"

const movimientos: { nombre: string; pais: CodigoPais; actividad: string; puntos: number; hash: string }[] = [
  { nombre: "Valentina Ríos", pais: "AR", actividad: "Charla en meetup", puntos: 50, hash: "a91f…7c2e" },
  { nombre: "Mateo Quispe", pais: "PE", actividad: "Tutorial publicado", puntos: 30, hash: "4be0…19d3" },
  { nombre: "Camila Herrera", pais: "MX", actividad: "Organizó hackathon", puntos: 120, hash: "f37a…0b84" },
  { nombre: "Santiago Mora", pais: "CR", actividad: "Mentoría", puntos: 20, hash: "c2d9…e561" },
  { nombre: "Lucía Mamani", pais: "BO", actividad: "Espontánea", puntos: 10, hash: "7e14…a3f0" },
  { nombre: "Andrés Vélez", pais: "CO", actividad: "Nuevo integrante referido", puntos: 25, hash: "08c6…d97b" },
]

function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
}

export function SeccionStellar() {
  return (
    <section id="stellar" className="scroll-mt-20 bg-primary/10 py-14">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4">
        <div className="flex max-w-2xl flex-col gap-2">
          <span className="text-sm font-medium text-primary">Verificable</span>
          <h2 className="text-3xl font-semibold text-balance">Cada punto queda registrado en Stellar.</h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Cualquier persona puede abrir el movimiento en la blockchain y comprobar quién recibió qué y cuándo.
          </p>
        </div>

        <figure
          aria-label="Ejemplo de actividad reciente registrada en Stellar"
          className="rounded-3xl border border-border bg-card p-4 shadow-xl shadow-primary/10 md:p-6"
        >
          <figcaption className="mb-2 flex items-center justify-between px-2 text-sm font-semibold tracking-wide uppercase">
            Actividad reciente
            <span className="text-xs font-medium normal-case text-muted-foreground">Stellar Testnet</span>
          </figcaption>
          <ul className="divide-y divide-dashed divide-border">
            {movimientos.map((m) => (
              <li key={m.hash} className="flex flex-wrap items-center gap-3 px-2 py-3 md:flex-nowrap">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-primary">
                  {iniciales(m.nombre)}
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="flex items-center gap-2 truncate font-medium">
                    {m.nombre}
                    <Bandera pais={m.pais} />
                  </span>
                  <span className="truncate text-sm text-muted-foreground">{m.actividad}</span>
                </div>
                <span className="font-semibold whitespace-nowrap text-success">+{m.puntos} StellarPoints</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs text-primary">
                  <span className="font-mono">{m.hash}</span>
                  <span className="hidden sm:inline">Ver en Stellar</span>
                  <ArrowUpRight className="size-3.5" aria-hidden />
                </span>
              </li>
            ))}
          </ul>
        </figure>
      </div>
    </section>
  )
}
