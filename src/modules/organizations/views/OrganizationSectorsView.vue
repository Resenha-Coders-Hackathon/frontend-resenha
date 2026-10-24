<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { BaseButton } from '@/shared/components'
import { useAuthStore } from '@/modules/auth'
import { getErrorMessage } from '@/app/plugins/axios'
import { listTeams, type Team } from '@/modules/teams'
import {
  listSectors,
  createSector,
  getSector,
  updateSector,
  deleteSector,
  listSectorMembers,
  addSectorMember,
  removeSectorMember,
  updateSectorMember,
  listSectorTeams,
  addSectorTeam,
  updateSectorTeam,
  removeSectorTeam,
  type Sector,
  type SectorMember,
  type SectorTeam,
  type SectorRole,
} from '@/modules/module'
import OrganizationLayout from '../components/organizationLayout.vue'
import { useOrganizationAdmin } from '../composables/useOrganizationAdmin'
import { fetchAllPages as collectPages } from '@/shared/utils'
import { listMembers } from '../services'
import type { OrganizationMember } from '../types'

const { id, organization, loading, saving, error, load, mutate } = useOrganizationAdmin()
const auth = useAuthStore()
const sectors = ref<Sector[]>([])
const teams = ref<Team[]>([])
const people = ref<OrganizationMember[]>([])
const members = ref<SectorMember[]>([])
const links = ref<SectorTeam[]>([])
const selected = ref<(Sector & { my_role: SectorRole }) | null>(null)
const search = ref('')
const name = ref('')
const description = ref('')
const isPrivate = ref(true)
const userId = ref('')
const teamId = ref('')
const personRole = ref<SectorRole>('editor')
const teamRole = ref<SectorRole>('editor')
const creating = ref(false)
const busy = ref(false)
let requestVersion = 0
const roles: Record<SectorRole, string> = { manager: 'Gestor', editor: 'Editor', viewer: 'Leitor' }
const canManage = computed(() => selected.value?.my_role === 'manager')
const canCreate = computed(() => organization.value && organization.value.current_role !== 'viewer')
const visibleSectors = computed(() =>
  sectors.value.filter((sector) =>
    sector.name.toLocaleLowerCase().includes(search.value.toLocaleLowerCase()),
  ),
)
const availablePeople = computed(() =>
  people.value.filter(
    (person) => !members.value.some((member) => member.user_id === person.user_id),
  ),
)
const availableTeams = computed(() =>
  teams.value.filter((team) => !links.value.some((link) => link.team_id === team.id)),
)

async function selectSector(sector: Sector) {
  const request = ++requestVersion
  busy.value = true
  error.value = ''
  selected.value = null
  creating.value = false
  members.value = []
  links.value = []
  userId.value = ''
  teamId.value = ''
  try {
    const [detail, participants, linkedTeams] = await Promise.all([
      getSector(sector.id),
      collectPages((page) => listSectorMembers(sector.id, page)),
      collectPages((page) => listSectorTeams(sector.id, page)),
    ])
    if (request !== requestVersion) return
    if (detail.organization_id !== id.value)
      throw new Error('Este setor pertence a outra organização.')
    selected.value = detail
    members.value = participants
    links.value = linkedTeams
    name.value = detail.name
    description.value = detail.description
    isPrivate.value = detail.is_private
  } catch (cause) {
    if (request === requestVersion)
      error.value = getErrorMessage(cause, 'Não foi possível abrir o setor.')
  } finally {
    if (request === requestVersion) busy.value = false
  }
}

async function refresh() {
  const request = ++requestVersion
  const organizationId = id.value
  busy.value = true
  try {
    const [sectorRows, teamRows, memberRows] = await Promise.all([
      collectPages((page) => listSectors(organizationId, page)),
      collectPages((page) => listTeams(organizationId, page)),
      collectPages((page) => listMembers(organizationId, page)),
    ])
    if (request !== requestVersion) return
    sectors.value = sectorRows
    teams.value = teamRows
    people.value = memberRows
    if (selected.value) {
      const updated = sectorRows.find((sector) => sector.id === selected.value?.id)
      if (updated) await selectSector(updated)
      else selected.value = null
    }
  } finally {
    if (request === requestVersion) busy.value = false
  }
}

function newSector() {
  requestVersion++
  busy.value = false
  selected.value = null
  creating.value = true
  name.value = ''
  description.value = ''
  isPrivate.value = true
}

