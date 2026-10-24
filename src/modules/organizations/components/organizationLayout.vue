<script setup lang="ts">
import { watch } from 'vue'
import DefaultLayout from '@/app/layouts/DefaultLayout.vue'
import { TopbarComp } from '@/shared/components'
import { useOrganizationsStore } from '../stores'
import '../organizations.css'

const props = defineProps<{ title: string; organizationId?: string }>()
const organizations = useOrganizationsStore()

// abrir/trocar a organização aqui a torna a selecionada (chat, times...)
watch(
  () => props.organizationId,
  (id) => id && organizations.select(id),
  { immediate: true },
)
</script>

<template>
  <div class="workspace">
    <DefaultLayout>
      <TopbarComp :crumbs="[title]" />
      <div class="workspace-content">
        <nav
          v-if="organizationId"
          class="workspace-tabs organization-nav"
          aria-label="Administração da organização"
        >
          <RouterLink :to="{ name: 'OrganizationMembers', params: { organizationId } }"
            >Membros e convites</RouterLink
          >
          <RouterLink :to="{ name: 'OrganizationTeams', params: { organizationId } }"
            >Times</RouterLink
          >
          <RouterLink :to="{ name: 'OrganizationSectors', params: { organizationId } }"
            >Setores</RouterLink
          >
          <RouterLink :to="{ name: 'OrganizationSettings', params: { organizationId } }"
            >Configurações</RouterLink
          >
        </nav>
        <slot />
      </div>
    </DefaultLayout>
  </div>
</template>
