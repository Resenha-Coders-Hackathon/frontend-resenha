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
          class="auth-submit auth-primary-submit"
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

  <Teleport to="body">
    <Transition name="login-wipe">
      <div
        v-if="isSubmitting || isGoogleSubmitting"
        class="fixed inset-0 z-[100] grid min-h-dvh place-items-center overflow-hidden bg-black px-6 text-center"
        role="status"
        aria-live="polite"
        aria-label="Entrando no sistema"
      >
        <div
          class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,122,15,0.08),transparent_48%)]"
          aria-hidden="true"
        ></div>

        <div class="login-loader-content relative flex w-full max-w-sm flex-col items-center">
          <img src="/wordmark-inverse.svg" alt="ResenhaCoders" class="mb-12 w-56" />

          <div class="relative mb-7 grid size-14 place-items-center" aria-hidden="true">
            <span class="absolute inset-0 rounded-full border border-white/10"></span>
            <span
              class="login-loader-spinner absolute inset-0 rounded-full border-[3px] border-transparent border-t-(--accent-orange) border-r-(--accent-orange)"
            ></span>
            <span class="absolute inset-2 rounded-full border border-(--accent-orange)/20"></span>
            <span
              class="size-2.5 animate-pulse rounded-full bg-(--accent-orange) shadow-[0_0_18px_rgba(255,122,15,0.7)]"
            ></span>
          </div>

          <p
            class="flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] text-(--accent-orange) uppercase"
          >
            <span class="size-1.5 animate-pulse rounded-full bg-(--accent-orange)"></span>
            Acesso seguro
          </p>
          <h2 class="mt-3 text-[22px] leading-7 font-semibold text-white">
            Preparando seu <span class="text-(--accent-orange)">espaço</span>
          </h2>
          <p class="mt-2 max-w-xs text-[14px] leading-6 text-white/55">
            Estamos confirmando seu acesso e carregando seu ambiente de trabalho.
          </p>
          <div
            class="login-loader-progress relative mt-8 h-1 w-36 overflow-hidden rounded-full bg-white/10"
            aria-hidden="true"
          >
            <span
              class="login-loader-progress-bar absolute inset-y-0 left-0 w-1/3 rounded-full bg-(--accent-orange)"
            ></span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.login-wipe-enter-active {
  transition: clip-path 560ms cubic-bezier(0.76, 0, 0.24, 1);
}

.login-wipe-enter-from {
  clip-path: inset(0 0 0 100%);
}

.login-wipe-enter-to {
  clip-path: inset(0);
}

.login-wipe-leave-active {
  transition: opacity 180ms ease-out;
}

.login-wipe-leave-to {
  opacity: 0;
}

.login-wipe-enter-active .login-loader-content {
  animation: login-loader-appear 320ms ease-out 380ms both;
}

.login-loader-spinner {
  animation: login-loader-spin 1.1s linear infinite;
}

.login-loader-progress-bar {
  animation: login-loader-progress 1.5s ease-in-out infinite;
}

@keyframes login-loader-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes login-loader-progress {
  from {
    transform: translateX(-140%);
  }

  to {
    transform: translateX(440%);
  }
}

@keyframes login-loader-appear {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .login-wipe-enter-active,
  .login-wipe-leave-active {
    transition-duration: 1ms;
  }

  .login-wipe-enter-active .login-loader-content {
    animation-duration: 1ms;
    animation-delay: 0ms;
  }

  .login-loader-spinner,
  .login-loader-progress-bar {
    animation: none;
  }

  .login-loader-progress-bar {
    width: 100%;
  }
}
</style>
