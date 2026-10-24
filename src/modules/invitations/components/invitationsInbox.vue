<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { getErrorMessage } from '@/app/plugins/axios'
import { BaseButton } from '@/shared/components'
import { roleLabels, useOrganizationsStore } from '@/modules/organizations'
import { useInvitationsStore } from '../stores'

/* Convites recebidos: aceitar ou recusar sem sair do app (não precisa do link do e-mail). */
const invitations = useInvitationsStore()
const organizations = useOrganizationsStore()
const router = useRouter()
const busy = ref('')

const expires = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')

async function accept(id: string, name: string) {
  busy.value = id
  try {
    const organizationId = await invitations.acceptMine(id)
    await organizations.load()
    organizations.select(organizationId)
    toast.success(`Você entrou em ${name}.`)
    await router.push('/home-usuario')
  } catch (error) {
    toast.error(
      getErrorMessage(
        error,
        'Não foi possível aceitar. O convite pode ter expirado ou sido revogado.',
      ),
    )
    await invitations.loadMine().catch(() => undefined)
  } finally {
    busy.value = ''
  }
}

async function decline(id: string, name: string) {
  if (!window.confirm(`Recusar o convite para ${name}?`)) return
  busy.value = id
  try {
    await invitations.decline(id)
    toast.success('Convite recusado.')
  } catch (error) {
    toast.error(getErrorMessage(error, 'Não foi possível recusar o convite.'))
  } finally {
    busy.value = ''
  }
}
</script>

<template>
  <section
    v-if="invitations.mine.length"
    aria-labelledby="invitations-inbox-title"
    class="grid gap-3 rounded-[16px] border border-(--bg-orange) bg-(--bg-orange)/5 p-4"
  >
    <h2
      id="invitations-inbox-title"
      class="text-[15px]! leading-normal! font-semibold! tracking-normal!"
    >
      {{
        invitations.mine.length === 1
          ? 'Você foi convidado para uma organização'
          : `Você tem ${invitations.mine.length} convites de organizações`
      }}
    </h2>
    <ul class="grid gap-2">
      <li
        v-for="invitation in invitations.mine"
        :key="invitation.id"
        class="flex flex-wrap items-center gap-3 rounded-xl bg-(--surface) px-4 py-3 dark:bg-(--surface-inverse)"
      >
        <span
          class="grid size-9 shrink-0 place-items-center rounded-lg bg-(--background-inverse) text-sm font-bold text-(--text-inverse) dark:bg-white/15"
          aria-hidden="true"
          >{{ invitation.organization_name.charAt(0).toUpperCase() }}</span
        >
        <span class="min-w-0 flex-1">
          <span class="block truncate text-[14px] font-semibold">{{
            invitation.organization_name
          }}</span>
          <span class="block text-[12.5px] text-(--text-muted)">
            Como {{ roleLabels[invitation.role].toLowerCase() }} · válido até
            {{ expires(invitation.expires_at) }}
          </span>
        </span>
        <BaseButton
          label="Recusar"
          variant="ghost"
          size="sm"
          :full-width="false"
          :disabled="busy === invitation.id"
          @click="decline(invitation.id, invitation.organization_name)"
        />
        <BaseButton
          label="Aceitar convite"
          size="sm"
          :full-width="false"
          :loading="busy === invitation.id"
          @click="accept(invitation.id, invitation.organization_name)"
        />
      </li>
    </ul>
  </section>
</template>
