<script setup lang="ts">
import type { NotificationSettings } from '../types'
import ConfigCard from './configCard.vue'
import ConfigToggle from './configToggle.vue'

const settings = defineModel<NotificationSettings>({ required: true })
</script>

<template>
  <div class="grid items-start gap-[16px] xl:grid-cols-2">
    <ConfigCard title="Por e-mail" class="gap-[6px]!">
      <ConfigToggle v-model="settings.email_product" label="E-mails de produto" />
      <ConfigToggle v-model="settings.email_weekly_digest" label="Resumo semanal" />
      <ConfigToggle v-model="settings.email_security" label="E-mails de segurança" />
      <ConfigToggle v-model="settings.email_assigned" label="Tarefas atribuídas a mim" />
      <ConfigToggle v-model="settings.email_mentions" label="Menções no chat" />
      <ConfigToggle v-model="settings.email_deadlines" label="Prazos próximos" />
    </ConfigCard>
    <ConfigCard title="No aplicativo" class="gap-[6px]!">
      <ConfigToggle v-model="settings.app_comments" label="Comentários em tarefas" />
      <ConfigToggle v-model="settings.app_status" label="Mudanças de status" />
      <ConfigToggle v-model="settings.app_ai" label="Sugestões do assistente de IA" />
      <ConfigToggle
        v-model="settings.push_enabled"
        label="Permitir notificações push"
        description="O envio depende também da permissão do navegador e do dispositivo."
      />
    </ConfigCard>
  </div>
</template>
