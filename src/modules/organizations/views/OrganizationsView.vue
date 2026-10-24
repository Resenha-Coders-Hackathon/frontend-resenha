<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getErrorMessage } from '@/app/plugins/axios'
import OrganizationLayout from '../components/organizationLayout.vue'
import { useOrganizationsStore } from '../stores'
import { roleLabels } from '../utils'

const store = useOrganizationsStore()
const loading = ref(true)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    await store.load()
  } catch (cause) {
    error.value = getErrorMessage(cause, 'Não foi possível carregar suas organizações.')
  } finally {
    loading.value = false
  }
}
onMounted(load)
</script>

<template>
  <OrganizationLayout title="Organizações">
    <div class="workspace-heading">
      <div>
        <h1>Suas organizações</h1>
        <p>Escolha seu espaço de trabalho ou crie uma organização.</p>
      </div>
      <RouterLink :to="{ name: 'OrganizationOnboarding' }" class="workspace-link-button"
        >Criar organização</RouterLink
      >
    </div>
    <p v-if="loading" role="status">Carregando organizações…</p>
    <div v-else-if="error" role="alert" class="workspace-error">
      {{ error }} <button type="button" @click="load">Tentar novamente</button>
    </div>
    <div v-else class="organization-grid">
      <RouterLink
        v-for="organization in store.organizations"
        :key="organization.id"
        class="workspace-card organization-card"
        :to="{ name: 'OrganizationMembers', params: { organizationId: organization.id } }"
      >
        <span class="workspace-eyebrow">{{
          organization.is_personal ? 'Espaço pessoal' : 'Organização'
        }}</span>
        <h2>{{ organization.name }}</h2>
        <p v-if="organization.description">{{ organization.description }}</p>
        <span class="workspace-badge">{{ roleLabels[organization.current_role] }}</span>
      </RouterLink>
      <p v-if="!store.organizations.length">Você ainda não participa de uma organização.</p>
    </div>
  </OrganizationLayout>
</template>
