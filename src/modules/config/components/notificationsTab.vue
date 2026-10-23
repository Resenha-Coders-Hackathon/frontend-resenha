<script setup lang="ts">
import type { NotificationSettings } from '../types'
import ConfigCard from './configCard.vue'
import ConfigToggle from './configToggle.vue'

const settings = defineModel<NotificationSettings>({ required: true })
</script>

<template>
  <div class="grid items-start gap-[16px] xl:grid-cols-2">
    <ConfigCard title="Por e-mail" class="gap-[6px]!">
      <div>
        <ConfigToggle
          v-model="settings.emailAssigned"
          label="Tarefas atribuídas a mim"
          description="Quando alguém colocar você como responsável"
        />
        <ConfigToggle
          v-model="settings.emailMentions"
          label="Menções no chat"
          description="Quando citarem você com @"
        />
        <ConfigToggle
          v-model="settings.emailDeadlines"
          label="Prazos próximos"
          description="Um dia antes do vencimento da tarefa"
        />
        <ConfigToggle
          v-model="settings.emailDigest"
          label="Resumo semanal"
          description="Toda segunda, com o andamento dos seus boards"
        />
      </div>
    </ConfigCard>

    <ConfigCard title="No aplicativo" class="gap-[6px]!">
      <div>
        <ConfigToggle
          v-model="settings.appComments"
          label="Comentários em tarefas"
          description="Em tarefas que você criou ou segue"
        />
        <ConfigToggle
          v-model="settings.appStatus"
          label="Mudanças de status"
          description="Quando uma tarefa sua mudar de coluna"
        />
        <ConfigToggle
          v-model="settings.appAi"
          label="Sugestões do assistente de IA"
          description="Tarefas criadas a partir de atas e arquivos"
        />
      </div>
    </ConfigCard>
  </div>
</template>
