<script setup lang="ts">
import { reactive, ref } from 'vue'
import { BaseButton } from '@/shared/components'
import { getErrorMessage } from '@/app/plugins/axios'
import { useKanbanStore } from '../stores'
import type { Status, StatusCategory } from '../types'
import KanbanDialog from './kanbanDialog.vue'

interface Props {
  status?: Status
}
const props = defineProps<Props>()
const emit = defineEmits<{ close: [] }>()
const board = useKanbanStore()
const saving = ref(false)
const error = ref('')
const form = reactive({
  name: props.status?.name ?? '',
  color: props.status?.color || '#64748b',
  category: props.status?.category ?? ('todo' as StatusCategory),
  wip_limit: props.status?.wip_limit ?? null,
})
async function save() {
  if (!form.name.trim() || saving.value) return
  saving.value = true
  error.value = ''
  try {
    const payload = { ...form, name: form.name.trim(), wip_limit: form.wip_limit || null }
    if (props.status) await board.editStatus(props.status.id, payload)
    else
      await board.addStatus({
        ...payload,
        position: Math.max(-1, ...board.statuses.map((status) => status.position)) + 1,
      })
    emit('close')
  } catch (cause) {
    error.value = getErrorMessage(cause, 'Não foi possível salvar a coluna.')
  } finally {
    saving.value = false
  }
}
</script>
<template>
  <KanbanDialog
    :title="status ? 'Personalizar coluna' : 'Nova coluna'"
    @close="!saving && emit('close')"
  >
    <form class="grid gap-4" @submit.prevent="save">
      <label class="kb-label"
        >Nome da coluna<input
          v-model="form.name"
          class="kb-input"
          required
          maxlength="80"
          placeholder="Ex.: Em revisão"
          autofocus
          :disabled="saving"
      /></label>
      <div class="grid grid-cols-[auto_1fr] gap-4">
        <label class="kb-label"
          >Cor<input
            v-model="form.color"
            type="color"
            class="h-10 w-16 cursor-pointer rounded-lg"
            :disabled="saving" /></label
        ><label class="kb-label"
          >Categoria<select v-model="form.category" class="kb-input" :disabled="saving">
            <option value="todo">A fazer</option>
            <option value="in_progress">Em andamento</option>
            <option value="done">Concluído</option>
          </select></label
        >
      </div>
      <p class="text-xs text-(--kanban-muted)">
        A categoria define se as tarefas desta coluna estão abertas ou concluídas.
      </p>
      <label class="kb-label"
        >Limite de tarefas (opcional)<input
          v-model.number="form.wip_limit"
          type="number"
          class="kb-input"
          min="1"
          step="1"
          placeholder="Sem limite"
          :disabled="saving"
      /></label>
      <p v-if="error" role="alert" class="kb-error">{{ error }}</p>
      <div class="flex justify-end gap-2">
        <BaseButton
          class="mt-0!"
          label="Cancelar"
          variant="secondary"
          :full-width="false"
          :disabled="saving"
          @click="emit('close')"
        /><BaseButton
          class="mt-0!"
          type="submit"
          :label="status ? 'Salvar coluna' : 'Criar coluna'"
          :full-width="false"
          :loading="saving"
          :disabled="!form.name.trim()"
        />
      </div>
    </form>
  </KanbanDialog>
</template>
