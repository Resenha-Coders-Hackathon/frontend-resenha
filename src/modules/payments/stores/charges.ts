import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from '@/modules/auth'
import { createCharge, getChargeResult, listCharges, payCharge } from '../services'
import type {
  Charge,
  ChargeResult,
  CreateChargeRequest,
  PayChargeRequest,
  PayChargeResponse,
} from '../types'

export const useChargesStore = defineStore('charges', () => {
  const auth = useAuthStore()
  const byTask = ref<Record<string, Charge[]>>({})
  let generation = 0

  // trocar de conta descarta as cobranças e respostas em andamento
  watch(
    () => auth.user?.id,
    () => {
      generation += 1
      byTask.value = {}
    },
  )

  function forTask(taskId: string): Charge[] {
    return byTask.value[taskId] ?? []
  }

  async function load(taskId: string): Promise<void> {
    const current = generation
    const loaded = await listCharges(taskId)
    if (current === generation) byTask.value[taskId] = loaded
  }

  async function create(taskId: string, payload: CreateChargeRequest): Promise<void> {
    if (!auth.user) throw new Error('Entre na sua conta para criar a cobrança.')
    await createCharge(taskId, payload)
    await load(taskId)
  }

  async function pay(charge: Charge, payload: PayChargeRequest): Promise<PayChargeResponse> {
    if (!auth.user) throw new Error('Entre na sua conta para pagar.')
    return payCharge(charge.id, payload)
  }

  /** Depois de aprovado, recarrega a tarefa para o status mudar para "Pago". */
  async function result(contributionId: string, taskId: string): Promise<ChargeResult> {
    const outcome = await getChargeResult(contributionId)
    if (outcome === 'approved') await load(taskId)
    return outcome
  }

  return { byTask, forTask, load, create, pay, result }
})
