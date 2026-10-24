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
  const sessions = ref<UserSession[]>([])
  const isSigningOut = ref(false)
  const signOutStartedAt = ref(0)
  const isAuthenticated = computed(() => user.value !== null)

  function finishSignOut(): void {
    isSigningOut.value = false
    signOutStartedAt.value = 0
  }

  function clearSession(): void {
    user.value = null
    sessions.value = []
  }

  // Os cookies são HttpOnly: só o backend sabe se há sessão.
  async function loadUser(): Promise<User | null> {
    try {
      user.value = await fetchMe()
    } catch (error) {
      if (!isAxiosError(error) || error.response?.status !== 401) throw error
      clearSession()
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
    if (isSigningOut.value) return

    isSigningOut.value = true
    signOutStartedAt.value = Date.now()

    try {
      await useNotificationsStore().disablePush()
      try {
        await logout()
      } catch (error) {
        if (!isAxiosError(error) || error.response?.status !== 401) throw error
      }
      clearSession()
    } catch (error) {
      finishSignOut()
      throw error
    }
  }

  async function updateProfile(payload: UpdateUserRequest): Promise<User> {
    if (!user.value) throw new Error('Sua sessão expirou. Entre novamente.')
    const updated = await updateMe(payload)
    // PATCH returns only the writable fields, not the full user profile.
    if (!user.value) throw new Error('Sua sessão expirou. Entre novamente.')
    user.value = { ...user.value, ...updated }
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
    await useNotificationsStore().disablePush()
    await revokeAllSessions()
    clearSession()
  }

  async function deactivateAccount(): Promise<void> {
    await useNotificationsStore().disablePush()
    await deactivateMe()
    clearSession()
  }

  return {
    user,
    sessions,
    isSigningOut,
    signOutStartedAt,
    finishSignOut,
    isAuthenticated,
    clearSession,
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
