<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { GoogleButton } from '../components'
import { useAuthStore } from '../stores'
import { loginWithGoogle } from '../services'
import { BaseInput, PasswordInput, SegmentedControl, BaseButton } from '@/shared/components'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const email = ref('')
const password = ref('')
const isLoading = ref(false)

async function handleLogin(): Promise<void> {
  if (!email.value || !password.value) {
    toast.error('Informe e-mail e senha.')
    return
  }

  isLoading.value = true
  try {
    await auth.signIn({ email: email.value, password: password.value })
    toast.success('Login realizado com sucesso.')
    const redirect = String(route.query.redirect ?? '')
    // só caminhos internos, para não virar open redirect
    await router.push(redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/notificacoes')
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Não foi possível entrar.')
  } finally {
    isLoading.value = false
  }
}
async function handleGoogleLogin(credential: string): Promise<void> {
  if (isLoading.value) return
  isLoading.value = true
  try {
    await loginWithGoogle(credential)
    const user = await auth.loadUser()
    if (!user) throw new Error('O backend não confirmou a sessão. Verifique os cookies de autenticação.')
    toast.success('Login com Google realizado com sucesso.')
    const redirect = String(route.query.redirect ?? '')
    await router.push(redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/notificacoes')
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Não foi possível entrar com Google.')
  } finally {
    isLoading.value = false
  }
}
const modelValue = ref('cliente')
const modes = [
  {
    value: 'cliente',
    label: 'Portal do Cliente / Embargador',
  },
  {
    value: 'operador',
    label: 'Operador / Transportador',
  },
]
</script>

<template>
  <section class="px-4 py-5 sm:px-6 sm:py-8 md:px-12 xl:px-20 mt-[20vw] lg:mt-[3vw]">
    <div
      class="mx-auto flex flex-col lg:flex-row lg:max-h-170 w-full max-w-8xl rounded-2xl overflow-hidden shadow-2xl"
    >
      <div
        style="
          background-image: url(/login.svg);
          background-repeat: no-repeat;
          background-size: cover;
          background-position: center;
        "
        class="flex flex-col justify-end w-full lg:w-[35%] min-h-64 lg:h-screen px-6 py-8 sm:px-10 sm:py-12 lg:px-10 lg:py-20 lg:justify-start"
      >
        <h2 class="text-3xl sm:text-4xl text-(--surface-container)">
          A logística inteligente
          <span
            class="bg-linear-to-r from-(--primary) to-(--primary-container) bg-clip-text text-transparent dark:to-(--primary-dark) dark:from-(--primary-container-dark)"
            >começa aqui.</span
          >
        </h2>
        <p class="text-(--surface-container) text-sm mt-4">
          Plataforma preditiva com telemetria avançada, governança de ponta a ponta e automação em
          tempo real para frotas e embarcadores de alta performance.
        </p>
      </div>

      <div
        class="lg:h-screen w-full lg:w-[65%] px-5 py-8 sm:px-10 sm:py-12 md:px-12 md:py-16 lg:px-40 lg:py-20 bg-(--surface-container) dark:bg-(--surface-dark)"
      >
        <h2 class="text-3xl sm:text-4xl">Bem-vindo de volta!</h2>
        <p class="mt-2 dark:text-(--on-surface-variant-dark)">
          Acesse seu workspace corporativo LogiFlow e gerencie suas operações.
        </p>

        <SegmentedControl v-model="modelValue" :options="modes" />

        <GoogleButton @credential="handleGoogleLogin" />

        <div class="relative flex items-center justify-center py-1 mt-8">
          <span
            class="w-full h-0.5 bg-(--surface-container-low) dark:bg-(--surface-container-low-dark)"
          />
          <p
            class="absolute px-3 py-1 bg-(--surface) dark:bg-(--surface-dark) text-xs text-on-surface-variant uppercase tracking-wider"
          >
            ou com e-mail
          </p>
        </div>

        <BaseInput v-model="email" label="E-mail" type="email" icon="alternate_email" />

        <PasswordInput v-model="password" label="Senha" icon="lock" />

        <BaseButton
          label="Entrar"
          icon="arrow_forward"
          icon-position="right"
          :loading="isLoading"
          :disabled="isLoading"
          @click="handleLogin"
        />
      </div>
    </div>
  </section>
</template>
