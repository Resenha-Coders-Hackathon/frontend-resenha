export interface LoginCredentials {
  email: string
  password: string
}

export interface RegistrationRequest {
  email: string
}

export interface RegistrationConfirmation {
  email: string
  code: string
  name: string
  password: string
}

export interface PasswordResetVerification {
  email: string
  code: string
}

export interface PasswordResetConfirmation extends PasswordResetVerification {
  new_password: string
}

const API_PATHS = {
  login: '/login/',
  googleLogin: '/login/google/',
  registrationRequest: '/registration/request/',
  registrationConfirm: '/registration/confirm/',
  passwordResetRequest: '/password-reset/request/',
  passwordResetVerify: '/password-reset/verify/',
  passwordResetConfirm: '/password-reset/confirm/',
} as const

function getEndpoint(path: string): URL {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
  if (!apiBaseUrl) {
    throw new Error('Configure VITE_API_BASE_URL com a URL base do backend.')
  }

  try {
    return new URL(`${apiBaseUrl.replace(/\/+$/, '')}${path}`)
  } catch {
    throw new Error('VITE_API_BASE_URL não contém uma URL válida.')
  }
}

async function post<T>(
  path: string,
  payload: T,
  unauthorizedMessage = 'E-mail ou senha incorretos.',
): Promise<void> {
  const response = await fetch(getEndpoint(path), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (response.ok) return

  if (path === API_PATHS.googleLogin && response.status === 404) {
    throw new Error('Login Google não está habilitado no backend. Integre a branch feat/google-auth.')
  }

  const body: unknown = await response.json().catch(() => null)
  throw new Error(getErrorMessage(body, response.status, unauthorizedMessage))
}

function getErrorMessage(
  body: unknown,
  status: number,
  unauthorizedMessage: string,
): string {
  if (status === 401 || status === 403) return unauthorizedMessage

  if (body && typeof body === 'object') {
    const record = body as Record<string, unknown>
    if (typeof record.detail === 'string') return translateApiMessage(record.detail)

    const firstError = Object.values(record).flatMap((value) =>
      Array.isArray(value) ? value : [value],
    )[0]
    if (typeof firstError === 'string') return translateApiMessage(firstError)
  }

  if (status === 409) return 'Este e-mail já está cadastrado.'
  return 'Não foi possível concluir sua solicitação. Tente novamente.'
}

function translateApiMessage(message: string): string {
  const normalized = message.toLowerCase()
  if (normalized.includes('account is already active')) {
    return 'Este e-mail já possui uma conta. Entre para continuar.'
  }
  if (normalized.includes('verification code') && normalized.includes('invalid')) {
    return 'Código inválido ou expirado. Confira e tente novamente.'
  }
  if (normalized.includes('at least 9 characters')) {
    return 'A senha precisa ter pelo menos 9 caracteres.'
  }
  return message
}

export function login(credentials: LoginCredentials): Promise<void> {
  return post(API_PATHS.login, credentials)
}

export function loginWithGoogle(credential: string): Promise<void> {
  return post(
    API_PATHS.googleLogin,
    { credential },
    'Não foi possível validar sua conta Google. Tente novamente.',
  )
}

export function requestRegistrationCode(payload: RegistrationRequest): Promise<void> {
  return post(API_PATHS.registrationRequest, payload)
}

export function confirmRegistration(payload: RegistrationConfirmation): Promise<void> {
  return post(API_PATHS.registrationConfirm, payload)
}

export function requestPasswordReset(payload: RegistrationRequest): Promise<void> {
  return post(API_PATHS.passwordResetRequest, payload)
}

export function verifyPasswordReset(payload: PasswordResetVerification): Promise<void> {
  return post(API_PATHS.passwordResetVerify, payload)
}

export function confirmPasswordReset(payload: PasswordResetConfirmation): Promise<void> {
  return post(API_PATHS.passwordResetConfirm, payload)
}
