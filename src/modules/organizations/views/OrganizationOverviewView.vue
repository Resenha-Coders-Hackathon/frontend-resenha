<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getErrorMessage } from '@/app/plugins/axios'
import type { Page } from '@/shared/types'
import OrganizationLayout from '../components/organizationLayout.vue'
import { getOrganization, listMembers, listOrganizationSectors } from '../services'
import { useOrganizationsStore } from '../stores'
import type { Organization, OrganizationMember, OrganizationSector } from '../types'
import { initials, roleLabels } from '../utils'

const route = useRoute()
const store = useOrganizationsStore()
const id = computed(() => String(route.params.organizationId))
const organization = ref<Organization | null>(null)
const sectors = ref<Page<OrganizationSector> | null>(null)
const members = ref<Page<OrganizationMember> | null>(null)
const loading = ref(true)
const error = ref('')
const canManage = computed(() => ['owner', 'admin'].includes(organization.value?.current_role ?? ''))

async function load() {
  const requested = id.value
  loading.value = true
  error.value = ''
  organization.value = null
  try {
    const [org, sectorPage, memberPage] = await Promise.all([
      getOrganization(requested),
      listOrganizationSectors(requested),
      listMembers(requested),
      store.organizations.length ? undefined : store.load(),
    ])
    if (requested !== id.value) return
    organization.value = org
    sectors.value = sectorPage
    members.value = memberPage
  } catch (cause) {
    if (requested === id.value)
      error.value = getErrorMessage(cause, 'Não foi possível abrir esta organização.')
  } finally {
    if (requested === id.value) loading.value = false
  }
}
watch(id, load, { immediate: true })
</script>

<template>
  <OrganizationLayout title="Visão geral da organização" :organization-id="id">
    <p v-if="loading" role="status">Carregando organização…</p>
    <div v-else-if="error" role="alert" class="workspace-error">
      {{ error }} <button type="button" @click="load">Tentar novamente</button>
    </div>
    <template v-else-if="organization">
      <div class="organization-profile">
        <span class="organization-avatar large" aria-hidden="true">{{
          initials(organization.name)
        }}</span>
        <div>
          <h2>{{ organization.name }}</h2>
          <p>
            {{ organization.description || 'Sem descrição.' }}
            <span class="workspace-badge">{{
              organization.is_personal ? 'Espaço pessoal' : roleLabels[organization.current_role]
            }}</span>
          </p>
        </div>
      </div>

      <div class="organization-overview">
        <section aria-labelledby="sectors-title">
          <div class="workspace-heading">
            <h2 id="sectors-title">Setores</h2>
            <RouterLink
              v-if="canManage"
              class="workspace-link-button"
              :to="{ name: 'OrganizationOnboardingSectors', params: { organizationId: id } }"
              >Novo setor</RouterLink
            >
          </div>
          <ul v-if="sectors?.results.length" class="organization-list">
            <li v-for="sector in sectors.results" :key="sector.id">
              <RouterLink class="organization-row" :to="`/setores/${sector.id}/editar`">
                <span class="organization-row-text"
                  ><strong>{{ sector.name }}</strong></span
                >
                <span v-if="sector.is_private" class="workspace-badge">Privado</span>
              </RouterLink>
            </li>
          </ul>
          <p v-else>
            Nenhum setor ainda.{{ canManage ? ' Crie o primeiro para organizar o trabalho.' : '' }}
          </p>
        </section>

        <aside aria-labelledby="people-title">
          <div class="workspace-heading">
            <h2 id="people-title">Pessoas ({{ members?.count ?? 0 }})</h2>
            <RouterLink :to="{ name: 'OrganizationMembers', params: { organizationId: id } }"
              >Ver todas</RouterLink
            >
          </div>
          <ul class="organization-people">
            <li v-for="member in members?.results.slice(0, 12)" :key="member.id">
              <span class="organization-avatar" :title="`${member.name} · ${roleLabels[member.role]}`"
                >{{ initials(member.name) }}<span class="sr-only">{{ member.name }}</span></span
              >
            </li>
          </ul>
          <RouterLink
            v-if="canManage"
            class="workspace-link-button"
            :to="{ name: 'OrganizationMembers', params: { organizationId: id } }"
            >Convidar pessoas</RouterLink
          >
        </aside>
      </div>
    </template>
  </OrganizationLayout>
</template>
