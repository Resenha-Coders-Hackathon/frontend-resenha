<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { BaseButton } from '@/shared/components'
import { AuthSplitLayout, CodeInput } from '../components'
import {
  confirmRegistration,
  requestPasswordReset,
  requestRegistrationCode,
  verifyPasswordReset,
} from '../services'
import { useAuthFlowStore } from '../stores'

const RESEND_SECONDS = 45

const props = defineProps<{ flow: 'register' | 'reset' }>()

const router = useRouter()
const authFlow = useAuthFlowStore()
const code = ref('')
const isSubmitting = ref(false)
const isResending = ref(false)
const errorMessage = ref('')
const secondsLeft = ref(RESEND_SECONDS)
let timer: ReturnType<typeof setInterval> | undefined

const isComplete = computed(() => /^\d{6}$/.test(code.value))
const countdown = computed(() => `00:${String(secondsLeft.value).padStart(2, '0')}`)

if (!authFlow.email) {
  router.replace({ name: props.flow === 'register' ? 'Register' : 'ForgotPassword' })
}

function startTimer() {
  secondsLeft.value = RESEND_SECONDS
  clearInterval(timer)
  timer = setInterval(() => {
    secondsLeft.value -= 1
    if (secondsLeft.value <= 0) clearInterval(timer)
  }, 1000)
}

async function handleSubmit() {
  if (!isComplete.value) {
    errorMessage.value = 'Digite os 6 dígitos do código.'
    return
  }
  errorMessage.value = ''
  isSubmitting.value = true

  try {
    if (props.flow === 'register') {
      await confirmRegistration({
        email: authFlow.email,
        code: code.value,
        name: authFlow.name,
        password: authFlow.password,
      })
      authFlow.clear()
      toast.success('Conta criada! Agora você já pode entrar.')
      await router.push({ name: 'Login' })
      return
    }

    await verifyPasswordReset({ email: authFlow.email, code: code.value })
    authFlow.resetCode = code.value
    await router.push({ name: 'ResetPassword' })
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível validar o código.'
  } finally {
    isSubmitting.value = false
  }
}

async function resendCode() {
  errorMessage.value = ''
  isResending.value = true

  try {
    const payload = { email: authFlow.email }
    await (props.flow === 'register'
      ? requestRegistrationCode(payload)
      : requestPasswordReset(payload))
    code.value = ''
    toast.success('Enviamos um novo código para o seu e-mail.')
    startTimer()
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível reenviar o código.'
  } finally {
    isResending.value = false
  }
}

onMounted(startTimer)
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <AuthSplitLayout>
    <div
      v-if="props.flow === 'register'"
      class="mb-6 flex items-center gap-3 text-[13px] font-medium"
      aria-label="Etapa 2 de 2"
    >
      <span class="inline-flex items-center gap-2 text-(--text-muted)">
        <span
          class="grid size-6 place-items-center rounded-full bg-(--bg-subtle) text-[12px] dark:bg-black/30"
          >1</span
        >
        Dados
      </span>
      <span class="h-px w-6 bg-(--border-default) dark:bg-(--border-inverse)"></span>
      <span class="inline-flex items-center gap-2" aria-current="step">
        <span
          class="grid size-6 place-items-center rounded-full bg-(--surface-inverse) text-[12px] text-(--text-inverse) dark:bg-(--surface) dark:text-(--text-primary)"
          >2</span
        >
        Validação
      </span>
    </div>

    <h1 class="text-[38px]! leading-11.5! tracking-[-0.03em]!">
      {{ props.flow === 'register' ? 'Validação em duas etapas' : 'Confirme seu e-mail' }}
    </h1>
    <p
      class="mt-2 text-[16px] leading-6.5 text-(--text-secondary) dark:text-(--text-inverse-muted)"
    >
      {{
        props.flow === 'register'
          ? 'Para concluir seu cadastro, digite o código de 6 dígitos enviado para'
          : 'Digite o código de 6 dígitos enviado para'
      }}
      <span class="font-semibold text-(--text-primary) dark:text-(--text-inverse)">{{
        authFlow.email
      }}</span
      >.
    </p>

    <form class="mt-8 flex flex-col gap-5" @submit.prevent="handleSubmit">
      <CodeInput v-model="code" :disabled="isSubmitting" />

      <p v-if="errorMessage" role="alert" class="auth-error">{{ errorMessage }}</p>

      <BaseButton
        type="submit"
        :label="props.flow === 'register' ? 'Validar e criar conta' : 'Verificar código'"
        :loading="isSubmitting"
        class="auth-submit"
      />
    </form>

    <p
      class="mt-6 text-center text-[14px] leading-5 text-(--text-secondary) dark:text-(--text-inverse-muted)"
      aria-live="polite"
    >
      <template v-if="secondsLeft > 0">
        Reenviar código em
        <span class="font-semibold text-(--text-primary) tabular-nums dark:text-(--text-inverse)">{{
          countdown
        }}</span>
      </template>
      <template v-else>
        Não recebeu?
        <button
          type="button"
          class="auth-link cursor-pointer disabled:cursor-wait disabled:opacity-60"
          :disabled="isResending"
          @click="resendCode"
        >
          Reenviar código
        </button>
      </template>
    </p>

    <p class="mt-6 text-[14px] text-(--text-secondary) dark:text-(--text-inverse-muted)">
      E-mail incorreto?
      <RouterLink
        :to="{ name: props.flow === 'register' ? 'Register' : 'ForgotPassword' }"
        class="auth-link"
      >
        Corrigir e-mail
      </RouterLink>
    </p>
  </AuthSplitLayout>
</template>
