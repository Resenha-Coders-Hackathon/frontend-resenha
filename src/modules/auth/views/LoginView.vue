<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { BaseButton } from '@/shared/components'
import { AuthField, AuthSplitLayout, GoogleButton } from '../components'
import { login, loginWithGoogle } from '../services'
import { useAuthFlowStore } from '../stores'

const router = useRouter()
const authFlow = useAuthFlowStore()
const email = ref('')
const password = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')
const isGoogleSubmitting = ref(false)
const googleErrorMessage = ref('')

async function handleSubmit() {
  errorMessage.value = ''
  isSubmitting.value = true

  try {
    await login({ email: email.value.trim(), password: password.value })
    toast.success('Que bom ter você de volta!')
    await router.push({ name: 'Home' })
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível entrar. Tente novamente.'
  } finally {
    isSubmitting.value = false
  }
}

async function handleGoogleCredential(credential: string) {
  if (isGoogleSubmitting.value) return

  googleErrorMessage.value = ''
  isGoogleSubmitting.value = true

  try {
    await loginWithGoogle(credential)
    authFlow.clear()
    toast.success('Você entrou com sua conta Google.')
    await router.push({ name: 'Home' })
  } catch (error) {
    googleErrorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível entrar com Google.'
  } finally {
    isGoogleSubmitting.value = false
  }
}
</script>

<template>
  <AuthSplitLayout>
    <h1 class="text-[38px]! leading-[46px]! tracking-[-0.03em]!">Bem-vindo de volta</h1>
    <p class="mt-[8px] text-[16px] text-(--text-secondary) dark:text-(--text-inverse-muted)">
      Entre na sua conta para continuar.
    </p>

    <form class="mt-[32px] flex flex-col gap-[20px]" @submit.prevent="handleSubmit">
      <AuthField
        id="login-email"
        v-model="email"
        label="E-mail"
        icon="mail"
        type="email"
        name="email"
        autocomplete="username"
        placeholder="voce@email.com"
        required
      />

      <AuthField
        id="login-password"
        v-model="password"
        label="Senha"
        icon="lock"
        type="password"
        name="password"
        autocomplete="current-password"
        placeholder="••••••••"
        required
      >
        <template #after>
          <div class="mt-[12px] flex justify-end leading-[20px]">
            <RouterLink :to="{ name: 'ForgotPassword' }" class="auth-link text-[14px]">
              Esqueceu sua senha?
            </RouterLink>
          </div>
        </template>
      </AuthField>

      <p v-if="errorMessage" role="alert" class="auth-error">{{ errorMessage }}</p>

      <BaseButton
        type="submit"
        label="Entrar"
        :loading="isSubmitting"
        :disabled="isGoogleSubmitting"
        class="auth-submit"
      />
    </form>

    <div class="my-[24px] flex items-center gap-[16px] text-[13px] text-(--text-muted)">
      <span class="h-px flex-1 bg-(--border-default) dark:bg-(--border-inverse)"></span>
      <span>ou</span>
      <span class="h-px flex-1 bg-(--border-default) dark:bg-(--border-inverse)"></span>
    </div>

    <GoogleButton @credential="handleGoogleCredential" />
    <p v-if="googleErrorMessage" role="alert" class="auth-error mt-[12px]">
      {{ googleErrorMessage }}
    </p>

    <p class="mt-[32px] text-[15px] text-(--text-secondary) dark:text-(--text-inverse-muted)">
      Não tem uma conta?
      <RouterLink :to="{ name: 'Register' }" class="auth-link">Criar conta</RouterLink>
    </p>
  </AuthSplitLayout>
</template>
