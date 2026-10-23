<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getErrorMessage } from '@/app/plugins/axios'
import { BaseButton } from '@/shared/components'
import { createInvitation, type InviteRole } from '@/modules/invitations'
import OnboardingLayout from '../components/onboardingLayout.vue'
import {
  createOrganization,
  getOrganization,
  uploadOrganizationLogo,
  listOrganizationSectors,
  createOrganizationSector,
} from '../services'
import { useOrganizationsStore } from '../stores'
import type { Organization, OrganizationSector } from '../types'
import { parseInvitationEmails, workspaceSlug } from '../utils'

const route = useRoute()
const router = useRouter()
const organizations = useOrganizationsStore()
const organization = ref<Organization | null>(null)
const name = ref('')
const slug = ref('')
const slugEdited = ref(false)
const teamSize = ref<Organization['team_size']>('')
const createdId = ref('')
const workspacePrefix = `${window.location.origin}/w/`
const sectors = ref<OrganizationSector[]>([])
const sectorNames = ref<string[]>(['Marketing', 'Design', 'Desenvolvimento'])
const sectorChoices = ref(['Marketing', 'Design', 'Desenvolvimento', 'Financeiro', 'Comercial'])
const newSector = ref('')
const selectedSectorIds = ref<string[]>([])
const logo = ref<File | null>(null)
const logoUrl = ref('')
const draftEmail = ref('')
const emails = ref<string[]>([])
const sent = ref<string[]>([])
const role = ref<InviteRole>('member')
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const failures = ref<{ email: string; message: string }[]>([])
const organizationId = computed(() =>
  typeof route.params.organizationId === 'string' ? route.params.organizationId : '',
)
const step = computed(() =>
  !organizationId.value ? 1 : route.name === 'OrganizationOnboardingSectors' ? 2 : 3,
)
const wasSent = (email: string) =>
  sent.value.some((value) => value.toLowerCase() === email.toLowerCase())
const remaining = computed(() => emails.value.filter((email) => !wasSent(email)))
const membersTarget = computed(() => ({
  name: 'OrganizationMembers',
  params: { organizationId: organizationId.value },
}))

