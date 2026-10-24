import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { toast } from 'vue-sonner'
import { getErrorMessage } from '@/app/plugins/axios'
import { getOrganization } from '../services'
import { useOrganizationsStore } from '../stores'
import type { Organization } from '../types'

export function useOrganizationAdmin() {
  const route = useRoute()
  const id = computed(() => String(route.params.organizationId))
  const organization = ref<Organization | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref('')
  const store = useOrganizationsStore()
  let version = 0
  const canAdmin = computed(() =>
    ['owner', 'admin'].includes(organization.value?.current_role ?? ''),
  )

  watch(id, () => {
    version++
    organization.value = null
    error.value = ''
  })
  onBeforeUnmount(() => {
    version++
  })

  async function load() {
    const request = ++version
    loading.value = true
    error.value = ''
    try {
      const [result] = await Promise.all([getOrganization(id.value), store.load()])
      if (request === version) organization.value = result
    } catch (cause) {
      if (request === version)
        error.value = getErrorMessage(cause, 'Não foi possível carregar a organização.')
    } finally {
      if (request === version) loading.value = false
    }
  }

  async function mutate(action: () => Promise<unknown>, refresh: () => Promise<void>) {
    if (saving.value) return
    const request = version
    saving.value = true
    error.value = ''
    try {
      await action()
      if (request !== version) return
      toast.success('Alteração salva.')
      await refresh()
    } catch (cause) {
      if (request === version)
        error.value = getErrorMessage(cause, 'Não foi possível salvar a alteração.')
    } finally {
      saving.value = false
    }
  }

  return { id, organization, loading, saving, error, canAdmin, load, mutate }
}
