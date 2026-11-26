import "server-only"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

export async function obtenerSesion() {
  return auth.api.getSession({ headers: await headers() })
}

export async function exigirUsuario() {
  const sesion = await obtenerSesion()
  if (!sesion?.user) throw new Error("No autorizado")
  return sesion.user
}
