import type { InviteErrorCode } from '../types'

export interface InviteProblem {
  code: InviteErrorCode | 'forbidden' | 'network' | 'unknown'
  message: string
  invitedEmail?: string
  organizationId?: string
}

const MESSAGES: Record<InviteErrorCode, string> = {
  invite_invalid: 'Este link de convite não é válido. Abra o link completo do e-mail.',
  invite_used: 'Este convite já foi aceito ou foi cancelado por quem o enviou.',
  invite_expired: 'Este convite expirou. Peça a quem convidou para enviar um novo.',
  invite_wrong_account: 'Este convite foi enviado para outro e-mail.',
}

/** Transforma o erro da API de convites em algo que a tela consiga explicar. */
export function inviteProblem(error: unknown): InviteProblem {
  const response = (error as { response?: { status?: number; data?: unknown } } | null)?.response
  if (!response) {
    return {
      code: 'network',
      message: 'Sem conexão com o servidor. Confira a internet e tente de novo.',
    }
  }
  const data = (response.data ?? {}) as Record<string, unknown>
  const code = data.code as InviteErrorCode | undefined
  if (code && code in MESSAGES) {
    return {
      code,
      message: MESSAGES[code],
      invitedEmail: typeof data.invited_email === 'string' ? data.invited_email : undefined,
      organizationId: typeof data.organization_id === 'string' ? data.organization_id : undefined,
    }
  }
  if (response.status === 403) {
    return {
      code: 'forbidden',
      message:
        'O servidor recusou o pedido (sessão ou endereço do site). Entre de novo e abra o link pelo mesmo endereço em que você usa o app.',
    }
  }
  return {
    code: 'unknown',
    message: 'Não foi possível aceitar o convite. Tente de novo em instantes.',
  }
}
