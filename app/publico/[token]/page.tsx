import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Eye } from "lucide-react"
import { DashboardView } from "@/components/dashboard/dashboard-view"
import { PiePagina } from "@/components/layout/pie-pagina"
import { ProveedorSoloLectura } from "@/lib/store"
import { cargarEstadoPublico, enlaceActivo } from "@/lib/data/publico"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Estado de la comunidad · UpTeam",
  description: "Ranking y actividad del programa de embajadores, en modo solo lectura.",
  robots: { index: false, follow: false },
}

export default async function PaginaPublica({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  if (!(await enlaceActivo(token))) notFound()
  const estado = await cargarEstadoPublico()
  if (!estado) notFound()

  return (
    <ProveedorSoloLectura estado={estado}>
      <div className="flex min-h-dvh flex-col">
        <header className="border-b border-dashed">
          <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              {estado.comunidad.logo ? (
                <img src={estado.comunidad.logo} alt="" className="size-9 shrink-0 rounded-xl object-cover" />
              ) : (
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground" aria-hidden>
                  {estado.comunidad.nombreApp.slice(0, 1)}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{estado.comunidad.nombreApp}</p>
                <p className="truncate text-xs text-muted-foreground">Programa de embajadores · {estado.comunidad.nombre}</p>
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              <Eye className="size-3.5" aria-hidden />
              Solo lectura
            </span>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <DashboardView />
          <PiePagina className="mt-10 border-t border-dashed pt-4" />
        </main>
      </div>
    </ProveedorSoloLectura>
  )
}
