import { PAISES } from "@/lib/data/paises"
import type { CodigoPais } from "@/lib/types"
import { cn } from "@/lib/utils"

export function Bandera({ pais, conNombre = false, className }: { pais: CodigoPais; conNombre?: boolean; className?: string }) {
  const info = PAISES[pais]
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://flagcdn.com/${info.iso}.svg`}
        alt={conNombre ? "" : info.nombre}
        width={20}
        height={14}
        className="h-3.5 w-5 shrink-0 rounded-[3px] object-cover shadow-sm"
        loading="lazy"
      />
      {conNombre && <span className="truncate">{info.nombre}</span>}
    </span>
  )
}
