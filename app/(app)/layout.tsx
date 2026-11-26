import { redirect } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { AppProvider } from "@/lib/store"
import { obtenerSesion } from "@/lib/session"

export default async function Layout({ children }: { children: React.ReactNode }) {
  const sesion = await obtenerSesion()
  if (!sesion?.user) redirect("/login")

  return (
    <AppProvider>
      <AppShell usuario={{ nombre: sesion.user.name, email: sesion.user.email }}>{children}</AppShell>
    </AppProvider>
  )
}
