"use client"

import { useState } from "react"
import { Pencil, Plus, Target, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EncabezadoPagina, Panel, Chip, EstadoVacio } from "@/components/shared/ui-bits"
import { ConfirmarDialog } from "@/components/shared/confirmar-dialog"
import { useDatos } from "@/lib/store"
import { formatearNumero } from "@/lib/format"
import type { Actividad } from "@/lib/types"
import { cn } from "@/lib/utils"

export function ReglasView() {
  const { actividades, movimientos, acciones, permitido } = useDatos()
  const [eliminar, setEliminar] = useState<Actividad | null>(null)
  const editable = permitido("gestionar_reglas")

  const usos = (id: string) => movimientos.filter((m) => m.actividadId === id && !m.revierteA)

  return (
    <>
      <EncabezadoPagina
        titulo="Reglas de puntos"
        descripcion="Define cuántos puntos otorga cada actividad. Los cambios no afectan movimientos ya registrados."
        acciones={
          editable && (
            <ActividadDialog
              trigger={
                <Button className="h-10 rounded-xl glow-primary">
                  <Plus className="size-4" aria-hidden />
                  Nueva actividad
                </Button>
              }
            />
          )
        }
      />

      {actividades.length === 0 ? (
        <Panel>
          <EstadoVacio icon={Target} titulo="Aún no hay actividades" descripcion="Crea la primera regla para empezar a sumar puntos." />
        </Panel>
      ) : (
        <Panel className="p-0 sm:p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">Actividad</TableHead>
                <TableHead className="text-right">Puntos</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Usos</TableHead>
                <TableHead className="text-right">Pts emitidos</TableHead>
                <TableHead>Activa</TableHead>
                {editable && <TableHead className="pr-4 text-right">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {actividades.map((a) => {
                const u = usos(a.id)
                const total = u.reduce((s, m) => s + m.puntos, 0)
                return (
                  <TableRow key={a.id} className={cn(!a.activa && "opacity-60")}>
                    <TableCell className="max-w-md pl-4 whitespace-normal">
                      <p className="font-medium">{a.nombre}</p>
                      <p className="text-xs text-muted-foreground text-pretty">{a.descripcion || "Sin descripción"}</p>
                    </TableCell>
                    <TableCell className="text-right text-lg font-bold tabular-nums text-primary">{a.puntosDefecto}</TableCell>
                    <TableCell>{a.puntosVariables ? <Chip tono="orange">Variable</Chip> : <Chip tono="primary">Fijo</Chip>}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">{formatearNumero(u.length)}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">{formatearNumero(total)}</TableCell>
                    <TableCell>
                      {editable ? (
                        <Switch
                          checked={a.activa}
                          aria-label={a.activa ? `Desactivar ${a.nombre}` : `Activar ${a.nombre}`}
                          onCheckedChange={(v) => {
                            acciones.guardarActividad({ ...a, activa: v })
                            toast.success(v ? "Actividad activada" : "Actividad desactivada")
                          }}
                        />
                      ) : a.activa ? (
                        "Sí"
                      ) : (
                        "No"
                      )}
                    </TableCell>
                    {editable && (
                      <TableCell className="pr-4 text-right">
                        <div className="flex justify-end gap-1">
                          <ActividadDialog
                            actividad={a}
                            trigger={
                              <Button variant="ghost" size="icon-sm" aria-label={`Editar ${a.nombre}`}>
                                <Pencil className="size-4" aria-hidden />
                              </Button>
                            }
                          />
                          <Button variant="ghost" size="icon-sm" aria-label={`Eliminar ${a.nombre}`} onClick={() => setEliminar(a)}>
                            <Trash2 className="size-4" aria-hidden />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Panel>
      )}

      <ConfirmarDialog
        abierto={!!eliminar}
        onAbiertoChange={(v) => !v && setEliminar(null)}
        titulo={`¿Eliminar “${eliminar?.nombre}”?`}
        descripcion={
          eliminar && usos(eliminar.id).length
            ? "Esta actividad ya tiene movimientos, así que se desactivará en lugar de eliminarse para conservar el historial."
            : "Esta acción no se puede deshacer."
        }
        textoConfirmar={eliminar && usos(eliminar.id).length ? "Desactivar" : "Eliminar"}
        destructivo
        onConfirmar={() => {
          if (!eliminar) return
          if (usos(eliminar.id).length) acciones.guardarActividad({ ...eliminar, activa: false })
          else acciones.eliminarActividad(eliminar.id)
          toast.success("Listo")
          setEliminar(null)
        }}
      />
    </>
  )
}

function ActividadDialog({ trigger, actividad }: { trigger: React.ReactElement; actividad?: Actividad }) {
  const { acciones } = useDatos()
  const [open, setOpen] = useState(false)
  const inicial = () => ({
    nombre: actividad?.nombre ?? "",
    descripcion: actividad?.descripcion ?? "",
    puntos: String(actividad?.puntosDefecto ?? 10),
    variable: actividad?.puntosVariables ?? false,
    activa: actividad?.activa ?? true,
  })
  const [f, setF] = useState(inicial)
  const puntos = Number(f.puntos)
  const valido = f.nombre.trim().length >= 3 && Number.isInteger(puntos) && puntos > 0

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (v) setF(inicial())
        setOpen(v)
      }}
    >
      <DialogTrigger render={trigger} />
      <DialogContent className="rounded-3xl sm:max-w-md">
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (!valido) return
            acciones.guardarActividad({ id: actividad?.id, nombre: f.nombre.trim(), descripcion: f.descripcion.trim(), puntosDefecto: puntos, puntosVariables: f.variable, activa: f.activa })
            toast.success(actividad ? "Actividad actualizada" : "Actividad creada")
            setOpen(false)
          }}
        >
          <DialogHeader>
            <DialogTitle>{actividad ? "Editar actividad" : "Nueva actividad"}</DialogTitle>
            <DialogDescription>Las actividades activas aparecen al sumar puntos.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="act-nombre">Nombre</Label>
            <Input id="act-nombre" value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} className="rounded-xl" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="act-desc">Descripción</Label>
            <Textarea id="act-desc" rows={2} value={f.descripcion} onChange={(e) => setF({ ...f, descripcion: e.target.value })} className="rounded-xl" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="act-puntos">Puntos por defecto</Label>
            <Input id="act-puntos" type="number" min={1} step={1} value={f.puntos} onChange={(e) => setF({ ...f, puntos: e.target.value })} className="rounded-xl" />
          </div>
          <label className="flex items-center justify-between gap-3 rounded-2xl bg-muted/50 px-4 py-3">
            <span>
              <span className="block text-sm font-medium">Puntos variables</span>
              <span className="block text-xs text-muted-foreground">Permite ajustar los puntos al cargar</span>
            </span>
            <Switch checked={f.variable} onCheckedChange={(v) => setF({ ...f, variable: v })} />
          </label>
          <label className="flex items-center justify-between gap-3 rounded-2xl bg-muted/50 px-4 py-3">
            <span className="text-sm font-medium">Activa</span>
            <Switch checked={f.activa} onCheckedChange={(v) => setF({ ...f, activa: v })} />
          </label>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!valido}>
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
