<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { BaseButton } from '@/shared/components'
import { AuthField, AuthSplitLayout, GoogleButton } from '../components'
import { requestRegistrationCode } from '../services'
import { useAuthFlowStore, useAuthStore } from '../stores'

const router = useRouter()
const auth = useAuthStore()
const authFlow = useAuthFlowStore()
const name = ref(authFlow.name)
const email = ref(authFlow.email)
const password = ref(authFlow.password)
const acceptedTerms = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')
const isGoogleSubmitting = ref(false)
const googleErrorMessage = ref('')

async function handleSubmit() {
  errorMessage.value = ''
  isSubmitting.value = true

  try {
    const normalizedEmail = email.value.trim()
    await requestRegistrationCode({ email: normalizedEmail })
    authFlow.startRegistration({
      email: normalizedEmail,
      name: name.value.trim(),
      password: password.value,
    })
    toast.success('Enviamos um código para o seu e-mail.')
    await router.push({ name: 'RegisterCode' })
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível concluir o cadastro.'
  } finally {
    isSubmitting.value = false
  }
}

async function handleGoogleCredential(credential: string) {
  if (isGoogleSubmitting.value) return

  googleErrorMessage.value = ''
  if (!acceptedTerms.value) {
    googleErrorMessage.value = 'Aceite os Termos de uso e a Política de privacidade para continuar.'
    return
  }

  isGoogleSubmitting.value = true

  try {
    await auth.signInWithGoogle(credential)
    authFlow.clear()
    toast.success('Você entrou com sua conta Google.')
    await router.push({ name: 'Home' })
  } catch (error) {
    googleErrorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível continuar com Google.'
  } finally {
    isGoogleSubmitting.value = false
  }
}
</script>

<template>
  <AuthSplitLayout compact>
    <h1 class="text-[34px]! leading-10! tracking-[-0.03em]!">Crie sua conta</h1>
    <p
      class="mt-1 text-[15px] leading-5.5 text-(--text-secondary) dark:text-(--text-inverse-muted)"
    >
      Comece grátis. Leva menos de um minuto.
    </p>

    <form class="mt-4 flex flex-col gap-3" @submit.prevent="handleSubmit">
      <AuthField
        id="register-name"
        v-model="name"
        label="Nome completo"
        icon="person"
        name="name"
        autocomplete="name"
        placeholder="Seu nome"
        maxlength="255"
        required
      />

      <AuthField
        id="register-email"
        v-model="email"
        label="E-mail"
        icon="mail"
        type="email"
        name="email"
        autocomplete="email"
        placeholder="voce@email.com"
        required
      />

      <AuthField
        id="register-password"
        v-model="password"
        label="Senha"
        icon="lock"
        type="password"
        name="password"
        autocomplete="new-password"
        placeholder="Crie uma senha"
        minlength="9"
        hint="Mínimo de 9 caracteres, sem ser só números."
        required
      />

      <label class="flex cursor-pointer items-center gap-3 text-[15px] leading-5">
        <input
          v-model="acceptedTerms"
          type="checkbox"
          required
          class="size-5 shrink-0 cursor-pointer accent-(--surface-inverse) dark:accent-(--surface)"
        />
        Aceito os Termos de uso e a Política de privacidade
      </label>

      <p v-if="errorMessage" role="alert" class="auth-error">{{ errorMessage }}</p>

      <BaseButton
        type="submit"
        label="Criar conta"
        :loading="isSubmitting"
        :disabled="isGoogleSubmitting"
        class="auth-submit"
      />
    </form>

    <div class="my-3 flex items-center gap-4 text-[13px] leading-5 text-(--text-muted)">
      <span class="h-px flex-1 bg-(--border-default) dark:bg-(--border-inverse)"></span>
      <span>ou</span>
      <span class="h-px flex-1 bg-(--border-default) dark:bg-(--border-inverse)"></span>
    </div>

    <GoogleButton button-text="signup_with" @credential="handleGoogleCredential" />
    <p v-if="googleErrorMessage" role="alert" class="auth-error mt-3">
      {{ googleErrorMessage }}
    </p>

    <p class="mt-4 text-[14px] leading-5 text-(--text-secondary) dark:text-(--text-inverse-muted)">
      Já tem uma conta?
      <RouterLink to="/entrar" class="auth-link">Entrar</RouterLink>
    </p>
  </AuthSplitLayout>
</template>
