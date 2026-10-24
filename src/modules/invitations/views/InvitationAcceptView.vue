<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth'
import { OrganizationLayout, roleLabels, useOrganizationsStore } from '@/modules/organizations'
import { BaseButton } from '@/shared/components'
import { acceptInvitation, previewInvitation } from '../services'
import type { InvitePreview } from '../types'
import { inviteProblem, type InviteProblem } from '../utils/errors'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const organizations = useOrganizationsStore()
const loading = ref(true)
const saving = ref(false)
const preview = ref<InvitePreview | null>(null)
const problem = ref<InviteProblem | null>(null)
const token = computed(() => (typeof route.query.token === 'string' ? route.query.token : ''))
const validToken = computed(() => !!token.value && token.value.length <= 128)

// entrar/criar conta já com o e-mail do convite e voltar para esta página depois
const authTarget = (name: 'Login' | 'Register') => ({
  name,
  query: { redirect: route.fullPath, ...(preview.value && { email: preview.value.email }) },
})
const sameAccount = computed(
  () => !!auth.user && auth.user.email.toLowerCase() === preview.value?.email.toLowerCase(),
)
const expires = computed(() =>
  preview.value
    ? new Date(preview.value.expires_at).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
      })
    : '',
)

async function load() {
  loading.value = true
  problem.value = null
  preview.value = null
  if (!validToken.value) {
    loading.value = false
    return
  }
  try {
    const [, info] = await Promise.all([
      auth.loadUser().catch(() => undefined),
      previewInvitation(token.value),
    ])
    preview.value = info
  } catch (error) {
    problem.value = inviteProblem(error)
  } finally {
    loading.value = false
  }
}

async function accept() {
  if (saving.value || !auth.user) return
  saving.value = true
  problem.value = null
  try {
    const { organization_id } = await acceptInvitation(token.value)
    await organizations.load()
    organizations.select(organization_id)
    await router.replace('/')
  } catch (error) {
    problem.value = inviteProblem(error)
  } finally {
    saving.value = false
  }
}

// sai da conta atual e segue para entrar/criar a conta do e-mail convidado
async function switchAccount(name: 'Login' | 'Register') {
  saving.value = true
  try {
    await auth.signOut()
    await router.replace(authTarget(name))
  } catch {
    problem.value = { code: 'network', message: 'Não foi possível sair da conta. Tente novamente.' }
  } finally {
    saving.value = false
  }
}

watch(token, load, { immediate: true })
</script>

<template>
  <OrganizationLayout title="Convite">
    <section class="workspace-card invitation-accept" aria-labelledby="accept-title">
      <h1 id="accept-title">
        {{ preview ? `Entrar em ${preview.organization_name}` : 'Convite para uma organização' }}
      </h1>

      <p v-if="!validToken">
        Este link está incompleto ou é inválido. Abra o link completo do e-mail de convite.
      </p>
      <p v-else-if="loading" role="status">Abrindo o convite…</p>

      <template v-else-if="preview">
        <p>
          Você foi convidado como <strong>{{ roleLabels[preview.role].toLowerCase() }}</strong> para
          <strong>{{ preview.organization_name }}</strong
          >, no e-mail <strong>{{ preview.email }}</strong
          >. Válido até {{ expires }}.
        </p>

        <!-- sem sessão -->
        <template v-if="!auth.user">
          <template v-if="preview.has_account">
            <p>Entre com a sua conta para aceitar.</p>
            <div class="workspace-actions">
              <RouterLink :to="authTarget('Login')" class="workspace-link-button"
                >Entrar para aceitar</RouterLink
              >
            </div>
          </template>
          <template v-else>
            <p role="status">
              <strong>Ainda não existe uma conta para {{ preview.email }}.</strong> Crie a sua em um
              minuto; depois você volta direto para este convite.
            </p>
            <div class="workspace-actions">
              <RouterLink :to="authTarget('Register')" class="workspace-link-button"
                >Criar minha conta</RouterLink
              >
            </div>
            <p class="workspace-muted">
              Já tem conta com outro e-mail? Ela não pode aceitar este convite.
              <RouterLink :to="authTarget('Login')">Entrar mesmo assim</RouterLink>
            </p>
          </template>
        </template>

        <!-- conta certa -->
        <div v-else-if="sameAccount" class="workspace-actions">
          <BaseButton
            label="Aceitar convite"
            :loading="saving"
            :full-width="false"
            @click="accept"
          />
        </div>

        <!-- conta errada -->
        <template v-else>
          <p role="alert" class="workspace-error">
            Você está usando <strong>{{ auth.user.email }}</strong
            >, mas o convite é para <strong>{{ preview.email }}</strong
            >.
          </p>
          <div class="workspace-actions">
            <BaseButton
              v-if="preview.has_account"
              :label="`Entrar com ${preview.email}`"
              :loading="saving"
              :full-width="false"
              @click="switchAccount('Login')"
            />
            <BaseButton
              v-else
              label="Criar conta para este e-mail"
              :loading="saving"
              :full-width="false"
              @click="switchAccount('Register')"
            />
          </div>
        </template>
      </template>

      <template v-if="problem">
        <p role="alert" class="workspace-error">{{ problem.message }}</p>
        <div class="workspace-actions">
          <BaseButton
            v-if="problem.code === 'network' || problem.code === 'unknown'"
            label="Tentar novamente"
            :full-width="false"
            @click="preview ? accept() : load()"
          />
          <RouterLink
            v-else-if="auth.user"
            to="/"
            class="workspace-link-button secondary"
            >Ir para o início</RouterLink
          >
          <RouterLink v-else :to="{ name: 'Login' }" class="workspace-link-button secondary"
            >Entrar</RouterLink
          >
        </div>
      </template>
    </section>
  </OrganizationLayout>
</template>
