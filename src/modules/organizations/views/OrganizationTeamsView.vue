<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useAuthStore } from '@/modules/auth'
import { BaseButton } from '@/shared/components'
import { getErrorMessage } from '@/app/plugins/axios'
import {
  listTeams,
  createTeam,
  updateTeam,
  deleteTeam,
  listTeamMembers,
  addTeamMember,
  updateTeamMemberRole,
  removeTeamMember,
  type Team,
  type TeamMember,
  type TeamRole,
} from '@/modules/teams'
import OrganizationLayout from '../components/organizationLayout.vue'
import { useOrganizationAdmin } from '../composables/useOrganizationAdmin'
import { fetchAllPages as collectPages } from '@/shared/utils'
import { listMembers } from '../services'
import type { OrganizationMember } from '../types'

const { id, organization, loading, saving, error, canAdmin, load, mutate } = useOrganizationAdmin()
const auth = useAuthStore()
const teams = ref<Team[]>([])
const people = ref<OrganizationMember[]>([])
const members = ref<TeamMember[]>([])
const selected = ref<Team | null>(null)
const search = ref('')
const name = ref('')
const description = ref('')
const userId = ref('')
const role = ref<TeamRole>('member')
const creating = ref(false)
const busy = ref(false)
let requestVersion = 0
const visibleTeams = computed(() =>
  teams.value.filter((team) =>
    team.name.toLocaleLowerCase().includes(search.value.toLocaleLowerCase()),
  ),
)
const canManage = computed(
  () =>
    canAdmin.value ||
    members.value.some((member) => member.user_id === auth.user?.id && member.role === 'lead'),
)
const availablePeople = computed(() =>
  people.value.filter(
    (person) => !members.value.some((member) => member.user_id === person.user_id),
  ),
)

async function refresh() {
  const request = ++requestVersion
  const organizationId = id.value
  busy.value = true
  try {
    const [teamRows, memberRows] = await Promise.all([
      collectPages((page) => listTeams(organizationId, page)),
      collectPages((page) => listMembers(organizationId, page)),
    ])
    if (request !== requestVersion) return
    teams.value = teamRows
    people.value = memberRows
    if (selected.value) {
      const updated = teamRows.find((team) => team.id === selected.value?.id)
      if (updated) await selectTeam(updated)
      else selected.value = null
    }
  } finally {
    if (request === requestVersion) busy.value = false
  }
}

async function selectTeam(team: Team) {
  const request = ++requestVersion
  const organizationId = id.value
  busy.value = true
  error.value = ''
  selected.value = null
  creating.value = false
  members.value = []
  userId.value = ''
  try {
    const rows = await collectPages((page) => listTeamMembers(organizationId, team.id, page))
    if (request !== requestVersion) return
    members.value = rows
    selected.value = team
    name.value = team.name
    description.value = team.description
  } catch (cause) {
    if (request === requestVersion)
      error.value = getErrorMessage(cause, 'Não foi possível abrir o time.')
  } finally {
    if (request === requestVersion) busy.value = false
  }
}

function newTeam() {
  requestVersion++
  busy.value = false
  selected.value = null
  members.value = []
  creating.value = true
  name.value = ''
  description.value = ''
}

async function saveTeam() {
  const organizationId = id.value
  const teamId = selected.value?.id
  const payload = { name: name.value.trim(), description: description.value.trim() }
  await mutate(
    () =>
      teamId ? updateTeam(organizationId, teamId, payload) : createTeam(organizationId, payload),
    async () => {
      creating.value = false
      await refresh()
    },
  )
}

async function removeTeam() {
  const team = selected.value
  if (
    !team ||
    !window.confirm(
      `Excluir definitivamente o time “${team.name}”? Os vínculos com setores serão removidos.`,
    )
  )
    return
  await mutate(() => deleteTeam(id.value, team.id), refresh)
}

async function addPerson() {
  if (!selected.value || !userId.value) return
  const teamId = selected.value.id
  await mutate(
    () => addTeamMember(id.value, teamId, { user_id: userId.value, role: role.value }),
    refresh,
  )
}

async function changeRole(member: TeamMember, event: Event) {
  const value = (event.target as HTMLSelectElement).value
  if (!selected.value || (value !== 'lead' && value !== 'member')) return
  const teamId = selected.value.id
  await mutate(() => updateTeamMemberRole(id.value, teamId, member.id, { role: value }), refresh)
  ;(event.target as HTMLSelectElement).value =
    members.value.find((row) => row.id === member.id)?.role ?? member.role
}

