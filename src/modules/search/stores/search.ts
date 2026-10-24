import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { UUID } from '@/shared/types'
import { SEARCH_MIN_LENGTH, searchOrganization } from '../services'
import type { SearchResult } from '../types'

const EMPTY: SearchResult = { tasks: [], people: [], files: [] }

export const useSearchStore = defineStore('search', () => {
  const results = ref<SearchResult>({ ...EMPTY })
  const query = ref('')
  const isLoading = ref(false)
  const error = ref('')
  let request = 0 // only the latest request may write the results

  function clear(): void {
    request += 1
    results.value = { ...EMPTY }
    query.value = ''
    isLoading.value = false
    error.value = ''
  }

  /** Searches tasks, people and files; queries shorter than 2 characters just clear. */
  async function search(organizationId: UUID, q: string): Promise<void> {
    const text = q.trim()
    if (text.length < SEARCH_MIN_LENGTH) return clear()
    const current = ++request
    query.value = text
    isLoading.value = true
    error.value = ''
    try {
      const found = await searchOrganization(organizationId, text)
      if (current === request) results.value = found
    } catch (e) {
      if (current === request) error.value = e instanceof Error ? e.message : 'Erro na busca.'
    } finally {
      if (current === request) isLoading.value = false
    }
  }

  return { results, query, isLoading, error, search, clear }
})