async function saveSector() {
  const sectorId = selected.value?.id
  if (
    selected.value?.is_private &&
    !isPrivate.value &&
    !window.confirm('Todos os membros da organização poderão visualizar este setor. Continuar?')
  )
    return
  const payload = {
    name: name.value.trim(),
    description: description.value.trim(),
    is_private: isPrivate.value,
  }
  await mutate(
    () => (sectorId ? updateSector(sectorId, payload) : createSector(id.value, payload)),
    async () => {
      creating.value = false
      await refresh()
    },
  )
}

async function archiveSector() {
  const sector = selected.value
  if (
    !sector ||
    !window.confirm(
      `Desativar “${sector.name}”? O setor deixará de estar acessível. A restauração ainda não está disponível nesta interface.`,
    )
  )
    return
  await mutate(() => deleteSector(sector.id), refresh)
}

async function addPerson() {
  const sectorId = selected.value?.id
  if (!sectorId || !userId.value) return
  await mutate(
    () => addSectorMember(sectorId, { user_id: userId.value, role: personRole.value }),
    refresh,
  )
}

async function linkTeam() {
  const sectorId = selected.value?.id
  if (!sectorId || !teamId.value) return
  await mutate(() => addSectorTeam(sectorId, teamId.value, teamRole.value), refresh)
}

async function changeRole(row: SectorMember | SectorTeam, event: Event, isTeam: boolean) {
  const sectorId = selected.value?.id
  const value = (event.target as HTMLSelectElement).value
  if (!sectorId || (value !== 'manager' && value !== 'editor' && value !== 'viewer')) return
  await mutate(
    () =>
      isTeam
        ? updateSectorTeam(sectorId, row.id, value)
        : updateSectorMember(sectorId, row.id, value),
    refresh,
  )
  ;(event.target as HTMLSelectElement).value =
    (isTeam ? links.value : members.value).find((item) => item.id === row.id)?.role ?? row.role
}

async function removeAccess(row: SectorMember | SectorTeam, isTeam: boolean) {
  const sectorId = selected.value?.id
  if (
    !sectorId ||
    !window.confirm(
      'Remover este vínculo? O acesso por outros times, participação direta ou papel na organização será mantido.',
    )
  )
    return
  await mutate(
    () => (isTeam ? removeSectorTeam(sectorId, row.id) : removeSectorMember(sectorId, row.id)),
    refresh,
  )
}

async function initialize() {
  const requestId = id.value
  requestVersion++
  busy.value = false
  sectors.value = []
  teams.value = []
  people.value = []
  selected.value = null
  creating.value = false
  await load()
  if (!organization.value || requestId !== id.value) return
  try {
    await refresh()
  } catch (cause) {
    if (requestId === id.value)
      error.value = getErrorMessage(cause, 'Não foi possível carregar os setores.')
  }
}
watch(id, initialize, { immediate: true })
onBeforeUnmount(() => {
  requestVersion++
})
</script>

