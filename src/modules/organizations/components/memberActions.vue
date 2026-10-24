<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { getErrorMessage } from '@/app/plugins/axios'
import { useAuthStore } from '@/modules/auth'
import type { Organization, OrganizationMember, OrganizationRole } from '../types'
import { removeMember, updateMemberRole } from '../services'
import { useOrganizationsStore } from '../stores'
import { roleLabels } from '../utils'
import { canManageMember, assignableRoles } from '../utils/permissions'

const props = defineProps<{ organization: Organization; member: OrganizationMember }>()
const emit = defineEmits<{ changed: [] }>()
const auth = useAuthStore()
const router = useRouter()
const store = useOrganizationsStore()
const saving = ref(false)
const error = ref('')
const isSelf = computed(() => props.member.user_id === auth.user?.id)
const canEdit = computed(() => canManageMember(props.organization.current_role, props.member.role))
const options = computed(() => assignableRoles(props.organization.current_role))

async function changeRole(event: Event) {
  const input = event.target as HTMLSelectElement
  const role = options.value.find((value) => value === input.value)
  if (!role || saving.value) return
  await save(role)
  input.value = props.member.role
}

async function save(role?: OrganizationRole) {
  if (saving.value) return
  const organizationId = props.organization.id
  const memberId = props.member.id
  const leaving = !role && isSelf.value
  if (
    !role &&
    !window.confirm(
      leaving
        ? 'Sair desta organização? Você perderá o acesso aos seus times e setores.'
        : `Remover ${props.member.name || props.member.email} da organização? Os acessos aos times e setores serão revogados.`,
    )
  )
    return
  saving.value = true
  error.value = ''
  try {
    if (role) await updateMemberRole(organizationId, memberId, { role })
    else await removeMember(organizationId, memberId)
    if (props.organization.id !== organizationId) return
    toast.success(role ? 'Papel atualizado.' : 'Participação removida.')
    if (leaving) {
      await store.load()
      await router.push({ name: 'Organizations' })
    } else emit('changed')
  } catch (cause) {
    if (props.organization.id === organizationId)
      error.value = getErrorMessage(cause, 'Não foi possível alterar a participação.')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div v-if="canEdit || (isSelf && member.role !== 'owner')" class="admin-row">
    <select
      v-if="canEdit"
      :value="member.role"
      :aria-label="`Alterar papel de ${member.name || member.email}`"
      :disabled="saving"
      @change="changeRole"
    >
      <option v-for="role in options" :key="role" :value="role">{{ roleLabels[role] }}</option>
    </select>
    <button :disabled="saving" @click="save()">
      {{ isSelf ? 'Sair da organização' : 'Remover membro' }}
    </button>
    <p v-if="error" role="alert">{{ error }}</p>
  </div>
</template>
