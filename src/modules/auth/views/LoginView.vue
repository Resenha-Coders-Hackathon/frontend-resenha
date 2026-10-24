<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { useAuthNavigation } from '../composables'
import { BaseButton } from '@/shared/components'
import { AuthAside, AuthField, AuthSplitLayout, GoogleButton } from '../components'
import { useAuthSwap } from '../composables'
import { useAuthFlowStore, useAuthStore } from '../stores'

const router = useRouter()
const route = useRoute()
const navigation = useAuthNavigation()
const auth = useAuthStore()
const authFlow = useAuthFlowStore()
const { swapTo } = useAuthSwap()
// vindo de um convite, o e-mail convidado já vem preenchido
const email = ref(typeof route.query.email === 'string' ? route.query.email : '')
const password = ref('')
const isSubmitting = ref(false)
const rememberMe = ref(false)
const errorMessage = ref('')
const isGoogleSubmitting = ref(false)
const googleErrorMessage = ref('')

async function handleSubmit() {
  errorMessage.value = ''
  isSubmitting.value = true

  try {
    await auth.signIn({ email: email.value.trim(), password: password.value })
    authFlow.clear()
    toast.success('Que bom ter você de volta!')
    await router.push(navigation.afterLogin.value)
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
    await router.push(navigation.afterLogin.value)
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
      <p
        class="mb-3 flex items-center gap-2 text-[11px] leading-4 font-semibold tracking-[0.14em] text-(--text-muted) uppercase"
      >
        <span
          class="size-2 rounded-full bg-(--accent-orange) shadow-[0_0_12px_var(--accent-orange)]"
          aria-hidden="true"
        ></span>
        Seu espaço de trabalho
      </p>
      <h1 class="text-[38px]! leading-11.5! tracking-[-0.03em]!">
        Bem-vindo <span class="text-(--accent-orange)">de volta</span>
      </h1>
      <p class="mt-2 text-[16px] text-(--text-secondary) dark:text-(--text-inverse-muted)">
        Entre para continuar seus projetos com o time.
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
            <div class="mt-3 flex items-center justify-between gap-3 leading-5">
              <label
                for="login-remember"
                class="flex cursor-pointer items-center gap-2 text-[13px]"
              >
                <input
                  id="login-remember"
                  v-model="rememberMe"
                  type="checkbox"
                  class="size-3.5 cursor-pointer accent-(--accent-orange) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-orange)"
                />
                <span class="text-(--text-secondary) dark:text-(--text-inverse-muted)">
                  Lembrar de mim
                </span>
              </label>
              <RouterLink
                :to="navigation.to('ForgotPassword')"
                class="auth-link auth-link--accent text-[14px]"
              >
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

      <p
        class="mt-8 text-center text-[15px] text-(--text-secondary) dark:text-(--text-inverse-muted)"
      >
        Não tem uma conta?
        <a
          :href="router.resolve(navigation.to('Register')).href"
          class="auth-link auth-link--accent"
          @click.prevent="swapTo(navigation.to('Register'))"
          >Criar conta</a
        >
      </p>
    </AuthSplitLayout>
    <AuthAside side="right" />
  </section>
</template>
