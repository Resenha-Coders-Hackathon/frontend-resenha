import { isAxiosError } from 'axios'
import { api, getErrorMessage } from '@/app/plugins/axios'
import type { DetailResponse, Page } from '@/shared/types'
import type {
  GoogleLoginRequest,
  LoginCredentials,
  PasswordResetConfirmation,
  PasswordResetVerification,
  RegistrationConfirmation,
  RegistrationRequest,
  UpdateUserRequest,
  UpdatedUserProfile,
  User,
  UserSession,
} from '../types'

const API_PATHS = {
  login: '/login/',
  googleLogin: '/login/google/',
  logout: '/me/logout/',
  me: '/users/me/',
  updateMe: '/users/me/update/',
  deactivateMe: '/me/deactivate/',
  revokeSessions: '/me/revoke-sessions/',
  sessions: '/sessions/',
  registrationRequest: '/registration/request/',
  registrationConfirm: '/registration/confirm/',
  passwordResetRequest: '/password-reset/request/',
  passwordResetVerify: '/password-reset/verify/',
  passwordResetConfirm: '/password-reset/confirm/',
} as const

const DEFAULT_ERROR = 'Não foi possível concluir sua solicitação. Tente novamente.'
const BAD_CREDENTIALS = 'E-mail ou senha incorretos.'

// O backend grava os tokens em cookies HttpOnly; o corpo das respostas não é usado.
async function post(
  path: string,
  payload: Record<string, unknown> | object,
  unauthorizedMessage = BAD_CREDENTIALS,
) {
  try {
    if (path === API_PATHS.login || path === API_PATHS.googleLogin) {
      await api.get('/csrf/')
    }
    await api.post(path, payload)
  } catch (error) {
    const status = isAxiosError(error) ? error.response?.status : undefined
    if (status === 401 || status === 403) throw new Error(unauthorizedMessage)
    if (status === 409) throw new Error('Este e-mail já está cadastrado.')
    throw new Error(translateApiMessage(getErrorMessage(error, DEFAULT_ERROR)))
  }
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

export const login = (credentials: LoginCredentials) => post(API_PATHS.login, credentials)

export const loginWithGoogle = (credential: GoogleLoginRequest['credential']) =>
  post(
    API_PATHS.googleLogin,
    { credential } satisfies GoogleLoginRequest,
    'Não foi possível validar sua conta Google. Tente novamente.',
  )

export async function fetchMe(): Promise<User> {
  return (await api.get<User>(API_PATHS.me)).data
}

export async function logout(): Promise<void> {
  await api.post(API_PATHS.logout)
}

export const requestRegistrationCode = (payload: RegistrationRequest) =>
  post(API_PATHS.registrationRequest, payload)

export const confirmRegistration = (payload: RegistrationConfirmation) =>
  post(API_PATHS.registrationConfirm, payload)

export const requestPasswordReset = (payload: RegistrationRequest) =>
  post(API_PATHS.passwordResetRequest, payload)

export const verifyPasswordReset = (payload: PasswordResetVerification) =>
  post(API_PATHS.passwordResetVerify, payload)

export const confirmPasswordReset = (payload: PasswordResetConfirmation) =>
  post(API_PATHS.passwordResetConfirm, payload)

export async function updateMe(payload: UpdateUserRequest): Promise<UpdatedUserProfile> {
  return (await api.patch<UpdatedUserProfile>(API_PATHS.updateMe, payload)).data
}

export async function listSessions(): Promise<UserSession[]> {
  return (await api.get<UserSession[]>(API_PATHS.sessions)).data
}

export async function revokeSession(id: number): Promise<void> {
  await api.delete(`${API_PATHS.sessions}${id}/`)
}

export async function revokeAllSessions(): Promise<DetailResponse> {
  return (await api.post<DetailResponse>(API_PATHS.revokeSessions)).data
}

export async function deactivateMe(): Promise<DetailResponse> {
  return (await api.post<DetailResponse>(API_PATHS.deactivateMe)).data
}

export interface ListUsersParams {
  search?: string
  page?: number
}

/** Paginated user directory (name/e-mail search). */
export async function listUsers({ search, page = 1 }: ListUsersParams = {}): Promise<Page<User>> {
  const params = { page, ...(search && { search }) }
  return (await api.get<Page<User>>('/users/list/', { params })).data
}

export async function getUser(id: string): Promise<User> {
  return (await api.get<User>(`/users/${encodeURIComponent(id)}/`)).data
}
