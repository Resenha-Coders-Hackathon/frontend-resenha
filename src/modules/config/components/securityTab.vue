<script setup lang="ts">
import { useRouter } from 'vue-router'
import { BaseButton } from '@/shared/components'
import type { ActiveSession } from '../types'
import ConfigCard from './configCard.vue'
import ConfigListItem from './configListItem.vue'

defineProps<{
  sessions: ActiveSession[]
  loading: boolean
  error: string
  endingSession: number | null
}>()
defineEmits<{ endSession: [id: number]; retry: [] }>()
const router = useRouter()
</script>

<template>
  <div class="flex flex-col items-start gap-[16px] xl:flex-row">
    <ConfigCard title="Alterar senha" class="w-full xl:flex-1">
      <p class="text-sm text-(--text-muted)">
        Enviaremos um código ao seu e-mail para confirmar a alteração. Ao concluir, entre novamente
        com a nova senha.
      </p>
      <BaseButton
        label="Alterar senha"
        icon="lock_reset"
        icon-position="left"
        variant="secondary"
        :full-width="false"
        class="mt-0! focus-visible:outline-2 focus-visible:outline-offset-2"
        @click="router.push({ name: 'ForgotPassword', query: { redirect: '/configuracoes' } })"
      />
    </ConfigCard>
    <div class="flex w-full flex-col gap-[16px] xl:w-[380px]">
      <ConfigCard title="Proteção da conta">
        <ConfigListItem
          icon="shield"
          title="Verificação em duas etapas"
          description="Não disponível na API atual"
        />
      </ConfigCard>
      <ConfigCard title="Sessões ativas" class="gap-[6px]!">
        <p v-if="loading" role="status">Carregando sessões…</p>
        <div v-else-if="error" role="alert">
          <p>{{ error }}</p>
          <button type="button" class="underline" @click="$emit('retry')">Tentar novamente</button>
        </div>
        <fieldset v-else :disabled="endingSession !== null">
          <ConfigListItem
            v-for="session in sessions"
            :key="session.id"
            :icon="session.device.includes('iPhone') ? 'smartphone' : 'laptop_mac'"
            :title="session.device"
            :description="session.detail"
            :status="session.current ? 'Este dispositivo' : ''"
            :action="session.current ? '' : 'Encerrar'"
            @action="$emit('endSession', session.id)"
          />
          <p v-if="!sessions.length" class="py-[10px] text-[12px] text-(--text-muted)">
            Nenhuma sessão ativa encontrada.
          </p>
        </fieldset>
      </ConfigCard>
    </div>
  </div>
</template>
