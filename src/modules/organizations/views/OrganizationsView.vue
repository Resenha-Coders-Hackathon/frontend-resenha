<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getErrorMessage } from '@/app/plugins/axios'
import OrganizationLayout from '../components/organizationLayout.vue'
import { useOrganizationsStore } from '../stores'
import { initials, roleLabels } from '../utils'

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
        <p>Entre em uma organização ou crie a sua.</p>
      </div>
      <RouterLink :to="{ name: 'OrganizationOnboarding' }" class="workspace-link-button"
        >Criar organização</RouterLink
      >
    </div>
    <p v-if="loading" role="status">Carregando organizações…</p>
    <div v-else-if="error" role="alert" class="workspace-error">
      {{ error }} <button type="button" @click="load">Tentar novamente</button>
    </div>
    <ul v-else class="organization-list">
      <li v-for="organization in store.organizations" :key="organization.id">
        <RouterLink
          class="organization-row"
          :to="{ name: 'OrganizationOverview', params: { organizationId: organization.id } }"
        >
          <span class="organization-avatar" aria-hidden="true">{{ initials(organization.name) }}</span>
          <span class="organization-row-text">
            <strong>{{ organization.name }}</strong>
            <span v-if="organization.description">{{ organization.description }}</span>
          </span>
          <span class="workspace-badge">{{
            organization.is_personal ? 'Pessoal' : roleLabels[organization.current_role]
          }}</span>
        </RouterLink>
      </li>
      <li v-if="!store.organizations.length">Você ainda não participa de uma organização.</li>
    </ul>
  </OrganizationLayout>
</template>
