<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth'
import { OrganizationLayout } from '@/modules/organizations'
import { BaseButton } from '@/shared/components'
import { acceptInvitation } from '../services'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const loading = ref(true)
const saving = ref(false)
const acceptedOrganizationId = ref('')
const error = ref('')
const connectionError = ref(false)
const token = computed(() => (typeof route.query.token === 'string' ? route.query.token : ''))
const validToken = computed(() => !!token.value && token.value.length <= 128)
const authTarget = (name: string) => ({ name, query: { redirect: route.fullPath } })

async function loadSession() {
  acceptedOrganizationId.value = ''
  loading.value = true
  error.value = ''
  connectionError.value = false
  if (!validToken.value) {
    loading.value = false
    return
  }
  try {
    await auth.loadUser()
  } catch {
    connectionError.value = true
    error.value = 'Não foi possível verificar sua sessão. Confira a conexão e tente novamente.'
  } finally {
    loading.value = false
  }
}
async function accept() {
  if (saving.value || !validToken.value || !auth.user) return
  saving.value = true
  error.value = ''
  try {
    const result = await acceptInvitation(token.value)
    acceptedOrganizationId.value = result.organization_id
    await router.replace({
      name: 'OrganizationMembers',
      params: { organizationId: result.organization_id },
    })
  } catch {
    error.value =
      'Não foi possível aceitar. Confira a conexão e se está usando o e-mail convidado. O convite também pode ter expirado, sido revogado ou já utilizado.'
  } finally {
    saving.value = false
  }
}
async function changeAccount() {
  saving.value = true
  error.value = ''
  try {
    await auth.signOut()
    await router.replace(authTarget('Login'))
  } catch {
    error.value = 'Não foi possível sair da conta. Confira a conexão e tente novamente.'
  } finally {
    saving.value = false
  }
}
watch(token, loadSession, { immediate: true })
</script>

<template>
  <OrganizationLayout title="Convite">
    <section class="workspace-card invitation-accept" aria-labelledby="accept-title">
      <span class="workspace-eyebrow">Você recebeu um convite</span>
      <h1 id="accept-title">Seu próximo espaço de trabalho</h1>
      <p v-if="!validToken">
        Este link está incompleto ou é inválido. Abra o link completo do e-mail de convite.
      </p>
      <p v-else-if="loading" role="status">Verificando sua sessão…</p>
      <template v-else-if="acceptedOrganizationId">
        <p>Convite aceito! Você já participa da organização.</p>
        <RouterLink
          :to="{ name: 'OrganizationMembers', params: { organizationId: acceptedOrganizationId } }"
          class="workspace-link-button"
          >Abrir organização</RouterLink
        >
      </template>
      <template v-else-if="!connectionError">
        <template v-if="auth.user"
          ><p>
            Você está usando <strong>{{ auth.user.email }}</strong
            >. Para participar, esta conta precisa usar o mesmo e-mail que recebeu o convite.
          </p>
          <div class="workspace-actions">
            <BaseButton
              label="Aceitar convite"
              :loading="saving"
              :full-width="false"
              @click="accept"
            /><BaseButton
              label="Usar outra conta"
              variant="secondary"
              :disabled="saving"
              :full-width="false"
              @click="changeAccount"
            /></div
        ></template>
        <template v-else
          ><p>
            Entre ou crie sua conta com o e-mail que recebeu o convite. Depois, você poderá
            confirmar sua participação na organização.
          </p>
          <div class="workspace-actions">
            <RouterLink :to="authTarget('Login')" class="workspace-link-button"
              >Já tenho conta</RouterLink
            ><RouterLink :to="authTarget('Register')" class="workspace-link-button secondary"
              >Criar minha conta</RouterLink
            >
          </div>
          <p class="workspace-muted">
            Você também pode usar o Google nas telas de acesso.
          </p></template
        >
      </template>
      <p v-if="error" role="alert" class="workspace-error">{{ error }}</p>
      <BaseButton
        v-if="connectionError"
        label="Tentar novamente"
        :full-width="false"
        @click="loadSession"
      />
    </section>
  </OrganizationLayout>
</template>
