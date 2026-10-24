<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { toast } from 'vue-sonner'
import { getErrorMessage } from '@/app/plugins/axios'
import { useAuthStore } from '@/modules/auth'
import {
  createInvitation,
  listInvitations,
  revokeInvitation,
  type Invitation,
  type InviteRole,
} from '@/modules/invitations'
import { BaseButton } from '@/shared/components'
import type { Page } from '@/shared/types'
import OrganizationLayout from '../components/organizationLayout.vue'
import MemberActions from '../components/memberActions.vue'
import { getOrganization, listMembers } from '../services'
import { useOrganizationsStore } from '../stores'
import type { Organization, OrganizationMember } from '../types'
import { initials, roleLabels } from '../utils'

const route = useRoute()
const auth = useAuthStore()
const store = useOrganizationsStore()
const organization = ref<Organization | null>(null)
const members = ref<Page<OrganizationMember> | null>(null)
const invitations = ref<Page<Invitation> | null>(null)
const tab = ref<'members' | 'invitations'>('members')
const page = ref(1)
const loading = ref(true)
const error = ref('')
const formError = ref('')
const saving = ref(false)
const revoking = ref('')
const email = ref('')
const role = ref<InviteRole>('member')
const dialog = ref<HTMLDialogElement | null>(null)
const canInvite = computed(() =>
  ['owner', 'admin'].includes(organization.value?.current_role ?? ''),
)
const id = computed(() => String(route.params.organizationId))
const currentPage = computed(() => (tab.value === 'members' ? members.value : invitations.value))

async function loadRows() {
  const requestedId = id.value
  const requestedTab = tab.value
  const requestedPage = page.value
  loading.value = true
  error.value = ''
  try {
    if (requestedTab === 'members') {
      const result = await listMembers(requestedId, requestedPage)
      if (requestedId === id.value && requestedTab === tab.value && requestedPage === page.value)
        members.value = result
    } else if (canInvite.value) {
      const result = await listInvitations(requestedId, requestedPage)
      if (requestedId === id.value && requestedTab === tab.value && requestedPage === page.value)
        invitations.value = result
    }
  } catch (cause) {
    if (requestedId === id.value && requestedTab === tab.value && requestedPage === page.value)
      error.value = getErrorMessage(
        cause,
        'Não foi possível carregar os integrantes. Tente novamente.',
      )
  } finally {
    if (requestedId === id.value && requestedTab === tab.value && requestedPage === page.value)
      loading.value = false
  }
}
async function load() {
  const requestedId = id.value
  dialog.value?.close()
  organization.value = null
  members.value = null
  invitations.value = null
  tab.value = 'members'
  page.value = 1
  loading.value = true
  error.value = ''
  try {
    const [result] = await Promise.all([getOrganization(requestedId), store.load()])
    if (requestedId !== id.value) return
    organization.value = result
    await loadRows()
  } catch (cause) {
    if (requestedId !== id.value) return
    error.value = getErrorMessage(
      cause,
      'Não foi possível abrir esta organização. Confira sua conexão e seu acesso.',
    )
    loading.value = false
  }
}
function changeTab(value: 'members' | 'invitations') {
  tab.value = value
  page.value = 1
  void loadRows()
}
function changePage(offset: number) {
  page.value += offset
  void loadRows()
}
function reloadMembers() {
  page.value = 1
  void loadRows()
}
function openInvite() {
  email.value = ''
  role.value = 'member'
  formError.value = ''
  dialog.value?.showModal()
}
async function invite() {
  if (saving.value || !canInvite.value) return
  const requestedId = id.value
  saving.value = true
  formError.value = ''
  try {
    await createInvitation(requestedId, { email: email.value.trim(), role: role.value })
    toast.success('Convite enviado por e-mail.')
    if (requestedId !== id.value) return
    dialog.value?.close()
    changeTab('invitations')
  } catch (cause) {
    formError.value = getErrorMessage(cause, 'Não foi possível enviar o convite.')
  } finally {
    saving.value = false
  }
}
async function revoke(invitation: Invitation) {
  if (revoking.value) return
  revoking.value = invitation.id
  const requestedId = id.value
  try {
    await revokeInvitation(requestedId, invitation.id)
    toast.success('Convite revogado.')
    if (requestedId === id.value) await loadRows()
  } catch (cause) {
    toast.error(getErrorMessage(cause, 'Não foi possível revogar o convite.'))
  } finally {
    revoking.value = ''
  }
}
function inviteStatus(invitation: Invitation) {
  if (invitation.status === 'pending' && Date.parse(invitation.expires_at) <= Date.now())
    return 'Expirado'
  return { pending: 'Pendente', accepted: 'Aceito', revoked: 'Revogado', expired: 'Expirado' }[
    invitation.status
  ]
}
watch(id, load, { immediate: true })
</script>

