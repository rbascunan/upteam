import Image from "next/image"
import { Check, Gift, Sparkles, Users, X, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

function Bloque({
  id,
  imagen,
  alt,
  invertir,
  children,
}: {
  id: string
  imagen: string
  alt: string
  invertir?: boolean
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      className="mx-auto grid w-full max-w-6xl scroll-mt-20 items-center gap-8 px-4 py-12 md:grid-cols-2 md:gap-16"
    >
      <div className={cn("flex flex-col gap-5", invertir && "md:order-2")}>{children}</div>
      <Image
        src={imagen}
        alt={alt}
        width={560}
        height={560}
        className="mx-auto w-full max-w-sm rounded-3xl md:max-w-md"
      />
    </section>
  )
}

function Titulo({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-primary">{etiqueta}</span>
      <h2 className="text-3xl font-semibold text-balance">{children}</h2>
    </div>
  )
}

export function SeccionProblema() {
  const antes = ["Aportes en chats y planillas", "Nadie sabe quién suma más", "Premios sin criterio claro"]
  const ahora = ["Todo registrado en un lugar", "Ranking visible y justo", "Recompensas verificables en Stellar"]
  return (
    <Bloque id="problema" imagen="/images/comunidad-3d.png" alt="Ilustración 3D de personas de una comunidad celebrando juntas">
      <Titulo etiqueta="El problema">Las comunidades crecen con esfuerzo que nadie mide.</Titulo>
      <div className="grid gap-4 sm:grid-cols-2">
        <ul className="flex flex-col gap-2 rounded-2xl bg-card p-5">
          <li className="text-sm font-semibold text-muted-foreground">Antes</li>
          {antes.map((t) => (
            <li key={t} className="flex items-start gap-2 text-sm">
              <X className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
              {t}
            </li>
          ))}
        </ul>
        <ul className="flex flex-col gap-2 rounded-2xl bg-card p-5">
          <li className="text-sm font-semibold text-primary">Con Upteam</li>
          {ahora.map((t) => (
            <li key={t} className="flex items-start gap-2 text-sm">
              <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
              {t}
            </li>
          ))}
        </ul>
      </div>
    </Bloque>
  )
}

const funciones = [
  { icono: Users, titulo: "Integrantes", texto: "Perfiles, países y actividad." },
  { icono: Sparkles, titulo: "Puntos con IA", texto: "Sugiere cuántos puntos dar." },
  { icono: BarChart3, titulo: "Ranking y niveles", texto: "Progreso claro para todos." },
  { icono: Gift, titulo: "Premios", texto: "Canje de recompensas on-chain." },
]

export function SeccionFunciones() {
  return (
    <Bloque
      id="funciones"
      invertir
      imagen="/images/recompensas-3d.png"
      alt="Ilustración 3D de una caja de regalo entregando tokens de recompensa"
    >
      <Titulo etiqueta="Cómo funciona">Todo lo que tu programa necesita.</Titulo>
      <ul className="grid gap-3 sm:grid-cols-2">
        {funciones.map(({ icono: Icono, titulo, texto }) => (
          <li key={titulo} className="flex flex-col gap-2 rounded-2xl bg-card p-5">
            <Icono className="size-5 text-primary" aria-hidden />
            <h3 className="font-semibold">{titulo}</h3>
            <p className="text-sm text-muted-foreground">{texto}</p>
          </li>
        ))}
      </ul>
    </Bloque>
  )
}

export function SeccionComunidades() {
  return (
    <Bloque id="comunidades" imagen="/images/mundo-3d.png" alt="Ilustración 3D de un globo terráqueo conectado a comunidades">
      <Titulo etiqueta="Para quién">Hecho por comunidades, para comunidades.</Titulo>
      <p className="text-lg text-muted-foreground text-pretty">
        Lo creamos integrantes de comunidades que vivimos este problema mes a mes. Sirve para comunidades tech, Web3,
        educativas o sociales, en cualquier país.
      </p>
      <a
        href="#acceso"
        className="inline-flex h-11 w-fit items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        Crear cuenta gratis
      </a>
    </Bloque>
  )
}
