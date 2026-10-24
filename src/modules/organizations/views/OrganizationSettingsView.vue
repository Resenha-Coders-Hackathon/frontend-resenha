<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { BaseButton } from '@/shared/components'
import OrganizationLayout from '../components/organizationLayout.vue'
import { useOrganizationAdmin } from '../composables/useOrganizationAdmin'
import { deleteOrganization, updateOrganization, uploadOrganizationLogo } from '../services'
import type { Organization } from '../types'

const { id, organization, loading, saving, error, canAdmin, load, mutate } = useOrganizationAdmin()
const router = useRouter()
const name = ref('')
const slug = ref('')
const description = ref('')
const teamSize = ref<Organization['team_size']>('')
const logoUrl = ref('')
const logoFile = ref<File | null>(null)
const ready = ref(false)

async function initialize() {
  ready.value = false
  const organizationId = id.value
  logoFile.value = null
  await load()
  if (!organization.value || organizationId !== id.value) return
  name.value = organization.value.name
  slug.value = organization.value.slug
  description.value = organization.value.description
  teamSize.value = organization.value.team_size
  logoUrl.value = organization.value.logo_url
  ready.value = true
}

function selectLogo(event: Event) {
  logoFile.value = (event.target as HTMLInputElement).files?.[0] ?? null
}

function removeLogo() {
  logoUrl.value = ''
  logoFile.value = null
}

async function save() {
  const organizationId = id.value
  const file = logoFile.value
  const payload = {
    name: name.value.trim(),
    slug: slug.value.trim(),
    description: description.value.trim(),
    team_size: teamSize.value,
    logo_url: logoUrl.value,
  }
  await mutate(async () => {
    if (file) payload.logo_url = await uploadOrganizationLogo(file)
    await updateOrganization(organizationId, payload)
  }, initialize)
}

async function removeOrganization() {
  const current = organization.value
  if (!current || current.is_personal || current.current_role !== 'owner') return
  if (
    !window.confirm(
      `Desativar a organização “${current.name}”? Todos perderão o acesso a seus setores. A restauração ainda não está disponível nesta interface.`,
    )
  )
    return
  await mutate(
    () => deleteOrganization(current.id),
    async () => {
      await router.push({ name: 'Organizations' })
    },
  )
}

watch(id, initialize, { immediate: true })
</script>

<template>
  <OrganizationLayout title="Configurações" :organization-id="organization?.id">
    <div class="workspace-heading">
      <div>
        <h1>Configurações da organização</h1>
        <p>Identidade e dados do seu espaço.</p>
      </div>
    </div>
    <p v-if="loading" role="status">Carregando…</p>
    <div v-if="error" class="workspace-error" role="alert">
      {{ error }} <button :disabled="saving" @click="initialize">Recarregar</button>
    </div>
    <section v-if="organization && ready" class="workspace-card create-organization">
      <p v-if="!canAdmin">Somente proprietários e administradores podem alterar estes dados.</p>
      <form class="workspace-form" @submit.prevent="save">
        <fieldset :disabled="!canAdmin || saving || loading" class="admin-stack">
          <label>Nome<input v-model="name" required maxlength="255" /></label>
          <label
            >Endereço da organização<input
              v-model="slug"
              required
              maxlength="63"
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
          /></label>
          <p>Endereço: /w/{{ slug }}. Alterar o endereço pode invalidar links antigos.</p>
          <label>Descrição<textarea v-model="description" rows="4" /></label>
          <label
            >Tamanho da equipe<select v-model="teamSize">
              <option value="">Não informado</option>
              <option value="1">Só eu</option>
              <option value="2-10">2–10 pessoas</option>
              <option value="11-50">11–50 pessoas</option>
              <option value="51-200">51–200 pessoas</option>
              <option value="201+">201 ou mais pessoas</option>
            </select></label
          >
          <img v-if="logoUrl" :src="logoUrl" alt="Logo da organização" width="80" height="80" />
          <label
            >Atualizar logo<input
              :key="id"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              @change="selectLogo"
          /></label>
          <button v-if="logoUrl" type="button" @click="removeLogo">Remover logo</button>
          <BaseButton
            v-if="canAdmin"
            type="submit"
            label="Salvar alterações"
            :loading="saving"
            :full-width="false"
          />
        </fieldset>
      </form>
    </section>
    <section
      v-if="organization?.current_role === 'owner' && !organization.is_personal"
      class="workspace-card create-organization workspace-form"
    >
      <h2>Desativar organização</h2>
      <p>Esta ação interrompe o acesso de todos os integrantes.</p>
      <BaseButton
        label="Desativar organização"
        variant="secondary"
        :disabled="saving"
        :full-width="false"
        @click="removeOrganization"
      />
    </section>
  </OrganizationLayout>
</template>
