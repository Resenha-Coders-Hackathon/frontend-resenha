<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { AuthCardLayout, AuthField, CodeInput, useAuthStore } from '@/modules/auth'
import { getErrorMessage } from '@/app/plugins/axios'
import { BaseButton } from '@/shared/components'
import { requestEmailChange, verifyEmailChange, confirmEmailChange } from '../services'

const router = useRouter()
const auth = useAuthStore()
const step = ref<'request' | 'verify' | 'confirm' | 'done'>('request')
const email = ref('')
const code = ref('')
const password = ref('')
const busy = ref(false)
const error = ref('')

async function submit(): Promise<void> {
  if (busy.value || step.value === 'done') return
  busy.value = true
  error.value = ''
  try {
    if (step.value === 'request') {
      const address = email.value.trim()
      if (!/^\S+@\S+\.\S+$/.test(address) || address === auth.user?.email) {
        throw new Error('Informe um novo e-mail válido.')
      }
      await requestEmailChange(address)
      email.value = address
      step.value = 'verify'
    } else if (step.value === 'verify') {
      if (!/^\d{6}$/.test(code.value)) throw new Error('Digite os 6 dígitos do código.')
      await verifyEmailChange(code.value)
      step.value = 'confirm'
    } else {
      if (!password.value) throw new Error('Informe sua senha atual.')
      await confirmEmailChange(code.value, password.value)
      // Do not repeat a successful confirmation if navigation fails.
      if (auth.user) auth.user = { ...auth.user, email: email.value }
      password.value = ''
      code.value = ''
      step.value = 'done'
      toast.success('E-mail alterado.')
      await router.push({ name: 'Configurações' })
    }
  } catch (cause) {
    error.value = getErrorMessage(cause, 'Não foi possível concluir a alteração de e-mail.')
  } finally {
    busy.value = false
    if (step.value === 'confirm') password.value = ''
  }
}

function restart(): void {
  step.value = 'request'
  code.value = ''
  password.value = ''
  error.value = ''
}

onBeforeUnmount(() => {
  password.value = ''
  code.value = ''
})
</script>

<template>
  <section class="mx-auto w-full max-w-xl px-4 py-10">
    <AuthCardLayout icon="mail" title="Alterar e-mail">
      <template #description>
        Confirme o código enviado ao novo endereço e sua senha atual. Contas sem senha devem definir
        uma pelo fluxo de recuperação antes de continuar.
      </template>
      <form class="flex flex-col gap-5" @submit.prevent="submit">
        <fieldset :disabled="busy" class="flex min-w-0 flex-col gap-5">
          <AuthField
            v-if="step === 'request'"
            id="new-email"
            v-model="email"
            label="Novo e-mail"
            icon="mail"
            type="email"
            autocomplete="email"
            required
          />
          <template v-else-if="step === 'verify'">
            <p>Digite o código enviado para {{ email }}.</p>
            <CodeInput v-model="code" :disabled="busy" />
          </template>
          <AuthField
            v-else-if="step === 'confirm'"
            id="email-password"
            v-model="password"
            label="Senha atual"
            icon="lock"
            type="password"
            autocomplete="current-password"
            required
          />
          <p v-else role="status">E-mail alterado com sucesso.</p>
          <p v-if="error" role="alert" class="auth-error">{{ error }}</p>
          <BaseButton
            v-if="step !== 'done'"
            type="submit"
            :label="
              step === 'request'
                ? 'Enviar código'
                : step === 'verify'
                  ? 'Verificar código'
                  : 'Confirmar novo e-mail'
            "
            :loading="busy"
          />
          <button
            v-if="step === 'verify' || step === 'confirm'"
            type="button"
            class="underline"
            @click="restart"
          >
            Corrigir e-mail ou solicitar outro código
          </button>
          <RouterLink :to="{ name: 'Configurações' }" class="underline"
            >Voltar às configurações</RouterLink
          >
        </fieldset>
      </form>
    </AuthCardLayout>
  </section>
</template>
