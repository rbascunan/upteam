import { cn } from "@/lib/utils"

export function PiePagina({ className }: { className?: string }) {
  return (
    <footer className={cn("text-center text-xs text-muted-foreground", className)}>
      Desarrollado por Betito Bascuñan gracias a Vercel · v2.36 · 10/2026
    </footer>
  )
}
