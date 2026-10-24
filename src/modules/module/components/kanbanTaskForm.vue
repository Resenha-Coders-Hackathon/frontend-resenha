<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { BaseButton } from '@/shared/components'
import { getErrorMessage } from '@/app/plugins/axios'
import { fetchAllPages } from '@/shared/utils'
import { useKanbanStore } from '../stores'
import { listSectorMembers } from '../services'
import type { SectorMember, TaskPriority } from '../types'
import { priorityLabels } from '../utils/kanban'
import KanbanDialog from './kanbanDialog.vue'
interface Props {
  statusId: string
}
const props = defineProps<Props>()
const emit = defineEmits<{ close: []; created: [id: string] }>()
const board = useKanbanStore()
const saving = ref(false)
const error = ref('')
const members = ref<SectorMember[]>([])
const form = reactive({
  title: '',
  description: '',
  status: props.statusId,
  priority: 'medium' as TaskPriority,
  due_date: '',
  assignee: '',
})
onMounted(async () => {
  if (!board.sectorId) return
  try {
    members.value = await fetchAllPages((page) => listSectorMembers(board.sectorId!, page))
  } catch (cause) {
    error.value = getErrorMessage(cause, 'Não foi possível carregar os responsáveis.')
  }
})
async function save() {
  if (!form.title.trim() || saving.value) return
  saving.value = true
  error.value = ''
  try {
    const task = await board.addTask({
      ...form,
      title: form.title.trim(),
      due_date: form.due_date || null,
      assignee: form.assignee || null,
    })
    emit('created', task.id)
  } catch (cause) {
    error.value = getErrorMessage(cause, 'Não foi possível criar a tarefa.')
  } finally {
    saving.value = false
  }
}
</script>
<template>
  <KanbanDialog title="Nova tarefa" @close="!saving && emit('close')">
    <form class="grid gap-4" @submit.prevent="save">
      <label class="kb-label"
        >Título<input
          v-model="form.title"
          class="kb-input"
          required
          maxlength="255"
          placeholder="O que precisa ser feito?"
          autofocus
          :disabled="saving"
      /></label>
      <label class="kb-label"
        >Descrição<textarea
          v-model="form.description"
          class="kb-input"
          rows="3"
          placeholder="Adicione contexto para a equipe"
          :disabled="saving"
        ></textarea>
      </label>
      <div class="grid gap-4 sm:grid-cols-2">
        <label class="kb-label"
          >Status<select v-model="form.status" class="kb-input" required :disabled="saving">
            <option v-for="status in board.statuses" :key="status.id" :value="status.id">
              {{ status.name }}
            </option>
          </select></label
        ><label class="kb-label"
          >Prioridade<select v-model="form.priority" class="kb-input" :disabled="saving">
            <option v-for="(label, key) in priorityLabels" :key="key" :value="key">
              {{ label }}
            </option>
          </select></label
        >
      </div>
      <label class="kb-label"
        >Responsável<select v-model="form.assignee" class="kb-input" :disabled="saving">
          <option value="">Sem responsável</option>
          <option v-for="member in members" :key="member.user_id" :value="member.user_id">
            {{ member.name }}
          </option>
        </select></label
      >
      <label class="kb-label"
        >Data de entrega<input
          v-model="form.due_date"
          type="date"
          class="kb-input"
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
          label="Criar tarefa"
          :full-width="false"
          :loading="saving"
          :disabled="!form.title.trim()"
        />
      </div>
    </form>
  </KanbanDialog>
</template>
