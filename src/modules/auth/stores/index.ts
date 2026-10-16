import { ref } from 'vue'
import { defineStore } from 'pinia'
import { fetchMe, login, logout, type LoginRequest } from '../services'
import type { User } from '../types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)

  // Os cookies são HttpOnly: só o backend sabe se há sessão.
  async function loadUser(): Promise<User | null> {
    user.value = await fetchMe().catch(() => null)
    return user.value
  }

  async function signIn(payload: LoginRequest): Promise<void> {
    await login(payload)
    await loadUser()
  }

  async function signOut(): Promise<void> {
    await logout().catch(() => {}) // sessão já inválida: limpar o estado local basta
    user.value = null
  }

  return { user, loadUser, signIn, signOut }
})
