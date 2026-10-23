import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { isAxiosError } from 'axios'
import {
  deactivateMe,
  fetchMe,
  listSessions,
  login,
  loginWithGoogle,
  logout,
  revokeAllSessions,
  revokeSession,
  updateMe,
} from '../services'
import type { LoginCredentials, UpdateUserRequest, User, UserSession } from '../types'

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
  const sessions = ref<UserSession[]>([])
  const isAuthenticated = computed(() => user.value !== null)

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
    try {
      await logout()
    } catch (error) {
      if (!isAxiosError(error) || error.response?.status !== 401) throw error
    }
    user.value = null
    sessions.value = []
  }

  async function updateProfile(payload: UpdateUserRequest): Promise<User> {
    user.value = await updateMe(payload)
    return user.value
  }

  async function loadSessions(): Promise<void> {
    sessions.value = await listSessions()
  }

  async function endSession(id: number): Promise<void> {
    await revokeSession(id)
    sessions.value = sessions.value.filter((s) => s.id !== id)
  }

  async function endAllSessions(): Promise<void> {
    await revokeAllSessions()
    user.value = null
    sessions.value = []
  }

  async function deactivateAccount(): Promise<void> {
    await deactivateMe()
    user.value = null
    sessions.value = []
  }

  return {
    user,
    sessions,
    isAuthenticated,
    loadUser,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
    loadSessions,
    endSession,
    endAllSessions,
    deactivateAccount,
  }
})
