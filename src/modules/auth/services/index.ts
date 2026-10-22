import { api, getErrorMessage } from '@/app/plugins/axios'
import type { User } from '../types'

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
  logout: '/me/logout/',
  me: '/users/me/',
  registrationRequest: '/registration/request/',
  registrationConfirm: '/registration/confirm/',
  passwordResetRequest: '/password-reset/request/',
  passwordResetVerify: '/password-reset/verify/',
  passwordResetConfirm: '/password-reset/confirm/',
} as const

const DEFAULT_ERROR = 'Não foi possível concluir sua solicitação. Tente novamente.'
const BAD_CREDENTIALS = 'E-mail ou senha incorretos.'

// O backend grava os tokens em cookies HttpOnly; o corpo das respostas não é usado.
async function post(path: string, payload: object, unauthorizedMessage = BAD_CREDENTIALS) {
  try {
    await api.post(path, payload)
  } catch (error) {
    const status = (error as { response?: { status?: number } }).response?.status
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

export const loginWithGoogle = (credential: string) =>
  post(
    API_PATHS.googleLogin,
    { credential },
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
