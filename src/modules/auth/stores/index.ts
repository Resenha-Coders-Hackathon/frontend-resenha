import { ref } from 'vue'
import { defineStore } from 'pinia'
import { isAxiosError } from 'axios'
import { fetchMe, login, loginWithGoogle, logout, type LoginCredentials } from '../services'
import type { User } from '../types'
import { useNotificationsStore } from '@/modules/notifications'

// Dados em memória entre as etapas de registro e de redefinição de senha.
// Nada é persistido: ao recarregar a página o fluxo recomeça.
export const useAuthFlowStore = defineStore('authFlow', () => {
  const email = ref('')
  const name = ref('')
  const password = ref('')
  const resetCode = ref('')

  function startRegistration(data: { email: string; name: string; password: string }) {
    email.value = data.email
    name.value = data.name
    password.value = data.password
    resetCode.value = ''
  }

  function startPasswordReset(value: string) {
    email.value = value
    name.value = ''
    password.value = ''
    resetCode.value = ''
  }

  function clear() {
    email.value = ''
    name.value = ''
    password.value = ''
    resetCode.value = ''
  }

  return { email, name, password, resetCode, startRegistration, startPasswordReset, clear }
})

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)

  // Os cookies são HttpOnly: só o backend sabe se há sessão.
  async function loadUser(): Promise<User | null> {
    try {
      user.value = await fetchMe()
    } catch (error) {
      if (!isAxiosError(error) || error.response?.status !== 401) throw error
      user.value = null
    }
    return user.value
  }

  async function signIn(credentials: LoginCredentials): Promise<void> {
    await login(credentials)
    if (!(await loadUser())) throw new Error('Sua sessão expirou. Entre novamente.')
  }

  async function signInWithGoogle(credential: string): Promise<void> {
    await loginWithGoogle(credential)
    if (!(await loadUser())) throw new Error('Sua sessão expirou. Entre novamente.')
  }

  async function signOut(): Promise<void> {
    await useNotificationsStore().disablePush()
    try {
      await logout()
    } catch (error) {
      if (!isAxiosError(error) || error.response?.status !== 401) throw error
    }
    user.value = null
  }

  return { user, loadUser, signIn, signInWithGoogle, signOut }
})
