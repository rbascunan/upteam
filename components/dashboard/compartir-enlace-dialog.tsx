"use client"

import { useState } from "react"
import useSWR from "swr"
import { Check, Copy, ExternalLink, Globe, Lock, RefreshCw, Share2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { cambiarEstadoEnlace, obtenerEnlacePublico, regenerarEnlace } from "@/app/actions/enlace-publico"
import { cn } from "@/lib/utils"

export function CompartirEnlaceDialog() {
  const [abierto, setAbierto] = useState(false)
  const { data, mutate, isLoading } = useSWR(abierto ? "enlace-publico" : null, () => obtenerEnlacePublico())
  const [guardando, setGuardando] = useState(false)
  const [copiado, setCopiado] = useState(false)

  const url = data && typeof window !== "undefined" ? `${window.location.origin}/publico/${data.token}` : ""

  const ejecutar = async (fn: () => Promise<{ token: string; activo: boolean }>, exito: string) => {
    setGuardando(true)
    try {
      await mutate(await fn(), { revalidate: false })
      toast.success(exito)
    } catch {
      toast.error("No se pudo actualizar el enlace. Intenta de nuevo.")
    } finally {
      setGuardando(false)
    }
  }

  const copiar = async () => {
    await navigator.clipboard.writeText(url)
    setCopiado(true)
    toast.success("Enlace copiado")
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger render={<Button variant="outline" className="h-10 rounded-xl px-4" />}>
        <Share2 className="size-4" aria-hidden />
        Compartir
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Enlace público del dashboard</DialogTitle>
          <DialogDescription>
            Quien tenga el enlace verá el ranking, cumpleaños, gráficos y actividad reciente. Es solo lectura: no puede editar ni sumar puntos.
          </DialogDescription>
        </DialogHeader>

        {isLoading || !data ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-16 rounded-2xl" />
            <Skeleton className="h-10 rounded-xl" />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 rounded-2xl border p-4">
              <span
                className={cn(
                  "inline-flex size-10 shrink-0 items-center justify-center rounded-xl",
                  data.activo ? "bg-success/15 text-success" : "bg-muted text-muted-foreground",
                )}
                aria-hidden
              >
                {data.activo ? <Globe className="size-5" /> : <Lock className="size-5" />}
              </span>
              <div className="min-w-0 flex-1">
                <Label htmlFor="enlace-activo" className="text-sm font-medium">
                  {data.activo ? "Público" : "Bloqueado"}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {data.activo ? "Cualquiera con el enlace puede verlo." : "El enlace muestra “no disponible” hasta que lo actives."}
                </p>
              </div>
              <Switch
                id="enlace-activo"
                checked={data.activo}
                disabled={guardando}
                onCheckedChange={(v) => ejecutar(() => cambiarEstadoEnlace(v), v ? "Enlace publicado" : "Enlace bloqueado")}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="enlace-url">Enlace</Label>
              <div className="flex gap-2">
                <Input id="enlace-url" readOnly value={url} className="font-mono text-xs" onFocus={(e) => e.currentTarget.select()} />
                <Button variant="outline" size="icon" onClick={copiar} aria-label="Copiar enlace">
                  {copiado ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Abrir enlace en una pestaña nueva"
                  disabled={!data.activo}
                  render={<a href={url} target="_blank" rel="noopener noreferrer" />}
                  nativeButton={false}
                >
                  <ExternalLink className="size-4" aria-hidden />
                </Button>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="self-start text-muted-foreground"
              disabled={guardando}
              onClick={() => ejecutar(() => regenerarEnlace(), "Se generó un enlace nuevo. El anterior dejó de funcionar.")}
            >
              <RefreshCw className="size-3.5" aria-hidden />
              Generar enlace nuevo (invalida el actual)
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
