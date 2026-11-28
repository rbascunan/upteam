"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn, signUp } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

type Modo = "ingresar" | "registrarse"

export function FormularioAcceso() {
  const router = useRouter()
  const [modo, setModo] = useState<Modo>("ingresar")
  const [verClave, setVerClave] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const datos = new FormData(e.currentTarget)
    const email = String(datos.get("email") ?? "").trim()
    const clave = String(datos.get("clave") ?? "")
    const nombre = String(datos.get("nombre") ?? "").trim()

    setError(null)
    if (modo === "registrarse" && clave !== String(datos.get("confirmar") ?? "")) {
      setError("Las contraseñas no coinciden.")
      return
    }

    setCargando(true)
    const { error } =
      modo === "ingresar"
        ? await signIn.email({ email, password: clave })
        : await signUp.email({ email, password: clave, name: nombre })
    setCargando(false)

    if (error) {
      setError(
        modo === "ingresar"
          ? "Email o contraseña incorrectos."
          : error.code === "PASSWORD_TOO_SHORT"
            ? "La contraseña debe tener al menos 8 caracteres."
            : "No pudimos crear la cuenta. Revisa los datos o intenta con otro email.",
      )
      return
    }
    router.push("/")
    router.refresh()
  }

  function cambiarModo(nuevo: Modo) {
    setModo(nuevo)
    setError(null)
  }

  return (
    <div className="neu w-full max-w-md rounded-3xl p-8">
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Sparkles className="size-6" aria-hidden />
        </span>
        <h2 className="text-2xl font-semibold text-balance">
          {modo === "ingresar" ? "Bienvenido a Upteam" : "Crea tu cuenta"}
        </h2>
        <p className="text-sm text-muted-foreground text-pretty">
          {modo === "ingresar"
            ? "Ingresa para administrar el programa de embajadores de tu comunidad."
            : "Regístrate con tu email y una contraseña de al menos 8 caracteres."}
        </p>
      </div>

      <div role="tablist" aria-label="Tipo de acceso" className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
        {(["ingresar", "registrarse"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={modo === m}
            onClick={() => cambiarModo(m)}
            className={cn(
              "rounded-lg py-2 text-sm font-medium transition-colors",
              modo === m ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {m === "ingresar" ? "Ingresar" : "Crear cuenta"}
          </button>
        ))}
      </div>

      <form onSubmit={enviar} className="flex flex-col gap-4" noValidate={false}>
        {modo === "registrarse" && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" name="nombre" autoComplete="name" required className="h-10" />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required className="h-10" />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="clave">Contraseña</Label>
          <div className="relative">
            <Input
              id="clave"
              name="clave"
              type={verClave ? "text" : "password"}
              autoComplete={modo === "ingresar" ? "current-password" : "new-password"}
              minLength={8}
              required
              className="h-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setVerClave((v) => !v)}
              aria-label={verClave ? "Ocultar contraseña" : "Mostrar contraseña"}
              aria-pressed={verClave}
              className="absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
            >
              {verClave ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        {modo === "registrarse" && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="confirmar">Repetir contraseña</Label>
            <Input
              id="confirmar"
              name="confirmar"
              type={verClave ? "text" : "password"}
              autoComplete="new-password"
              minLength={8}
              required
              className="h-10"
            />
          </div>
        )}

        {error && (
          <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={cargando}
          className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {cargando && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {modo === "ingresar" ? "Ingresar" : "Crear cuenta"}
        </button>
      </form>
    </div>
  )
}
