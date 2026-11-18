import type { Movimiento, Premio } from "@/lib/types"

/**
 * Integración con Stellar (SIMULADA).
 * Toda la lógica on-chain vive aquí para reemplazarla luego por llamadas reales
 * a Stellar Testnet (Horizon / Soroban) sin tocar la UI.
 */

export const STELLAR_RED = "Stellar Testnet"
export const STELLAR_TOKEN = "UPT"
const EXPLORER_BASE = "https://stellar.expert/explorer/testnet"
const TASA_FALLO_SIMULADA = 0.08

export type ResultadoStellar = { ok: true; txHash: string } | { ok: false; error: string }

export function generarHashFalso(random: () => number = Math.random): string {
  let hash = ""
  for (let i = 0; i < 64; i++) hash += Math.floor(random() * 16).toString(16)
  return hash
}

export function generarClavePublicaFalsa(random: () => number = Math.random): string {
  const alfabeto = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
  let clave = "G"
  for (let i = 0; i < 55; i++) clave += alfabeto[Math.floor(random() * alfabeto.length)]
  return clave
}

export function urlTransaccion(txHash: string) {
  return `${EXPLORER_BASE}/tx/${txHash}`
}

export function urlCuenta(clavePublica: string) {
  return `${EXPLORER_BASE}/account/${clavePublica}`
}

export function abreviarHash(hash: string, inicio = 4, fin = 4) {
  if (hash.length <= inicio + fin) return hash
  return `${hash.slice(0, inicio)}…${hash.slice(-fin)}`
}

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function simularTransaccion(): Promise<ResultadoStellar> {
  await esperar(900 + Math.random() * 900)
  if (Math.random() < TASA_FALLO_SIMULADA) {
    return { ok: false, error: "tx_failed: timeout al enviar a Horizon (simulado)" }
  }
  return { ok: true, txHash: generarHashFalso() }
}

/** Registra un movimiento de puntos (UPT) en Stellar Testnet. Simulado. */
export async function registrarMovimientoEnStellar(
  movimiento: Pick<Movimiento, "id" | "embajadorId" | "puntos">,
): Promise<ResultadoStellar> {
  void movimiento
  return simularTransaccion()
}

/** Registra el pago de un premio a la wallet del embajador. Simulado. */
export async function registrarPagoPremioEnStellar(
  premio: Pick<Premio, "id" | "monto" | "moneda">,
  walletDestino: string,
): Promise<ResultadoStellar> {
  void premio
  void walletDestino
  return simularTransaccion()
}
