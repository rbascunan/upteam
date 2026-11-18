import type { EstadoApp } from "@/lib/types"
import { generarDatosEjemplo } from "@/lib/data/seed"

/**
 * Capa de acceso a datos. Hoy devuelve datos de ejemplo en memoria;
 * para conectar Supabase basta con implementar esta interfaz con consultas reales.
 */
export interface RepositorioDatos {
  cargarEstadoInicial(): Promise<EstadoApp>
}

const repositorioMock: RepositorioDatos = {
  async cargarEstadoInicial() {
    await new Promise((r) => setTimeout(r, 450))
    return generarDatosEjemplo(new Date())
  },
}

export const repositorio: RepositorioDatos = repositorioMock