<template>
  <OrganizationLayout title="Setores" :organization-id="organization?.id">
    <div class="workspace-heading">
      <div>
        <h1>Setores</h1>
        <p>{{ organization?.name }} · Organize as áreas e os acessos da equipe.</p>
      </div>
      <BaseButton
        v-if="canCreate"
        label="Novo setor"
        :disabled="saving || busy"
        :full-width="false"
        @click="newSector"
      />
    </div>
    <p v-if="loading || busy" role="status">Carregando…</p>
    <div v-if="error" class="workspace-error" role="alert">
      {{ error }} <button :disabled="saving" @click="initialize">Tentar novamente</button>
    </div>
    <template v-if="organization">
      <label class="workspace-form">Buscar setor<input v-model="search" type="search" /></label>
      <div class="organization-grid">
        <button
          v-for="sector in visibleSectors"
          :key="sector.id"
          class="workspace-card organization-card"
          :disabled="saving || busy"
          :aria-pressed="selected?.id === sector.id"
          @click="selectSector(sector)"
        >
          <h2>{{ sector.name }}</h2>
          <p>{{ sector.description || 'Sem descrição' }}</p>
          <span class="workspace-badge">{{
            sector.is_private ? 'Privado' : 'Visível à organização'
          }}</span>
        </button>
      </div>
      <p v-if="!busy && !visibleSectors.length" class="workspace-empty">Nenhum setor encontrado.</p>
      <section v-if="creating || selected" class="workspace-card admin-stack">
        <h2>{{ creating ? 'Criar setor' : selected?.name }}</h2>
        <form v-if="creating || canManage" class="workspace-form" @submit.prevent="saveSector">
          <fieldset :disabled="saving || busy" class="admin-stack">
            <label>Nome<input v-model="name" required maxlength="255" /></label>
            <label>Descrição<textarea v-model="description" rows="3" /></label>
            <label
              >Visibilidade<select v-model="isPrivate">
                <option :value="true">Privado — somente participantes e administradores</option>
                <option :value="false">Organização — todos os membros podem visualizar</option>
              </select></label
            >
            <BaseButton type="submit" label="Salvar setor" :loading="saving" :full-width="false" />
          </fieldset>
        </form>
        <template v-if="selected">
          <p>
            Seu acesso: {{ roles[selected.my_role] }}. Vale o maior papel entre participação direta,
            times e organização. Proprietários e administradores são gestores de todos os setores.
          </p>
          <h2>Participantes diretos</h2>
          <div v-for="member in members" :key="member.id" class="admin-row">
            <div>
              <strong>{{ member.name || member.email }}</strong>
              <p>{{ member.email }}</p>
            </div>
            <div class="workspace-actions">
              <select
                v-if="canManage"
                :value="member.role"
                :aria-label="`Papel de ${member.name || member.email}`"
                :disabled="saving || busy"
                @change="changeRole(member, $event, false)"
              >
                <option v-for="(label, value) in roles" :key="value" :value="value">
                  {{ label }}
                </option>
              </select>
              <span v-else>{{ roles[member.role] }}</span>
              <button
                v-if="canManage || member.user_id === auth.user?.id"
                :disabled="saving || busy"
                @click="removeAccess(member, false)"
              >
                Remover vínculo
              </button>
            </div>
          </div>
          <p v-if="!members.length">
            Sem participantes diretos. Outros acessos podem vir dos times e da organização.
          </p>
          <form v-if="canManage" class="workspace-form" @submit.prevent="addPerson">
            <fieldset :disabled="saving || busy" class="admin-stack">
              <label
                >Pessoa<select v-model="userId" required>
                  <option disabled value="">Selecione uma pessoa</option>
                  <option
                    v-for="person in availablePeople"
                    :key="person.id"
                    :value="person.user_id"
                  >
                    {{ person.name || person.email }} · {{ person.email }}
                  </option>
                </select></label
              >
              <label
                >Papel no setor<select v-model="personRole">
                  <option v-for="(label, value) in roles" :key="value" :value="value">
                    {{ label }}
                  </option>
                </select></label
              >
              <BaseButton
                type="submit"
                label="Adicionar participante"
                :disabled="!userId"
                :full-width="false"
              />
            </fieldset>
          </form>
          <h2>Times vinculados</h2>
          <div v-for="link in links" :key="link.id" class="admin-row">
            <strong>{{ link.team_name }}</strong>
            <div class="workspace-actions">
              <select
                v-if="canManage"
                :value="link.role"
                :aria-label="`Papel do time ${link.team_name}`"
                :disabled="saving || busy"
                @change="changeRole(link, $event, true)"
              >
                <option v-for="(label, value) in roles" :key="value" :value="value">
                  {{ label }}
                </option>
              </select>
              <span v-else>{{ roles[link.role] }}</span>
              <button v-if="canManage" :disabled="saving || busy" @click="removeAccess(link, true)">
                Desvincular time
              </button>
            </div>
          </div>
          <p v-if="!links.length">Nenhum time vinculado.</p>
          <form v-if="canManage" class="workspace-form" @submit.prevent="linkTeam">
            <fieldset :disabled="saving || busy" class="admin-stack">
              <label
                >Time<select v-model="teamId" required>
                  <option disabled value="">Selecione um time</option>
                  <option v-for="team in availableTeams" :key="team.id" :value="team.id">
                    {{ team.name }}
                  </option>
                </select></label
              >
              <label
                >Papel herdado pelos integrantes<select v-model="teamRole">
                  <option v-for="(label, value) in roles" :key="value" :value="value">
                    {{ label }}
                  </option>
                </select></label
              >
              <BaseButton
                type="submit"
                label="Vincular time"
                :disabled="!teamId"
                :full-width="false"
              />
            </fieldset>
          </form>
          <BaseButton
            v-if="canManage"
            label="Desativar setor"
            variant="secondary"
            :disabled="saving || busy"
            :full-width="false"
            @click="archiveSector"
          />
        </template>
      </section>
    </template>
  </OrganizationLayout>
</template>
