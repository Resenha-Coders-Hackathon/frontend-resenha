<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { BaseButton, BaseSwitch } from '@/shared/components'
import { useAuthNavigation } from '../composables'
import { AuthAside, AuthField, AuthSplitLayout, GoogleButton } from '../components'
import { useAuthSwap } from '../composables'
import { requestRegistrationCode } from '../services'
import { useAuthFlowStore, useAuthStore } from '../stores'

const router = useRouter()
const route = useRoute()
const navigation = useAuthNavigation()
const auth = useAuthStore()
const authFlow = useAuthFlowStore()
const { swapTo } = useAuthSwap()
const name = ref(authFlow.name)
// vindo de um convite, o e-mail convidado já vem preenchido
const email = ref(
  authFlow.email || (typeof route.query.email === 'string' ? route.query.email : ''),
)
const password = ref(authFlow.password)
const acceptedTerms = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')
const isGoogleSubmitting = ref(false)
const googleErrorMessage = ref('')

async function handleSubmit() {
  errorMessage.value = ''
  if (!acceptedTerms.value) {
    errorMessage.value = 'Aceite os Termos de uso e a Política de privacidade para continuar.'
    return
  }
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
    await router.push(navigation.to('RegisterCode'))
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
  isGoogleSubmitting.value = true

  try {
    await auth.signInWithGoogle(credential)
    authFlow.clear()
    toast.success('Você entrou com sua conta Google.')
    await router.push(navigation.destination.value)
  } catch (error) {
    googleErrorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível continuar com Google.'
  } finally {
    isGoogleSubmitting.value = false
  }
}
</script>

<template>
  <section class="grid min-w-0 lg:grid-cols-[36vw_minmax(0,1fr)]">
    <AuthAside side="left" />
    <AuthSplitLayout compact>
      <h1 class="text-[38px]! leading-11.5! tracking-[-0.03em]!">
        Crie sua <span class="text-(--accent-orange)">conta</span>
      </h1>
      <p class="mt-2 text-[16px] text-(--text-secondary) dark:text-(--text-inverse-muted)">
        Organize seus projetos e avance junto com seu time.
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

        <BaseSwitch
          v-model="acceptedTerms"
          label="Aceito os Termos de uso e a Política de privacidade"
          class="mt-0!"
        />

        <p v-if="errorMessage" role="alert" class="auth-error">{{ errorMessage }}</p>

        <BaseButton
          type="submit"
          label="Criar conta"
          :loading="isSubmitting"
          :disabled="isGoogleSubmitting"
          class="auth-submit auth-primary-submit"
        />
      </form>

      <div class="my-3 flex items-center gap-4 text-[13px] leading-5 text-(--text-muted)">
        <span class="h-px flex-1 bg-(--border-default) dark:bg-(--border-inverse)"></span>
        <span>ou</span>
        <span class="h-px flex-1 bg-(--border-default) dark:bg-(--border-inverse)"></span>
      </div>

      <GoogleButton button-text="signup_with" @credential="handleGoogleCredential" />
      <p class="mt-2 text-center text-[12px] leading-4.5 text-(--text-muted)">
        Ao continuar com o Google, você aceita os Termos de uso e a Política de privacidade.
      </p>
      <p v-if="googleErrorMessage" role="alert" class="auth-error mt-3">
        {{ googleErrorMessage }}
      </p>

      <p
        class="mt-4 text-center text-[15px] text-(--text-secondary) dark:text-(--text-inverse-muted)"
      >
        Já tem uma conta?
        <a
          :href="router.resolve(navigation.to('Login')).href"
          class="auth-link auth-link--accent"
          @click.prevent="swapTo(navigation.to('Login'))"
          >Entrar</a
        >
      </p>
    </AuthSplitLayout>
  </section>
</template>
