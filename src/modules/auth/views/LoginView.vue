<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { BaseButton } from '@/shared/components'
import { AuthAside, AuthField, AuthSplitLayout, GoogleButton } from '../components'
import { useAuthSwap } from '../composables'
import { useAuthFlowStore, useAuthStore } from '../stores'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const authFlow = useAuthFlowStore()
const { swapTo } = useAuthSwap()
const email = ref('')
const password = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')
const isGoogleSubmitting = ref(false)
const googleErrorMessage = ref('')

// só aceita caminhos internos, para o ?redirect= não virar open redirect
function redirectTarget(): string {
  const target = route.query.redirect
  return typeof target === 'string' && /^\/(?!\/)/.test(target) ? target : '/'
}

async function handleSubmit() {
  errorMessage.value = ''
  isSubmitting.value = true

  try {
    await auth.signIn({ email: email.value.trim(), password: password.value })
    toast.success('Que bom ter você de volta!')
    await router.push(redirectTarget())
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
    await auth.signInWithGoogle(credential)
    authFlow.clear()
    toast.success('Você entrou com sua conta Google.')
    await router.push(redirectTarget())
  } catch (error) {
    googleErrorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível entrar com Google.'
  } finally {
    isGoogleSubmitting.value = false
  }
}
</script>

<template>
  <section class="grid lg:grid-cols-[minmax(0,1fr)_36vw]">
    <AuthSplitLayout>
      <h1 class="text-[38px]! leading-11.5! tracking-[-0.03em]!">Bem-vindo de volta</h1>
      <p class="mt-2 text-[16px] text-(--text-secondary) dark:text-(--text-inverse-muted)">
        Entre na sua conta para continuar.
      </p>

      <form class="mt-8 flex flex-col gap-5" @submit.prevent="handleSubmit">
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
            <div class="mt-3 flex justify-end leading-5">
              <RouterLink to="/esqueci-senha" class="auth-link text-[14px]">
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

      <div class="my-6 flex items-center gap-4 text-[13px] text-(--text-muted)">
        <span class="h-px flex-1 bg-(--border-default) dark:bg-(--border-inverse)"></span>
        <span>ou</span>
        <span class="h-px flex-1 bg-(--border-default) dark:bg-(--border-inverse)"></span>
      </div>

      <GoogleButton @credential="handleGoogleCredential" />
      <p v-if="googleErrorMessage" role="alert" class="auth-error mt-3">
        {{ googleErrorMessage }}
      </p>

      <p class="mt-8 text-[15px] text-(--text-secondary) dark:text-(--text-inverse-muted)">
        Não tem uma conta?
        <a href="/registrar" class="auth-link" @click.prevent="swapTo({ name: 'Register' })">
          Criar conta
        </a>
      </p>
    </AuthSplitLayout>
    <AuthAside side="right" />
  </section>
</template>