<template>
  <OrganizationLayout title="Equipe e membros" :organization-id="organization?.id">
    <div class="workspace-heading">
      <div>
        <h1>Equipe e membros</h1>
        <p>{{ organization?.name || 'Organização' }} · Gerencie quem participa do seu espaço.</p>
      </div>
      <BaseButton
        v-if="canInvite"
        label="+ Convidar"
        aria-label="Convidar pessoas"
        :full-width="false"
        class="workspace-button"
        @click="openInvite"
      />
    </div>
    <div v-if="organization" class="workspace-tabs" aria-label="Integrantes da organização">
      <button
        type="button"
        :class="{ selected: tab === 'members' }"
        :aria-pressed="tab === 'members'"
        @click="changeTab('members')"
      >
        Membros <span v-if="members">{{ members.count }}</span>
      </button>
      <button
        v-if="canInvite"
        type="button"
        :class="{ selected: tab === 'invitations' }"
        :aria-pressed="tab === 'invitations'"
        @click="changeTab('invitations')"
      >
        Convites
      </button>
    </div>
    <div v-if="organization" class="workspace-stats">
      <div class="workspace-card">
        <p>Membros</p>
        <strong>{{ members?.count ?? '—' }}</strong>
      </div>
      <div class="workspace-card">
        <p>Seu papel</p>
        <strong class="workspace-role">{{ roleLabels[organization.current_role] }}</strong>
      </div>
    </div>
    <p v-if="loading" role="status">Carregando…</p>
    <div v-else-if="error" role="alert" class="workspace-error">
      {{ error }}
      <button type="button" @click="organization ? loadRows() : load()">Tentar novamente</button>
    </div>
    <section
      v-else-if="organization"
      class="workspace-card workspace-table"
      :aria-label="tab === 'members' ? 'Membros' : 'Convites'"
    >
      <template v-if="tab === 'members'">
        <div class="member-row table-heading">
          <span>Pessoa</span><span>Papel</span><span>Desde</span>
        </div>
        <div v-for="member in members?.results" :key="member.id" class="member-row">
          <div class="member-person">
            <span class="member-avatar">{{ initials(member.name || member.email) }}</span>
            <div>
              <strong
                >{{ member.name || member.email }}
                <small v-if="member.user_id === auth.user?.id" class="workspace-badge"
                  >você</small
                ></strong
              >
              <p>{{ member.email }}</p>
              <MemberActions :organization="organization" :member="member" @changed="reloadMembers" />
            </div>
          </div>
          <span
            class="workspace-badge"
            :class="{ 'owner-badge': member.role === 'owner' || member.role === 'admin' }"
            >{{ roleLabels[member.role] }}</span
          >
          <time class="workspace-muted member-date" :datetime="member.joined_at">{{
            new Date(member.joined_at).toLocaleDateString('pt-BR')
          }}</time>
        </div>
        <p v-if="!members?.results.length" class="workspace-empty">Nenhum integrante encontrado.</p>
      </template>
      <template v-else>
        <div v-for="invitation in invitations?.results" :key="invitation.id" class="invitation-row">
          <div>
            <strong>{{ invitation.email }}</strong>
            <p>{{ roleLabels[invitation.role] }} · {{ inviteStatus(invitation) }}</p>
            <p>Validade: {{ new Date(invitation.expires_at).toLocaleString('pt-BR') }}</p>
          </div>
          <BaseButton
            v-if="inviteStatus(invitation) === 'Pendente'"
            label="Revogar convite"
            variant="secondary"
            :full-width="false"
            :loading="revoking === invitation.id"
            :disabled="!!revoking"
            class="workspace-button"
            @click="revoke(invitation)"
          />
        </div>
        <p v-if="!invitations?.results.length" class="workspace-empty">
          Nenhum convite enviado. Convide alguém para participar.
        </p>
      </template>
      <footer v-if="currentPage" class="workspace-pagination">
        <span
          >{{ currentPage.count }} {{ tab === 'members' ? 'integrantes' : 'convites' }} · Página
          {{ page }}</span
        >
        <div>
          <button type="button" :disabled="!currentPage.previous" @click="changePage(-1)">
            Anterior</button
          ><button type="button" :disabled="!currentPage.next" @click="changePage(1)">
            Próxima
          </button>
        </div>
      </footer>
    </section>
    <dialog
      ref="dialog"
      aria-labelledby="invite-title"
      class="workspace-dialog"
      @cancel="saving && $event.preventDefault()"
    >
      <h2 id="invite-title">Convidar para a organização</h2>
      <p>
        {{ organization?.name }} · O convite funciona para quem já tem conta e para novos usuários.
      </p>
      <form class="workspace-form" @submit.prevent="invite">
        <label
          >E-mail<input
            v-model="email"
            type="email"
            name="invitation-email"
            required
            autocomplete="email"
            maxlength="254"
            autofocus
        /></label>
        <label
          >Papel<select v-model="role">
            <option value="member">Membro</option>
            <option value="viewer">Leitor</option>
            <option v-if="organization?.current_role === 'owner'" value="admin">
              Administrador
            </option>
          </select></label
        >
        <p v-if="formError" role="alert" class="workspace-error">{{ formError }}</p>
        <div class="workspace-actions">
          <BaseButton
            label="Cancelar"
            variant="secondary"
            :disabled="saving"
            :full-width="false"
            @click="dialog?.close()"
          /><BaseButton
            type="submit"
            label="Enviar convite"
            :loading="saving"
            :full-width="false"
          />
        </div>
      </form>
    </dialog>
  </OrganizationLayout>
</template>
