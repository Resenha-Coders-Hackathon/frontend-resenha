<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { useAuthNavigation } from '../composables'
import { BaseButton } from '@/shared/components'
import { AuthCardLayout, AuthField } from '../components'
import { confirmPasswordReset } from '../services'
import { useAuthFlowStore, useAuthStore } from '../stores'

const STRENGTH_LABELS = [
  'Senha muito fraca',
  'Senha fraca',
  'Senha média',
  'Senha forte',
  'Senha muito forte',
]

const router = useRouter()
const navigation = useAuthNavigation()
const authFlow = useAuthFlowStore()
const password = ref('')
const confirmation = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')

if (!authFlow.email || !authFlow.resetCode) {
  router.replace(navigation.to('ForgotPassword'))
}

const strength = computed(() => {
  const value = password.value
  if (!value) return 0
  return [
    value.length >= 9,
    /[a-zA-Z]/.test(value) && /\d/.test(value),
    /[^a-zA-Z\d]/.test(value),
    value.length >= 12,
  ].filter(Boolean).length
})

async function handleSubmit() {
  errorMessage.value = ''

  if (password.value !== confirmation.value) {
    errorMessage.value = 'As senhas não coincidem.'
    return
  }

  isSubmitting.value = true

  try {
    await confirmPasswordReset({
      email: authFlow.email,
      code: authFlow.resetCode,
      new_password: password.value,
    })
    authFlow.clear()
    useAuthStore().user = null
    useAuthStore().sessions = []
    toast.success('Senha redefinida! Entre com a nova senha.')
    await router.push(navigation.to('Login'))
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível redefinir a senha.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section>
    <AuthCardLayout icon="shield" title="Defina uma nova senha">
      <template #description>
        Use pelo menos 9 caracteres, combinando letras, números e símbolos.
      </template>

      <form class="flex flex-col gap-5" @submit.prevent="handleSubmit">
        <AuthField
          id="reset-password"
          v-model="password"
          label="Nova senha"
          icon="lock"
          type="password"
          name="new-password"
          autocomplete="new-password"
          placeholder="••••••••"
          minlength="9"
          required
        >
          <template #after>
            <div class="mt-4 grid grid-cols-4 gap-1.5" aria-hidden="true">
              <span
                v-for="bar in 4"
                :key="bar"
                :class="[
                  'h-1 rounded-full transition-colors',
                  bar <= strength
                    ? 'bg-(--surface-inverse) dark:bg-(--surface)'
                    : 'bg-(--bg-muted) dark:bg-(--border-inverse)',
                ]"
              ></span>
            </div>
            <p
              class="mt-2 text-[12px] leading-4 text-(--text-secondary) dark:text-(--text-inverse-muted)"
              aria-live="polite"
            >
              {{ password ? STRENGTH_LABELS[strength] : 'Força da senha' }}
            </p>
          </template>
        </AuthField>

        <AuthField
          id="reset-password-confirmation"
          v-model="confirmation"
          label="Confirmar nova senha"
          icon="lock"
          type="password"
          name="new-password-confirmation"
          autocomplete="new-password"
          placeholder="••••••••"
          required
        />

        <p v-if="errorMessage" role="alert" class="auth-error">{{ errorMessage }}</p>

        <BaseButton
          type="submit"
          label="Redefinir senha"
          :loading="isSubmitting"
          class="auth-submit"
        />
      </form>
    </AuthCardLayout>
  </section>
</template>
