"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowUpRight, Check, Gift, Plus, Send, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EncabezadoPagina, Panel, Chip, EstadoVacio, IconBox } from "@/components/shared/ui-bits"
import { SimpleSelect } from "@/components/shared/simple-select"
import { ConfirmarDialog } from "@/components/shared/confirmar-dialog"
import { useDatos } from "@/lib/store"
import { formatearFecha, formatearNumero, hoyISO } from "@/lib/format"
import { abreviarHash, urlTransaccion } from "@/lib/stellar"
import type { EstadoPremio, MonedaPremio, Premio, TipoPremio } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"

const TONO: Record<EstadoPremio, "orange" | "primary" | "success"> = { pendiente: "orange", aprobado: "primary", pagado: "success" }

const TIPOS_PREMIO: Record<TipoPremio, string> = {
  dinero: "Dinero (pago en Stellar)",
  beca: "Beca",
  viaje: "Viaje",
  producto: "Producto / merch",
  experiencia: "Experiencia / evento",
  otro: "Otro",
}

export function PremiosView() {
  const { premios, embajadores, acciones, permitido } = useDatos()
  const [filtro, setFiltro] = useState<"todos" | EstadoPremio>("todos")
  const [pagando, setPagando] = useState<string | null>(null)
  const [eliminar, setEliminar] = useState<Premio | null>(null)
  const editable = permitido("gestionar_premios")

  const resumen = useMemo(() => {
    const r = { pendiente: 0, aprobado: 0, pagado: 0 }
    premios.forEach((p) => r[p.estado]++)
    return r
  }, [premios])

  const filas = premios.filter((p) => filtro === "todos" || p.estado === filtro)

  const pagar = async (p: Premio) => {
    setPagando(p.id)
    const t = toast.loading(`Enviando ${p.monto} ${p.moneda} en Stellar…`)
    const r = await acciones.pagarPremio(p.id)
    setPagando(null)
    if (r.ok) toast.success("Premio pagado", { id: t })
    else toast.error(r.error, { id: t })
  }

  return (
    <>
      <EncabezadoPagina
        titulo="Premios"
        descripcion="Recompensas para tus embajadores. Al pagar, se envía una transacción en Stellar Testnet."
        acciones={
          editable && (
            <PremioDialog
              trigger={
                <Button className="h-10 rounded-xl glow-primary">
                  <Plus className="size-4" aria-hidden />
                  Nuevo premio
                </Button>
              }
            />
          )
        }
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        {(
          [
            ["pendiente", "Pendientes de aprobar", "orange"],
            ["aprobado", "Aprobados por pagar", "primary"],
            ["pagado", "Pagados", "success"],
          ] as const
        ).map(([k, label, tono]) => (
          <button
            key={k}
            type="button"
            onClick={() => setFiltro(filtro === k ? "todos" : k)}
            aria-pressed={filtro === k}
            className={cn("neu-card flex items-center gap-4 rounded-3xl bg-card p-5 text-left transition", filtro === k && "ring-2 ring-primary")}
          >
            <IconBox icon={k === "pagado" ? Check : k === "aprobado" ? Send : Gift} tono={tono} />
            <span>
              <span className="block text-2xl font-bold tabular-nums">{resumen[k]}</span>
              <span className="block text-sm text-muted-foreground">{label}</span>
            </span>
          </button>
        ))}
      </div>

      <Panel className="p-0 sm:p-0">
        {filas.length === 0 ? (
          <EstadoVacio icon={Gift} titulo="Sin premios" descripcion={filtro === "todos" ? "Crea el primer premio para un embajador." : "No hay premios en este estado."} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">Embajador</TableHead>
                <TableHead>Concepto</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="pr-4 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filas.map((p) => {
                const emb = embajadores.find((e) => e.id === p.embajadorId)
                return (
                  <TableRow key={p.id}>
                    <TableCell className="pl-4">
                      <Link href={`/embajadores/${p.embajadorId}`} className="text-sm font-medium hover:underline">
                        {emb?.nombre ?? "—"}
                      </Link>
                      {!emb?.wallet && <span className="block text-xs text-[color-mix(in_oklab,var(--brand-orange)_75%,var(--foreground))]">Sin wallet</span>}
                    </TableCell>
                    <TableCell className="text-sm">
                      {p.concepto}
                      {p.tipo !== "dinero" && <span className="block text-xs text-muted-foreground">{TIPOS_PREMIO[p.tipo]}{p.descripcion ? ` · ${p.descripcion}` : ""}</span>}
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {p.tipo === "dinero" ? (
                        <>
                          {formatearNumero(p.monto, 2)} <span className="text-xs text-muted-foreground">{p.moneda}</span>
                        </>
                      ) : p.monto > 0 ? (
                        <span className="text-muted-foreground">~{formatearNumero(p.monto, 0)} USD</span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatearFecha(p.fecha)}</TableCell>
                    <TableCell>
                      <Chip tono={TONO[p.estado]} className="capitalize">
                        {p.estado}
                      </Chip>
                    </TableCell>
                    <TableCell className="pr-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        {p.estado === "pagado" && p.txHash && (
                          <a href={urlTransaccion(p.txHash)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-mono text-xs text-primary hover:underline">
                            {abreviarHash(p.txHash)}
                            <ArrowUpRight className="size-3" aria-hidden />
                          </a>
                        )}
                        {editable && p.estado === "pendiente" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              acciones.aprobarPremio(p.id)
                              toast.success("Premio aprobado")
                            }}
                          >
                            Aprobar
                          </Button>
                        )}
                        {editable && p.estado === "aprobado" && p.tipo === "dinero" && (
                          <Button size="sm" disabled={pagando === p.id || !emb?.wallet} onClick={() => pagar(p)}>
                            {pagando === p.id ? "Enviando…" : "Pagar"}
                          </Button>
                        )}
                        {editable && p.estado === "aprobado" && p.tipo !== "dinero" && (
                          <Button
                            size="sm"
                            onClick={() => {
                              acciones.entregarPremio(p.id)
                              toast.success("Premio marcado como entregado")
                            }}
                          >
                            Marcar entregado
                          </Button>
                        )}
                        {editable && p.estado !== "pagado" && (
                          <Button size="icon-sm" variant="ghost" aria-label="Eliminar premio" onClick={() => setEliminar(p)}>
                            <Trash2 className="size-4" aria-hidden />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </Panel>

      <ConfirmarDialog
        abierto={!!eliminar}
        onAbiertoChange={(v) => !v && setEliminar(null)}
        titulo="¿Eliminar premio?"
        descripcion={eliminar?.concepto}
        textoConfirmar="Eliminar"
        destructivo
        onConfirmar={() => {
          if (eliminar) acciones.eliminarPremio(eliminar.id)
          setEliminar(null)
          toast.success("Premio eliminado")
        }}
      />
    </>
  )
}

function PremioDialog({ trigger }: { trigger: React.ReactElement }) {
  const { embajadores, acciones } = useDatos()
  const activos = embajadores.filter((e) => e.estado === "activo")
  const [open, setOpen] = useState(false)
  const inicial = () => ({ embajadorId: activos[0]?.id ?? "", tipo: "dinero" as TipoPremio, concepto: "", descripcion: "", monto: "10", moneda: "XLM" as MonedaPremio })
  const [f, setF] = useState(inicial)
  const esDinero = f.tipo === "dinero"
  const monto = Number(f.monto)
  const valido = f.embajadorId && f.concepto.trim().length >= 3 && (esDinero ? monto > 0 : monto >= 0)

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
            acciones.crearPremio({
              embajadorId: f.embajadorId,
              tipo: f.tipo,
              concepto: f.concepto.trim(),
              descripcion: f.descripcion.trim(),
              monto: esDinero ? monto : monto || 0,
              moneda: esDinero ? f.moneda : "USDC",
              fecha: hoyISO(),
            })
            toast.success("Premio creado, pendiente de aprobación")
            setOpen(false)
          }}
        >
          <DialogHeader>
            <DialogTitle>Nuevo premio</DialogTitle>
            <DialogDescription>Queda pendiente hasta que un super admin lo apruebe.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="pr-emb">Embajador</Label>
            <SimpleSelect id="pr-emb" value={f.embajadorId} onChange={(v) => setF({ ...f, embajadorId: v })} opciones={activos.map((e) => ({ value: e.id, label: e.nombre }))} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="pr-tipo">Tipo de premio</Label>
            <SimpleSelect
              id="pr-tipo"
              value={f.tipo}
              onChange={(v) => setF({ ...f, tipo: v as TipoPremio, monto: v === "dinero" ? f.monto || "10" : "0" })}
              opciones={(Object.keys(TIPOS_PREMIO) as TipoPremio[]).map((t) => ({ value: t, label: TIPOS_PREMIO[t] }))}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="pr-concepto">Concepto</Label>
            <Input
              id="pr-concepto"
              value={f.concepto}
              onChange={(e) => setF({ ...f, concepto: e.target.value })}
              placeholder={esDinero ? "Ej.: Embajador del mes" : "Ej.: Beca para viajar a Meridian 2027"}
              className="rounded-xl"
            />
          </div>
          {!esDinero && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="pr-desc">Detalle (opcional)</Label>
              <Textarea
                id="pr-desc"
                rows={2}
                value={f.descripcion}
                onChange={(e) => setF({ ...f, descripcion: e.target.value })}
                placeholder="Ej.: Incluye pasaje y hospedaje 3 noches"
                className="rounded-xl"
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="pr-monto">{esDinero ? "Monto" : "Valor estimado (opcional)"}</Label>
              <Input id="pr-monto" type="number" min={esDinero ? 0.01 : 0} step={0.01} value={f.monto} onChange={(e) => setF({ ...f, monto: e.target.value })} className="rounded-xl" />
            </div>
            {esDinero ? (
              <div className="flex flex-col gap-2">
                <Label htmlFor="pr-moneda">Moneda</Label>
                <SimpleSelect
                  id="pr-moneda"
                  value={f.moneda}
                  onChange={(v) => setF({ ...f, moneda: v as MonedaPremio })}
                  opciones={(["XLM", "USDC", "StellarPoints"] as const).map((m) => ({ value: m, label: m }))}
                />
              </div>
            ) : (
              <p className="self-end pb-2 text-xs text-muted-foreground">En USD. Se marca como entregado, sin pago en Stellar.</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!valido}>
              Crear premio
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
