<script setup lang="ts">
import { SidebarComp, FooterComp, ThemeSwitcher } from '@/shared/components'
import { useOrganizationsStore } from '../stores'
import '../organizations.css'
import { NotificationLink } from '@/modules/notifications'

defineProps<{ title: string; organizationId?: string }>()
const organizations = useOrganizationsStore()
</script>

<template>
  <div class="workspace">
    <main class="flex min-h-dvh">
      <SidebarComp />
      <section class="workspace-main">
        <header class="workspace-topbar">
          <RouterLink to="/organizacoes" class="auth-link">Organizações</RouterLink>
          <label v-if="organizationId" class="workspace-switcher">
            <span class="sr-only">Organização</span>
            <select
              aria-label="Organização"
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
          <span class="sr-only">{{ title }}</span>
          <NotificationLink />
          <ThemeSwitcher />
        </header>
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
      </section>
    </main>
    <FooterComp />
  </div>
</template>
