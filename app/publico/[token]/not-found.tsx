import { Lock } from "lucide-react"

export default function EnlaceNoDisponible() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center">
      <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground" aria-hidden>
        <Lock className="size-5" />
      </span>
      <h1 className="text-xl font-semibold">Este enlace no está disponible</h1>
      <p className="max-w-sm text-sm text-pretty text-muted-foreground">
        El reporte público fue bloqueado o el enlace cambió. Pide el enlace actualizado al equipo de la comunidad.
      </p>
    </main>
  )
}
