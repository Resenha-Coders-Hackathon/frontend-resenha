<script setup lang="ts">
import type { ActiveSession, PasswordForm } from '../types'
import ConfigCard from './configCard.vue'
import ConfigField from './configField.vue'
import ConfigListItem from './configListItem.vue'

const password = defineModel<PasswordForm>('password', { required: true })
const sessions = defineModel<ActiveSession[]>('sessions', { required: true })

function endSession(id: string) {
  sessions.value = sessions.value.filter((session) => session.id !== id)
}
</script>

<template>
  <div class="flex flex-col items-start gap-[16px] xl:flex-row">
    <ConfigCard title="Alterar senha" class="w-full xl:flex-1">
      <ConfigField
        id="security-current-password"
        v-model="password.current"
        type="password"
        label="Senha atual"
        autocomplete="current-password"
      />
      <div class="flex flex-col gap-[16px] sm:flex-row">
        <ConfigField
          id="security-new-password"
          v-model="password.next"
          type="password"
          label="Nova senha"
          autocomplete="new-password"
          minlength="9"
          hint="Mínimo de 9 caracteres, sem ser só números"
        />
        <ConfigField
          id="security-confirm-password"
          v-model="password.confirmation"
          type="password"
          label="Confirmar nova senha"
          autocomplete="new-password"
        />
      </div>
    </ConfigCard>

    <div class="flex w-full flex-col gap-[16px] xl:w-[380px]">
      <ConfigCard title="Proteção da conta" class="gap-[6px]!">
        <div>
          <ConfigListItem icon="key" title="Senha" description="Alterada há 3 meses" />
          <ConfigListItem
            icon="shield"
            title="Verificação em duas etapas"
            description="App autenticador"
            status="Ativa"
          />
        </div>
      </ConfigCard>

      <ConfigCard title="Sessões ativas" class="gap-[6px]!">
        <div>
          <ConfigListItem
            v-for="session in sessions"
            :key="session.id"
            :icon="session.device.includes('iPhone') ? 'smartphone' : 'laptop_mac'"
            :title="session.device"
            :description="session.detail"
            :status="session.current ? 'Este dispositivo' : ''"
            :action="session.current ? '' : 'Encerrar'"
            @action="endSession(session.id)"
          />
          <p
            v-if="!sessions.length"
            class="py-[10px] text-[12px] leading-normal text-(--text-muted)"
          >
            Nenhuma outra sessão ativa.
          </p>
        </div>
      </ConfigCard>
    </div>
  </div>
</template>
