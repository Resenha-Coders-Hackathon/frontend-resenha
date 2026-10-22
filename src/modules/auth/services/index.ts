import axios from 'axios'
import { api, getErrorMessage } from '@/app/plugins/axios'
import type { User } from '../types'

export interface LoginRequest {
  email: string
  password: string
}

// O backend grava access_token/refresh_token/csrftoken em cookies; o corpo da resposta não é usado.
export async function login(payload: LoginRequest): Promise<void> {
  try {
    await api.post('/login/', payload)
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Não foi possível entrar.'))
  }
}

export async function fetchMe(): Promise<User> {
  return (await api.get<User>('/users/me/')).data
}

export async function logout(): Promise<void> {
  await api.post('/me/logout/')
}

export async function loginWithGoogle(credential: string): Promise<void> {
  try {
    await api.post('/login/google/', { credential })
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new Error('Token recebido do Google, mas o backend ainda não disponibiliza /api/login/google/.')
    }
    throw new Error(getErrorMessage(error, 'Não foi possível entrar com Google.'))
  }
}
