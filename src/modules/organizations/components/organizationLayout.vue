<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ThemeSwitcher } from '@/shared/components'
import { useAuthStore } from '@/modules/auth'
import { useOrganizationsStore } from '../stores'
import '../organizations.css'

defineProps<{ title: string; organizationId?: string }>()
const route = useRoute()
const auth = useAuthStore()
const organizations = useOrganizationsStore()
</script>

<template>
  <div class="workspace">
    <aside class="workspace-sidebar">
      <RouterLink class="workspace-brand" to="/organizacoes">Inceptum<span>.</span></RouterLink>
      <label class="workspace-switcher" v-if="organizationId">
        Organização
        <select
          :value="organizationId"
          @change="
            $router.push({
              name: 'OrganizationMembers',
              params: { organizationId: ($event.target as HTMLSelectElement).value },
            })
          "
        >
          <option
            v-for="organization in organizations.organizations"
            :key="organization.id"
            :value="organization.id"
          >
            {{ organization.name }}
          </option>
        </select>
      </label>
      <nav aria-label="Organizações">
        <RouterLink to="/organizacoes" :class="{ active: route.name === 'Organizations' }"
          >Organizações</RouterLink
        >
        <RouterLink
          v-if="organizationId"
          :to="{ name: 'OrganizationMembers', params: { organizationId } }"
          class="active"
          ><img src="/figma/organization-users.svg" alt="" width="16" height="16" />Equipe e
          membros</RouterLink
        >
        <RouterLink to="/">Página inicial</RouterLink>
      </nav>
      <div class="workspace-account">
        <span>{{ auth.user?.name || auth.user?.email || 'Inceptum' }}</span
        ><ThemeSwitcher />
      </div>
    </aside>
    <div class="workspace-main">
      <header class="workspace-topbar">
        <span>Workspace <span aria-hidden="true">›</span> {{ title }}</span>
        <div class="mobile-organizations">
          <RouterLink to="/organizacoes">Organizações</RouterLink><ThemeSwitcher />
        </div>
      </header>
      <main class="workspace-content"><slot /></main>
    </div>
  </div>
</template>
