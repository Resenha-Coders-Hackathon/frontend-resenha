import { ref } from 'vue'
import { defineStore } from 'pinia'
import { listOrganizations } from '../services'
import type { Organization } from '../types'

export const useOrganizationsStore = defineStore('organizations', () => {
  const organizations = ref<Organization[]>([])
  async function load(): Promise<void> {
    organizations.value = []
    const items: Organization[] = []
    let page = 1
    while (true) {
      const response = await listOrganizations(page++)
      items.push(...response.results)
      if (!response.next) break
    }
    organizations.value = items
  }
  return { organizations, load }
})
