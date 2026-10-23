import { ref } from 'vue'
import { defineStore } from 'pinia'
import { listUsers } from '../services'
import type { User } from '../types'

// Diretório de usuários (para escolher pessoas em chat, convites, atribuições...).
export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>([])
  const hasMore = ref(false)
  const isLoading = ref(false)
  const error = ref('')
  let query = ''
  let page = 1
  let request = 0 // só a última busca pode escrever o resultado

  async function search(text = ''): Promise<void> {
    const current = ++request
    query = text.trim()
    page = 1
    isLoading.value = true
    error.value = ''
    try {
      const result = await listUsers({ search: query, page })
      if (current !== request) return
      users.value = result.results
      hasMore.value = !!result.next
    } catch (e) {
      if (current === request)
        error.value = e instanceof Error ? e.message : 'Erro ao buscar usuários.'
    } finally {
      if (current === request) isLoading.value = false
    }
  }

  async function loadMore(): Promise<void> {
    if (!hasMore.value || isLoading.value) return
    const current = ++request
    isLoading.value = true
    try {
      const result = await listUsers({ search: query, page: page + 1 })
      if (current !== request) return
      users.value = [...users.value, ...result.results]
      hasMore.value = !!result.next
      page += 1
    } catch (e) {
      if (current === request)
        error.value = e instanceof Error ? e.message : 'Erro ao buscar usuários.'
    } finally {
      if (current === request) isLoading.value = false
    }
  }

  return { users, hasMore, isLoading, error, search, loadMore }
})