async function removePerson(member: TeamMember) {
  if (
    !selected.value ||
    !window.confirm(
      `Remover ${member.name || member.email} do time? O acesso herdado aos setores poderá ser perdido.`,
    )
  )
    return
  const teamId = selected.value.id
  await mutate(() => removeTeamMember(id.value, teamId, member.id), refresh)
}

async function initialize() {
  const requestId = id.value
  requestVersion++
  busy.value = false
  teams.value = []
  people.value = []
  members.value = []
  selected.value = null
  creating.value = false
  await load()
  if (!organization.value || requestId !== id.value) return
  try {
    await refresh()
  } catch (cause) {
    if (requestId === id.value)
      error.value = getErrorMessage(cause, 'Não foi possível carregar os times.')
  }
}
watch(id, initialize, { immediate: true })
onBeforeUnmount(() => {
  requestVersion++
})
</script>

<template>
  <OrganizationLayout title="Times" :organization-id="organization?.id">
    <div class="workspace-heading">
      <div>
        <h1>Times</h1>
        <p>{{ organization?.name }} · Agrupe pessoas e compartilhe o acesso aos setores.</p>
      </div>
      <BaseButton
        v-if="canAdmin"
        label="Novo time"
        :full-width="false"
        :disabled="saving || busy"
        @click="newTeam"
      />
    </div>
    <p v-if="loading || busy" role="status">Carregando…</p>
    <div v-if="error" class="workspace-error" role="alert">
      {{ error }} <button :disabled="saving" @click="initialize">Tentar novamente</button>
    </div>
    <template v-if="organization">
      <label class="workspace-form">Buscar time<input v-model="search" type="search" /></label>
      <div class="organization-grid">
        <button
          v-for="team in visibleTeams"
          :key="team.id"
          class="workspace-card organization-card"
          :disabled="saving || busy"
          :aria-pressed="selected?.id === team.id"
          @click="selectTeam(team)"
        >
          <h2>{{ team.name }}</h2>
          <p>{{ team.description || 'Sem descrição' }}</p>
          <span>Gerenciar integrantes</span>
        </button>
      </div>
      <p v-if="!busy && !visibleTeams.length" class="workspace-empty">Nenhum time encontrado.</p>
      <section v-if="creating || selected" class="workspace-card admin-stack">
        <h2>{{ creating ? 'Criar time' : selected?.name }}</h2>
        <form v-if="creating || canManage" class="workspace-form" @submit.prevent="saveTeam">
          <fieldset :disabled="saving || busy" class="admin-stack">
            <label>Nome<input v-model="name" required maxlength="255" /></label>
            <label>Descrição<textarea v-model="description" rows="3" /></label>
            <BaseButton type="submit" label="Salvar time" :loading="saving" :full-width="false" />
          </fieldset>
        </form>
        <template v-if="selected">
          <h2>Integrantes · {{ members.length }}</h2>
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
                @change="changeRole(member, $event)"
              >
                <option value="lead">Líder</option>
                <option value="member">Membro</option>
              </select>
              <span v-else class="workspace-badge">{{
                member.role === 'lead' ? 'Líder' : 'Membro'
              }}</span>
              <button
                v-if="canManage || member.user_id === auth.user?.id"
                :disabled="saving || busy"
                @click="removePerson(member)"
              >
                {{ member.user_id === auth.user?.id ? 'Sair do time' : 'Remover' }}
              </button>
            </div>
          </div>
          <p v-if="!members.length">Este time ainda não tem integrantes.</p>
          <form v-if="canManage" class="workspace-form" @submit.prevent="addPerson">
            <fieldset :disabled="saving || busy" class="admin-stack">
              <label
                >Pessoa da organização<select v-model="userId" required>
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
                >Papel<select v-model="role">
                  <option value="member">Membro</option>
                  <option value="lead">Líder</option>
                </select></label
              >
              <BaseButton
                type="submit"
                label="Adicionar ao time"
                :disabled="!userId"
                :full-width="false"
              />
            </fieldset>
          </form>
          <p>
            Os vínculos e papéis nos setores são gerenciados na aba Setores. Ser líder do time não
            concede automaticamente gestão de um setor.
          </p>
          <BaseButton
            v-if="canAdmin"
            label="Excluir time"
            variant="secondary"
            :disabled="saving || busy"
            :full-width="false"
            @click="removeTeam"
          />
        </template>
      </section>
    </template>
  </OrganizationLayout>
</template>
