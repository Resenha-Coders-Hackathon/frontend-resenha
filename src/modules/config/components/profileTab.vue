<script setup lang="ts">
import type { ProfileForm, SelectOption } from '../types'
import ConfigCard from './configCard.vue'
import ConfigField from './configField.vue'
import ConfigListItem from './configListItem.vue'

defineProps<{ timezones: SelectOption[]; languages: SelectOption[] }>()

const form = defineModel<ProfileForm>({ required: true })

defineEmits<{ navigate: ['security'] }>()
</script>

<template>
  <div class="flex flex-col items-start gap-[16px] xl:flex-row">
    <ConfigCard title="Informações pessoais" class="w-full xl:flex-1">
      <div class="flex flex-col gap-[16px] sm:flex-row">
        <ConfigField
          id="profile-first-name"
          v-model="form.firstName"
          label="Nome"
          autocomplete="given-name"
        />
        <ConfigField
          id="profile-last-name"
          v-model="form.lastName"
          label="Sobrenome"
          autocomplete="family-name"
        />
      </div>
      <div class="flex flex-col gap-[16px] sm:flex-row">
        <ConfigField
          id="profile-email"
          v-model="form.email"
          label="E-mail"
          type="email"
          autocomplete="email"
          hint="Usado para login e notificações"
        />
        <ConfigField
          id="profile-role"
          v-model="form.role"
          label="Cargo"
          autocomplete="organization-title"
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
      <ConfigField id="profile-bio" v-model="form.bio" as="textarea" label="Bio" maxlength="280" />
    </ConfigCard>

    <ConfigCard title="Segurança" class="w-full gap-[6px]! xl:w-[380px]">
      <div>
        <ConfigListItem
          icon="key"
          title="Senha"
          description="Alterada há 3 meses"
          action="Alterar"
          @action="$emit('navigate', 'security')"
        />
        <ConfigListItem
          icon="shield"
          title="Verificação em duas etapas"
          description="App autenticador"
          status="Ativa"
        />
        <ConfigListItem
          icon="devices"
          title="Sessões ativas"
          description="2 dispositivos"
          action="Ver"
          @action="$emit('navigate', 'security')"
        />
      </div>
    </ConfigCard>
  </div>
</template>