function chooseLogo(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  logoUrl.value = ''
  logo.value = null
  error.value = ''
  if (!file) return
  if (!['image/png', 'image/svg+xml'].includes(file.type) || file.size > 2 * 1024 * 1024) {
    error.value = 'Escolha uma imagem PNG ou SVG de até 2 MB.'
    input.value = ''
    return
  }
  logo.value = file
}
async function create() {
  if (saving.value || !name.value.trim()) return
  saving.value = true
  error.value = ''
  try {
    if (createdId.value) {
      await router.replace({
        name: 'OrganizationOnboardingSectors',
        params: { organizationId: createdId.value },
      })
      return
    }
    if (logo.value && !logoUrl.value) logoUrl.value = await uploadOrganizationLogo(logo.value)
    const result = await createOrganization({
      name: name.value.trim(),
      description: '',
      slug: slug.value,
      team_size: teamSize.value,
      ...(logoUrl.value ? { logo_url: logoUrl.value } : {}),
    })
    organizations.organizations.push(result)
    organization.value = result
    createdId.value = result.id
    await router.replace({
      name: 'OrganizationOnboardingSectors',
      params: { organizationId: result.id },
    })
  } catch (cause) {
    error.value = getErrorMessage(cause, 'Não foi possível criar sua organização. Tente novamente.')
  } finally {
    saving.value = false
  }
}
function toggleSector(name: string) {
  sectorNames.value = sectorNames.value.includes(name)
    ? sectorNames.value.filter((value) => value !== name)
    : [...sectorNames.value, name]
}
function addSector() {
  const name = newSector.value.trim()
  if (!name) return
  const existing = sectorChoices.value.find((value) => value.toLowerCase() === name.toLowerCase())
  if (!existing) sectorChoices.value.push(name)
  if (!sectorNames.value.includes(existing || name)) sectorNames.value.push(existing || name)
  newSector.value = ''
}
async function saveSectors() {
  if (saving.value) return
  addSector()
  saving.value = true
  error.value = ''
  try {
    for (const name of sectorNames.value) {
      if (!sectors.value.some((sector) => sector.name.toLowerCase() === name.toLowerCase())) {
        sectors.value.push(await createOrganizationSector(organizationId.value, name))
      }
    }
    await router.replace({
      name: 'OrganizationOnboardingTeam',
      params: { organizationId: organizationId.value },
    })
  } catch (cause) {
    error.value = getErrorMessage(
      cause,
      'Não foi possível criar os setores. Os setores já criados foram mantidos.',
    )
  } finally {
    saving.value = false
  }
}
function addEmails(): boolean {
  const additions = parseInvitationEmails(draftEmail.value)
  if (additions.some((email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    error.value = 'Confira os e-mails antes de continuar.'
    return false
  }
  emails.value = parseInvitationEmails([...emails.value, ...additions].join(','))
  draftEmail.value = ''
  error.value = ''
  return true
}
async function sendInvitations() {
  if (saving.value || !organization.value || !addEmails()) return
  if (!remaining.value.length) {
    error.value = 'Adicione um e-mail ou escolha pular por agora.'
    return
  }
  saving.value = true
  failures.value = []
  const pending = [...remaining.value]
  try {
    for (const email of pending) {
      try {
        await createInvitation(organizationId.value, {
          email,
          role: role.value,
          sector_ids: selectedSectorIds.value,
        })
        sent.value.push(email)
      } catch (cause) {
        failures.value.push({
          email,
          message: getErrorMessage(cause, 'Não foi possível enviar o convite.'),
        })
      }
    }
    if (!failures.value.length) await router.replace(membersTarget.value)
  } finally {
    saving.value = false
  }
}
async function loadOrganization() {
  error.value = ''
  organization.value = null
  emails.value = []
  sent.value = []
  failures.value = []
  if (!organizationId.value) return
  const id = organizationId.value
  loading.value = true
  try {
    const result = await getOrganization(id)
    if (id !== organizationId.value) return
    if (!['owner', 'admin'].includes(result.current_role)) {
      error.value = 'Somente proprietários e administradores podem convidar pessoas.'
      return
    }
    const items: OrganizationSector[] = []
    let page = 1
    while (true) {
      const response = await listOrganizationSectors(id, page++)
      items.push(...response.results)
      if (!response.next) break
    }
    if (id !== organizationId.value) return
    organization.value = result
    sectors.value = items
    selectedSectorIds.value = items.map((sector) => sector.id)
    if (items.length) {
      sectorNames.value = items.map((sector) => sector.name)
      sectorChoices.value = [...new Set([...sectorChoices.value, ...sectorNames.value])]
    }
  } catch (cause) {
    error.value = getErrorMessage(cause, 'Não foi possível abrir sua organização.')
  } finally {
    if (id === organizationId.value) loading.value = false
  }
}
watch([organizationId, () => route.name], loadOrganization, { immediate: true })
watch(name, (value) => {
  if (!slugEdited.value) slug.value = workspaceSlug(value)
})
</script>

<template>
  <OnboardingLayout
    :step="step"
    :steps="['Organização', 'Setores', 'Equipe']"
    :title="
      step === 1
        ? 'Sobre sua organização'
        : step === 2
          ? 'Organize seus setores'
          : 'Convide sua equipe'
    "
    :description="
      step === 1
        ? 'Essas informações aparecem para todos os membros.'
        : step === 2
          ? 'Agrupe os boards por área. Você pode criar outros setores depois.'
          : 'Cada pessoa recebe um e-mail com o convite. Você pode mudar os papéis depois.'
    "
  >
    <form v-if="step === 1" class="onboarding-form" @submit.prevent="create">
      <label class="onboarding-field"
        >Nome da organização<span class="onboarding-name-input"
          ><img
            src="/figma/onboarding-building.svg"
            width="18"
            height="18"
            alt=""
            class="onboarding-mobile-icon" /><input
            v-model="name"
            name="organization-name"
            maxlength="255"
            required
            placeholder="Norte Studio"
            :disabled="saving || !!createdId" /></span
      ></label>
      <label class="onboarding-field"
        >Endereço do workspace<span class="onboarding-address"
          ><span>{{ workspacePrefix }}</span
          ><input
            v-model="slug"
            name="organization-slug"
            required
            maxlength="63"
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            :disabled="saving || !!createdId"
            placeholder="norte-studio"
            @input="slugEdited = true" /></span
      ></label>
      <label class="onboarding-field"
        >Tamanho da equipe<span class="onboarding-select"
          ><select v-model="teamSize" required :disabled="saving || !!createdId">
            <option value="" disabled>Selecione o tamanho</option>
            <option value="1">Só eu</option>
            <option value="2-10">2 a 10 pessoas</option>
            <option value="11-50">11 a 50 pessoas</option>
            <option value="51-200">51 a 200 pessoas</option>
            <option value="201+">Mais de 200 pessoas</option></select
          ><img src="/figma/onboarding-select.svg" alt="" width="15" height="15" /></span
      ></label>
      <label class="onboarding-field"
        ><span>Logo <span class="onboarding-optional">(opcional)</span></span
        ><span class="onboarding-upload"
          ><img src="/figma/onboarding-upload.svg" alt="" width="20" height="20" /><span>{{
            logo?.name || 'PNG ou SVG, até 2 MB'
          }}</span
          ><input
            type="file"
            name="organization-logo"
            accept="image/png,image/svg+xml"
            :disabled="saving || !!createdId"
            @change="chooseLogo" /></span
      ></label>
      <p v-if="error" class="onboarding-error" role="alert">{{ error }}</p>
      <BaseButton
        type="submit"
        :label="saving ? 'Criando organização…' : 'Continuar'"
        :disabled="saving || !name.trim()"
        class="onboarding-submit"
        ><template #after
          ><img
            src="/figma/onboarding-arrow.svg"
            width="18"
            height="18"
            alt=""
            class="onboarding-mobile-icon" /></template
      ></BaseButton>
      <RouterLink to="/organizacoes" class="onboarding-skip">Voltar para organizações</RouterLink>
    </form>
    <p v-else-if="loading" role="status">Carregando organização…</p>
    <form
      v-else-if="organization && step === 2"
      class="onboarding-form"
      @submit.prevent="saveSectors"
    >
      <fieldset class="onboarding-sector-picker">
        <legend>Setores</legend>
        <button
          v-for="choice in sectorChoices"
          :key="choice"
          type="button"
          :aria-pressed="sectorNames.includes(choice)"
          :disabled="saving"
          @click="toggleSector(choice)"
        >
          <img
            v-if="sectorNames.includes(choice)"
            src="/figma/onboarding-check.svg"
            alt=""
            width="13"
            height="13"
          />{{ choice }}
        </button>
      </fieldset>
      <label class="onboarding-field"
        >Novo setor<input
          v-model="newSector"
          name="new-sector"
          maxlength="255"
          placeholder="Ex.: Atendimento"
          :disabled="saving"
          @keydown.enter.prevent="addSector"
      /></label>
      <button
        type="button"
        class="onboarding-skip"
        :disabled="saving || !newSector.trim()"
        @click="addSector"
      >
        + Adicionar setor
      </button>
      <p v-if="error" class="onboarding-error" role="alert">{{ error }}</p>
      <BaseButton
        type="submit"
        :label="saving ? 'Criando setores…' : 'Continuar'"
        :disabled="saving"
        class="onboarding-submit"
        ><template #after
          ><img
            src="/figma/onboarding-arrow.svg"
            width="18"
            height="18"
            alt=""
            class="onboarding-mobile-icon" /></template
      ></BaseButton>
      <RouterLink
        v-if="!saving"
        :to="{ name: 'OrganizationOnboardingTeam', params: { organizationId } }"
        class="onboarding-skip"
        >Pular por agora</RouterLink
      >
    </form>
    <form v-else-if="organization" class="onboarding-form" @submit.prevent="sendInvitations">
      <label class="onboarding-field"
        >E-mails<span class="onboarding-email-tags"
          ><img
            v-if="!emails.length"
            src="/figma/onboarding-mail.svg"
            width="18"
            height="18"
            alt=""
            class="onboarding-mobile-icon" /><span
            v-for="email in emails"
            :key="email"
            class="onboarding-email-tag"
            >{{ email
            }}<button
              v-if="!wasSent(email)"
              type="button"
              :aria-label="`Remover ${email}`"
              :disabled="saving"
              @click="emails = emails.filter((value) => value !== email)"
            >
              ×
            </button></span
          ><input
            v-model="draftEmail"
            name="invitation-emails"
            placeholder="Digite e-mails separados por vírgula"
            :disabled="saving"
            @keydown.enter.prevent="addEmails"
            @blur="addEmails" /></span
      ></label>
      <label class="onboarding-field"
        >Papel inicial<span class="onboarding-select"
          ><select v-model="role" :disabled="saving">
            <option value="member">Membro</option>
            <option value="viewer">Leitor</option>
            <option v-if="organization.current_role === 'owner'" value="admin">
              Administrador
            </option></select
          ><img src="/figma/onboarding-select.svg" alt="" width="15" height="15" /></span
      ></label>
      <fieldset v-if="sectors.length" class="onboarding-sector-picker">
        <legend>Setores</legend>
        <label v-for="sector in sectors" :key="sector.id"
          ><input
            v-model="selectedSectorIds"
            type="checkbox"
            :value="sector.id"
            :disabled="saving"
          />{{ sector.name }}</label
        >
      </fieldset>
      <p v-for="email in sent" :key="email" class="onboarding-result">
        {{ email }} · Convite enviado
      </p>
      <p v-if="error" class="onboarding-error" role="alert">{{ error }}</p>
      <p v-for="failure in failures" :key="failure.email" class="onboarding-error" role="alert">
        {{ failure.email }}: {{ failure.message }}
      </p>
      <div class="onboarding-actions">
        <BaseButton
          type="submit"
          :label="
            saving
              ? 'Enviando convites…'
              : `Enviar ${remaining.length || ''} convite${remaining.length === 1 ? '' : 's'} e concluir`
          "
          :disabled="saving"
          class="onboarding-submit"
          ><template #after
            ><img
              src="/figma/onboarding-arrow.svg"
              width="18"
              height="18"
              alt=""
              class="onboarding-mobile-icon" /></template></BaseButton
        ><RouterLink v-if="!saving" :to="membersTarget">{{
          sent.length ? 'Abrir organização' : 'Pular por agora'
        }}</RouterLink>
      </div>
    </form>
    <div v-else>
      <p class="onboarding-error" role="alert">{{ error }}</p>
      <button type="button" @click="loadOrganization">Tentar novamente</button>
    </div>
  </OnboardingLayout>
</template>
