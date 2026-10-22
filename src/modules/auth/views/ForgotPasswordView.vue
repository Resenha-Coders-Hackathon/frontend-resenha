<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { BaseButton } from '@/shared/components'
import { AuthField, AuthSplitLayout } from '../components'
import { requestPasswordReset } from '../services'
import { useAuthFlowStore } from '../stores'

const router = useRouter()
const authFlow = useAuthFlowStore()
const email = ref(authFlow.email)
const isSubmitting = ref(false)
const errorMessage = ref('')

async function handleSubmit() {
  errorMessage.value = ''
  isSubmitting.value = true

  try {
    const normalizedEmail = email.value.trim()
    await requestPasswordReset({ email: normalizedEmail })
    authFlow.startPasswordReset(normalizedEmail)
    await router.push({ name: 'ResetCode' })
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível enviar o código.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <AuthSplitLayout>
    <h1 class="text-[38px]! leading-11.5! tracking-[-0.03em]!">Esqueceu sua senha?</h1>
    <p class="mt-2 text-[16px] text-(--text-secondary) dark:text-(--text-inverse-muted)">
      Sem problemas. Informe seu e-mail e enviaremos um código para você criar uma nova senha.
    </p>

    <form class="mt-8 flex flex-col gap-5" @submit.prevent="handleSubmit">
      <AuthField
        id="forgot-email"
        v-model="email"
        label="E-mail"
        icon="mail"
        type="email"
        name="email"
        autocomplete="email"
        placeholder="voce@email.com"
        required
      />

      <p v-if="errorMessage" role="alert" class="auth-error">{{ errorMessage }}</p>

      <BaseButton type="submit" label="Enviar código" :loading="isSubmitting" class="auth-submit" />
    </form>

    <p class="mt-8 text-[15px] text-(--text-secondary) dark:text-(--text-inverse-muted)">
      Lembrou sua senha?
      <RouterLink to="/entrar" class="auth-link">Voltar para o login</RouterLink>
    </p>
  </AuthSplitLayout>
</template>
