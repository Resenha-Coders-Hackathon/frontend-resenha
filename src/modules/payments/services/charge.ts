import api, { getErrorMessage } from '@/app/plugins/axios'
import type {
  Charge,
  ChargeResult,
  ContributionStatus,
  CreateChargeRequest,
  PayChargeRequest,
  PayChargeResponse,
} from '../types'

const enc = encodeURIComponent

export async function listCharges(taskId: string): Promise<Charge[]> {
  try {
    return (await api.get<{ results: Charge[] }>(`/tasks/${enc(taskId)}/campaigns/`)).data.results
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Não foi possível carregar as cobranças.'))
  }
}

export async function createCharge(taskId: string, payload: CreateChargeRequest): Promise<Charge> {
  try {
    return (await api.post<Charge>(`/tasks/${enc(taskId)}/campaigns/`, payload)).data
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Não foi possível criar a cobrança.'))
  }
}

/** Gera o Pix de uma cobrança; o valor é escolhido por quem paga (mínimo R$ 1,00). */
export async function payCharge(
  chargeId: string,
  payload: PayChargeRequest,
): Promise<PayChargeResponse> {
  try {
    return (
      await api.post<PayChargeResponse>(`/campaigns/${enc(chargeId)}/contributions/`, payload, {
        headers: { 'Idempotency-Key': crypto.randomUUID() },
      })
    ).data
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Não foi possível gerar o Pix.'))
  }
}

/** O backend confirma com o Mercado Pago (webhook ou consulta) e devolve o resultado. */
export async function getChargeResult(contributionId: string): Promise<ChargeResult> {
  try {
    return (await api.get<ContributionStatus>(`/contributions/${enc(contributionId)}/`)).data.result
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Não foi possível consultar o pagamento.'))
  }
}
