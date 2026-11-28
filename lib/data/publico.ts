import "server-only"
import { and, asc, desc, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import * as t from "@/lib/db/schema"
import type { EstadoApp } from "@/lib/types"

const aISOHora = (s: string) => s.replace(" ", "T").slice(0, 19)

export async function enlaceActivo(token: string) {
  if (!token || token.length > 64) return false
  const [fila] = await db
    .select({ id: t.enlacePublico.id })
    .from(t.enlacePublico)
    .where(and(eq(t.enlacePublico.token, token), eq(t.enlacePublico.activo, true)))
    .limit(1)
  return Boolean(fila)
}

/** Solo los datos que muestra el dashboard, sin contactos, wallets, admins ni bitácora. */
export async function cargarEstadoPublico(): Promise<EstadoApp | null> {
  const [comunidad, embajadores, actividades, movimientos, niveles, premios] = await Promise.all([
    db.select().from(t.comunidad).limit(1),
    db.select().from(t.embajadores).orderBy(asc(t.embajadores.nombre)),
    db.select().from(t.actividades),
    db.select().from(t.movimientos).orderBy(desc(t.movimientos.creadoEn)),
    db.select().from(t.niveles).orderBy(asc(t.niveles.orden)),
    db.select().from(t.premios).orderBy(desc(t.premios.fecha)),
  ])
  if (!comunidad[0]) return null

  return {
    comunidad: comunidad[0],
    embajadores: embajadores.map((e) => ({ ...e, telegram: null, wallet: null })),
    actividades,
    movimientos: movimientos.map((m) => ({ ...m, nota: "", creadoEn: aISOHora(m.creadoEn) })),
    niveles,
    premios,
    admins: [],
    bitacora: [],
    cuentas: [],
    adminActualId: "",
  } as EstadoApp
}
