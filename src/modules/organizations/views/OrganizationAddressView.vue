<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getErrorMessage } from '@/app/plugins/axios'
import { getOrganizationBySlug } from '../services'
import OrganizationLayout from '../components/organizationLayout.vue'

const route = useRoute()
const router = useRouter()
const error = ref('')
async function open() {
  error.value = ''
  try {
    const organization = await getOrganizationBySlug(String(route.params.slug))
    await router.replace({
      name: 'OrganizationMembers',
      params: { organizationId: organization.id },
    })
  } catch (cause) {
    error.value = getErrorMessage(cause, 'Não foi possível abrir este workspace.')
  }
}
watch(() => route.params.slug, open, { immediate: true })
</script>
<template>
  <OrganizationLayout title="Workspace"
    ><p v-if="!error" role="status">Abrindo workspace…</p>
    <div v-else role="alert" class="workspace-error">
      {{ error }} <button type="button" @click="open">Tentar novamente</button>
    </div></OrganizationLayout
  >
</template>
