"use server"

import { eq, inArray } from "drizzle-orm"
import { BASE_FEE, Horizon, Keypair, Memo, Networks, Operation, TransactionBuilder } from "@stellar/stellar-sdk"
import { db } from "@/lib/db"
import * as t from "@/lib/db/schema"
import type { ResultadoStellar } from "@/lib/stellar"

const HORIZON_URL = "https://horizon-testnet.stellar.org"
const MAX_POR_LLAMADA = 50
const horizon = new Horizon.Server(HORIZON_URL)

let keypairCache: Keypair | null = null

async function obtenerKeypair(): Promise<Keypair> {
  if (keypairCache) return keypairCache
  const secreto = process.env.STELLAR_SECRET_KEY
  if (!secreto) throw new Error("Falta la variable de entorno STELLAR_SECRET_KEY")
  const kp = Keypair.fromSecret(secreto)
  try {
    await db
      .insert(t.configStellar)
      .values({ id: "registro", clavePublica: kp.publicKey() })
      .onConflictDoUpdate({ target: t.configStellar.id, set: { clavePublica: kp.publicKey() } })
  } catch (e) {
    // Only informational: a failure here must never block registering movements on-chain.
    console.error("No se pudo guardar la clave pública de Stellar", e)
  }
  keypairCache = kp
  return kp
}

function recortarBytes(texto: string, max: number) {
  let s = texto
  while (Buffer.byteLength(s, "utf8") > max) s = s.slice(0, -1)
  return s
}

function describirError(e: unknown): string {
  const codigos = (e as { response?: { data?: { extras?: { result_codes?: unknown } } } })?.response?.data?.extras?.result_codes
  if (codigos) return `Horizon: ${JSON.stringify(codigos)}`
  return e instanceof Error ? e.message : "Error desconocido al enviar a Stellar"
}

/**
 * Registra eventos en Stellar Testnet sin mover fondos: una transacción con memo y una operación
 * manageData por evento (máx. 100 por transacción), así una carga masiva se confirma de una vez.
 */
async function registrarEvento(memo: string, clave: string, valor: string | string[]): Promise<ResultadoStellar> {
  let kp: Keypair
  try {
    kp = await obtenerKeypair()
  } catch (e) {
    return { ok: false, error: describirError(e) }
  }
  const valores = (Array.isArray(valor) ? valor : [valor]).slice(0, 100)
  let ultimoError = ""
  for (let intento = 0; intento < 3; intento++) {
    try {
      const cuenta = await horizon.loadAccount(kp.publicKey())
      const builder = new TransactionBuilder(cuenta, { fee: String(Number(BASE_FEE) * 10), networkPassphrase: Networks.TESTNET })
      for (const v of valores) builder.addOperation(Operation.manageData({ name: recortarBytes(clave, 64), value: recortarBytes(v, 64) }))
      const tx = builder.addMemo(Memo.text(recortarBytes(memo, 28))).setTimeout(60).build()
      tx.sign(kp)
      const res = await horizon.submitTransaction(tx)
      return { ok: true, txHash: res.hash }
    } catch (e) {
      ultimoError = describirError(e)
      if (!ultimoError.includes("tx_bad_seq") && !ultimoError.includes("timeout")) break
      await new Promise((r) => setTimeout(r, 1500))
    }
  }
  return { ok: false, error: ultimoError }
}

async function actualizarBalance() {
  try {
    const kp = await obtenerKeypair()
    const cuenta = await horizon.loadAccount(kp.publicKey())
    const xlm = Number(cuenta.balances.find((b) => b.asset_type === "native")?.balance ?? 0)
    await db.update(t.cuentasStellar).set({ balanceXLM: xlm }).where(eq(t.cuentasStellar.tipo, "registro"))
  } catch {
    // El balance es informativo; un fallo aquí no invalida los registros.
  }
}

export interface MovimientoARegistrar {
  id: string
  embajadorId: string
  puntos: number
}

export async function registrarMovimientosStellar(
  movimientos: MovimientoARegistrar[],
): Promise<{ id: string; resultado: ResultadoStellar }[]> {
  const validos = movimientos
    .slice(0, MAX_POR_LLAMADA)
    .filter((m) => typeof m.id === "string" && typeof m.embajadorId === "string" && Number.isInteger(m.puntos))

  if (!validos.length) return []
  const conSigno = (p: number) => `${p > 0 ? "+" : ""}${p}`
  const neto = validos.reduce((s, m) => s + m.puntos, 0)
  const memo = validos.length === 1 ? `${conSigno(neto)} StellarPoints` : `${validos.length} mov ${conSigno(neto)} SP`
  const resultado = await registrarEvento(memo, "StellarPoints", validos.map((m) => `${m.id}|${m.embajadorId}|${conSigno(m.puntos)}`))
  if (resultado.ok) {
    await db
      .update(t.movimientos)
      .set({ txHash: resultado.txHash, estadoBlockchain: "confirmado" })
      .where(inArray(t.movimientos.id, validos.map((m) => m.id)))
      .catch((e) => console.error("No se pudo marcar los movimientos como confirmados", e))
  }
  await actualizarBalance()
  return validos.map((m) => ({ id: m.id, resultado }))
}

export async function registrarPremioStellar(premio: { id: string; monto: number; moneda: string; tipo?: string }): Promise<ResultadoStellar> {
  if (typeof premio.id !== "string" || !Number.isFinite(premio.monto)) return { ok: false, error: "Premio inválido" }
  const detalle = premio.tipo && premio.tipo !== "dinero" ? premio.tipo : `${premio.monto} ${premio.moneda}`
  const resultado = await registrarEvento(`Premio ${detalle}`, "Premio", `${premio.id}|${detalle}`)
  await actualizarBalance()
  return resultado
}
