"use server"

import { randomBytes } from "node:crypto"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { enlacePublico } from "@/lib/db/schema"
import { exigirUsuario } from "@/lib/session"

const ID = "principal"

export interface EstadoEnlacePublico {
  token: string
  activo: boolean
}

const nuevoToken = () => randomBytes(18).toString("base64url")

export async function obtenerEnlacePublico(): Promise<EstadoEnlacePublico> {
  await exigirUsuario()
  const [fila] = await db.select().from(enlacePublico).where(eq(enlacePublico.id, ID)).limit(1)
  if (fila) return { token: fila.token, activo: fila.activo }
  const [creado] = await db
    .insert(enlacePublico)
    .values({ id: ID, token: nuevoToken(), activo: false })
    .onConflictDoNothing()
    .returning()
  if (creado) return { token: creado.token, activo: creado.activo }
  const [existente] = await db.select().from(enlacePublico).where(eq(enlacePublico.id, ID)).limit(1)
  return { token: existente.token, activo: existente.activo }
}

export async function cambiarEstadoEnlace(activo: boolean): Promise<EstadoEnlacePublico> {
  await obtenerEnlacePublico()
  const [fila] = await db
    .update(enlacePublico)
    .set({ activo, actualizadoEn: new Date().toISOString() })
    .where(eq(enlacePublico.id, ID))
    .returning()
  return { token: fila.token, activo: fila.activo }
}

export async function regenerarEnlace(): Promise<EstadoEnlacePublico> {
  await obtenerEnlacePublico()
  const [fila] = await db
    .update(enlacePublico)
    .set({ token: nuevoToken(), actualizadoEn: new Date().toISOString() })
    .where(eq(enlacePublico.id, ID))
    .returning()
  return { token: fila.token, activo: fila.activo }
}
