"use client"

import Link from "next/link"
import { useApp } from "@/lib/store"
import { cn } from "@/lib/utils"

export function EnlaceEmbajador({ id, className, children }: { id: string; className?: string; children: React.ReactNode }) {
  const { soloLectura } = useApp()
  if (soloLectura) {
    return <span className={cn(className, "hover:bg-transparent hover:no-underline")}>{children}</span>
  }
  return (
    <Link href={`/embajadores/${id}`} className={className}>
      {children}
    </Link>
  )
}
