import { ref } from 'vue'
import { defineStore } from 'pinia'
import { fetchMe, login, loginWithGoogle, logout, type LoginCredentials } from '../services'
import type { User } from '../types'

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
    user.value = await fetchMe().catch(() => null)
    return user.value
  }

  async function signIn(credentials: LoginCredentials): Promise<void> {
    await login(credentials)
    await loadUser()
  }

  async function signInWithGoogle(credential: string): Promise<void> {
    await loginWithGoogle(credential)
    await loadUser()
  }

  async function signOut(): Promise<void> {
    await logout().catch(() => {}) // sessão já inválida: limpar o estado local basta
    user.value = null
  }

  return { user, loadUser, signIn, signInWithGoogle, signOut }
})
