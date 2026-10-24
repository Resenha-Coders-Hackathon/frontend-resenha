<script setup lang="ts">
import { ref, watch } from 'vue'
import { BaseButton } from '@/shared/components'
import type { ProfileForm, SelectOption } from '../types'
import ConfigCard from './configCard.vue'
import ConfigField from './configField.vue'

const props = defineProps<{
  timezones: SelectOption[]
  languages: SelectOption[]
  uploading: boolean
  uploadError: string
  avatarPreview: string
  pendingAvatar: boolean
}>()

const form = defineModel<ProfileForm>({ required: true })

const emit = defineEmits<{ changeEmail: []; selectAvatar: [file: File]; openCamera: [] }>()
const fileInput = ref<HTMLInputElement | null>(null)
const imageFailed = ref(false)
watch(
  () => [form.value.avatar_url, props.avatarPreview],
  () => {
    imageFailed.value = false
  },
)

function selectAvatar(event: Event): void {
  if (!(event.target instanceof HTMLInputElement)) return
  const file = event.target.files?.[0]
  event.target.value = ''
  if (file) emit('selectAvatar', file)
}
</script>

<template>
  <div class="flex flex-col items-start gap-[16px] xl:flex-row">
    <ConfigCard title="Informações pessoais" class="w-full">
      <div
        class="flex flex-col gap-4 border-b border-(--border-default) pb-5 sm:flex-row sm:items-center dark:border-(--border-inverse)"
        :aria-busy="uploading"
      >
        <div
          class="grid size-20 shrink-0 place-items-center overflow-hidden rounded-full border border-(--border-default) bg-(--bg-subtle) dark:border-(--border-inverse) dark:bg-black/30"
        >
          <img
            v-if="(avatarPreview || form.avatar_url) && !imageFailed"
            :src="avatarPreview || form.avatar_url"
            alt="Foto de perfil"
            class="size-full object-cover"
            referrerpolicy="no-referrer"
            @error="imageFailed = true"
          />
          <span
            v-else
            class="material-symbols-outlined text-4xl! text-(--text-muted)"
            aria-hidden="true"
            >person</span
          >
        </div>
        <div class="flex min-w-0 flex-col gap-2">
          <p class="text-sm font-medium">Foto de perfil</p>
          <p id="avatar-help" class="text-xs text-(--text-muted)">
            JPG, PNG ou WebP de até 10 MB. Recorte e confirme em Salvar alterações.
          </p>
          <input
            ref="fileInput"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            class="hidden"
            aria-label="Escolher foto de perfil"
            @change="selectAvatar"
          />
          <div class="flex flex-wrap gap-2">
            <BaseButton
              label="Escolher foto"
              icon="image"
              icon-position="left"
              variant="secondary"
              size="sm"
              :full-width="false"
              :loading="uploading"
              aria-describedby="avatar-help"
              class="mt-0! focus-visible:outline-2 focus-visible:outline-offset-2"
              @click="fileInput?.click()"
            />
            <BaseButton
              label="Tirar foto"
              icon="photo_camera"
              icon-position="left"
              variant="secondary"
              size="sm"
              :full-width="false"
              :disabled="uploading"
              class="mt-0! focus-visible:outline-2 focus-visible:outline-offset-2"
              @click="emit('openCamera')"
            />
          </div>
          <p v-if="uploading" role="status" class="text-xs text-(--text-muted)">Enviando foto…</p>
          <p v-else-if="pendingAvatar" role="status" class="text-xs text-(--text-muted)">
            Foto preparada. Salve as alterações para enviar.
          </p>
          <p v-if="uploadError" role="alert" class="auth-error">{{ uploadError }}</p>
        </div>
      </div>
      <ConfigField
        id="profile-name"
        v-model="form.name"
        label="Nome completo"
        autocomplete="name"
        maxlength="255"
        required
      />
      <div class="flex flex-col gap-[16px] sm:flex-row sm:items-center">
        <ConfigField
          id="profile-email"
          v-model="form.email"
          label="E-mail"
          type="email"
          autocomplete="email"
          readonly
          hint="Use Alterar e-mail para verificar o novo endereço."
        />
        <BaseButton
          label="Alterar e-mail"
          icon="edit"
          icon-position="left"
          variant="secondary"
          size="sm"
          :full-width="false"
          class="mt-0! shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2"
          :disabled="uploading"
          @click="$emit('changeEmail')"
        />
      </div>
      <div class="flex flex-col gap-[16px] sm:flex-row">
        <ConfigField
          id="profile-timezone"
          v-model="form.timezone"
          as="select"
          label="Fuso horário"
          :options="timezones"
        />
        <ConfigField
          id="profile-language"
          v-model="form.language"
          as="select"
          label="Idioma"
          :options="languages"
        />
      </div>
      <ConfigField id="profile-bio" v-model="form.bio" as="textarea" label="Bio" />
    </ConfigCard>
    <!-- TODO: CÓDIGO COMENTADOO, REVISAR MAIS TARDE.
    Only the security summary inside the Profile tab is temporarily hidden.
    Restore ConfigListItem's import and the navigate event before re-enabling.
    <ConfigCard title="Segurança" class="w-full gap-[6px]! xl:w-[380px]">
      <div>
        <ConfigListItem
          icon="key"
          title="Senha"
          description="Gerencie as opções de segurança"
          action="Alterar"
          @action="$emit('navigate', 'security')"
        />
        <ConfigListItem
          icon="shield"
          title="Verificação em duas etapas"
          description="Não disponível na API atual"
        />
        <ConfigListItem
          icon="devices"
          title="Sessões ativas"
          description="Dispositivos conectados à sua conta"
          action="Ver"
          @action="$emit('navigate', 'security')"
        />
      </div>
    </ConfigCard>
    -->
  </div>
</template>
