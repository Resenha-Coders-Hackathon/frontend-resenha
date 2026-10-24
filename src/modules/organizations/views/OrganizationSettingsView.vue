<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
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
const logoPreview = ref('')
const shownLogo = computed(() => logoPreview.value || logoUrl.value)
const initials = computed(() => (name.value.trim()[0] ?? '?').toUpperCase())
const revokePreview = () => logoPreview.value && URL.revokeObjectURL(logoPreview.value)
onBeforeUnmount(revokePreview)

async function initialize() {
  ready.value = false
  const organizationId = id.value
  logoFile.value = null
  revokePreview()
  logoPreview.value = ''
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
  const file = (event.target as HTMLInputElement).files?.[0] ?? null
  if (file && !['image/png', 'image/jpeg', 'image/webp'].includes(file.type))
    return void ((event.target as HTMLInputElement).value = '')
  logoFile.value = file
  revokePreview()
  logoPreview.value = file ? URL.createObjectURL(file) : ''
}

function removeLogo() {
  logoUrl.value = ''
  logoFile.value = null
  revokePreview()
  logoPreview.value = ''
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
      <p v-if="!canAdmin" class="mb-3 text-[13px] text-(--text-muted)">
        Somente proprietários e administradores podem alterar estes dados.
      </p>
      <form @submit.prevent="save">
        <fieldset :disabled="!canAdmin || saving || loading" class="grid min-w-0 gap-5">
          <div class="flex flex-wrap items-center gap-4">
            <img
              v-if="shownLogo"
              :src="shownLogo"
              alt="Logomarca da organização"
              class="size-20 rounded-2xl border border-(--border-default) object-cover dark:border-(--border-inverse)"
            />
            <span
              v-else
              class="grid size-20 place-items-center rounded-2xl bg-(--bg-muted) text-[28px] font-semibold text-(--text-secondary) dark:bg-white/10"
              aria-hidden="true"
              >{{ initials }}</span
            >
            <div class="grid gap-2">
              <label
                class="inline-flex h-9 w-fit cursor-pointer items-center gap-2 rounded-lg border border-(--border-default) px-3 text-[13px] font-medium hover:bg-(--bg-subtle) dark:border-(--border-inverse) dark:hover:bg-white/10"
              >
                <span class="material-symbols-outlined text-[18px]!" aria-hidden="true"
                  >upload</span
                >
                {{ shownLogo ? 'Trocar logomarca' : 'Enviar logomarca' }}
                <input
                  :key="id"
                  type="file"
                  class="sr-only"
                  accept="image/png,image/jpeg,image/webp"
                  @change="selectLogo"
                />
              </label>
              <button
                v-if="shownLogo"
                type="button"
                class="w-fit cursor-pointer text-[12.5px] text-(--text-muted) underline"
                @click="removeLogo"
              >
                Remover logomarca
              </button>
              <p class="text-[12px] text-(--text-muted)">PNG, JPG ou WebP.</p>
            </div>
          </div>

          <div class="workspace-form grid gap-4 sm:grid-cols-2">
            <label>Nome<input v-model="name" required maxlength="255" /></label>
            <label
              >Endereço da organização<input
                v-model="slug"
                required
                maxlength="63"
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
            /></label>
            <p class="text-[12px] text-(--text-muted) sm:col-span-2">
              Endereço: /w/{{ slug }}. Alterar o endereço pode invalidar links antigos.
            </p>
            <label class="sm:col-span-2"
              >Descrição<textarea v-model="description" rows="4" />
            </label>
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
          </div>

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
